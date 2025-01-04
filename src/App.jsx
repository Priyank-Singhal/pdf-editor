import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';
import { auth } from './utils/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { setUser, setError, logout } from './store/slices/authSlice';
import {
  setPdfFile,
  setPdfUrl,
  setExtractedText,
  setSelectedText,
  setEditedText
} from './store/slices/pdfSlice';
import { toggleDarkMode } from './store/slices/uiSlice';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const {
    pdfFile,
    pdfUrl,
    extractedText,
    selectedText,
    editedText
  } = useSelector(state => state.pdf);
  const { darkMode } = useSelector(state => state.ui);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        dispatch(setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }));
      } else {
        dispatch(logout());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const handleGoogleSignIn = async () => {
    try {
      const googleAuthProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, googleAuthProvider);
      dispatch(setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      }));
    } catch (error) {
      dispatch(setError(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      dispatch(logout());
    } catch (error) {
      dispatch(setError(error.message));
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    dispatch(setPdfFile(file));
    try {
      const arrayBuffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 });

      const textContent = await page.getTextContent();
      const texts = textContent.items.map(item => ({
        text: item.str,
        x: item.transform[4],
        y: viewport.height - item.transform[5], // Store y-coordinate from top
        fontSize: item.height || 12,
        width: item.width || item.str.length * 5,
        originalY: item.transform[5]
      }));

      dispatch(setExtractedText(texts));
      dispatch(setPdfUrl(URL.createObjectURL(file)));

    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  };

  const handleUpdateText = async () => {
    if (!pdfFile || !selectedText) return;

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const page = pdfDoc.getPages()[0];
      const { height } = page.getSize();

      console.log('Updating text:', {
        text: selectedText.text,
        newText: editedText,
        x: selectedText.x,
        y: selectedText.originalY,
        height: height
      });

      // White out the original text
      page.drawRectangle({
        x: selectedText.x,
        y: selectedText.originalY - 2,
        width: selectedText.width + 4,
        height: selectedText.fontSize + 4,
        color: rgb(1, 1, 1)
      });

      // Add new text at the same position
      page.drawText(editedText, {
        x: selectedText.x,
        y: selectedText.originalY,
        size: selectedText.fontSize,
        color: rgb(0, 0, 0)
      });

      const modifiedPdfBytes = await pdfDoc.save();
      const newUrl = URL.createObjectURL(
        new Blob([modifiedPdfBytes], { type: 'application/pdf' })
      );
      dispatch(setPdfUrl(newUrl));

      dispatch(setExtractedText(
        extractedText.map(item =>
          item === selectedText ? { ...item, text: editedText } : item
        )
      ));
      dispatch(setSelectedText(null));
      dispatch(setEditedText(''));

    } catch (error) {
      console.error('Error updating PDF:', error);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => dispatch(toggleDarkMode())}
            className={`px-4 py-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'
              }`}
          >
            {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
          </button>

          {!user ? (
            <button
              onClick={handleGoogleSignIn}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Sign in with Google
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full"
              />
              <span>{user.displayName}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        <div className={`p-4 rounded-lg shadow mb-4 ${darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className={`block w-full text-sm file:mr-4 file:py-2 file:px-4 
              file:rounded-md file:border-0 file:text-sm file:font-semibold 
              ${darkMode
                ? 'text-gray-300 file:bg-gray-700 file:text-white'
                : 'text-gray-500 file:bg-blue-50 file:text-blue-700'
              }`}
          />
        </div>

        {selectedText && (
          <div className={`p-4 rounded-lg shadow mb-4 ${darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
            <div className="flex gap-2">
              <input
                type="text"
                value={editedText}
                onChange={(e) => dispatch(setEditedText(e.target.value))}
                className={`flex-1 p-2 border rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'
                  }`}
                placeholder="Edit text..."
              />
              <button
                onClick={handleUpdateText}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Update PDF
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                className="w-full h-screen border rounded"
                title="PDF Viewer"
              />
            )}
          </div>

          <div className={`p-4 rounded-lg shadow max-h-screen overflow-auto ${darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
            {extractedText.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  dispatch(setSelectedText(item));
                  dispatch(setEditedText(item.text));
                }}
                className={`p-2 rounded flex justify-between items-center cursor-pointer ${darkMode
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-100'
                  }`}
              >
                <span>{item.text}</span>
                <span className={`opacity-0 hover:opacity-100 ${darkMode ? 'text-blue-400' : 'text-blue-500'
                  }`}>
                  Edit
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;