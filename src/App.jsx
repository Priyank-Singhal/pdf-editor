import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as pdfjsLib from 'pdfjs-dist';
import { auth } from './utils/firebase';
import { setUser, logout } from './store/slices/authSlice';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import UpdateText from './components/UpdateText';
import PdfDisplay from './components/PdfDisplay';
import PdfText from './components/PdfText';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function App() {
  const dispatch = useDispatch();
  const { selectedText } = useSelector(state => state.pdf);
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

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-6xl mx-auto p-4">
        <Header />
        <FileUpload />
        {selectedText && <UpdateText />}
        <div className="grid grid-cols-2 gap-4">
          <PdfDisplay />
          <PdfText />
        </div>
      </div>
    </div>
  );
}

export default App;