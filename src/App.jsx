import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [extractedText, setExtractedText] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [pageHeight, setPageHeight] = useState(0);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setPdfFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Load with PDF.js for text extraction
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 });
      setPageHeight(viewport.height);
      
      const textContent = await page.getTextContent();
      const texts = textContent.items.map(item => ({
        text: item.str,
        x: item.transform[4],
        y: viewport.height - item.transform[5], // Store y-coordinate from top
        fontSize: item.height || 12,
        width: item.width || item.str.length * 5,
        originalY: item.transform[5] // Store original y-coordinate
      }));

      setExtractedText(texts);
      setPdfUrl(URL.createObjectURL(file));
      
      console.log('Extracted text positions:', texts.map(({text, x, y, originalY}) => ({
        text,
        x,
        y,
        originalY
      })));
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  };

  const handleUpdateText = async () => {
    if (!pdfFile || !selectedText) return;

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
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
      setPdfUrl(newUrl);

      // Update text list
      setExtractedText(texts => 
        texts.map(item => 
          item === selectedText ? { ...item, text: editedText } : item
        )
      );
      setSelectedText(null);
      setEditedText('');

    } catch (error) {
      console.error('Error updating PDF:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
              file:rounded-md file:border-0 file:text-sm file:font-semibold 
              file:bg-blue-50 file:text-blue-700"
          />
        </div>

        {selectedText && (
          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="flex-1 p-2 border rounded"
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
          <div className="bg-white p-4 rounded-lg shadow">
            {pdfUrl && (
              <iframe src={pdfUrl} className="w-full h-screen border rounded" title="PDF Viewer" />
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow max-h-screen overflow-auto">
            {extractedText.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedText(item);
                  setEditedText(item.text);
                }}
                className="p-2 hover:bg-gray-100 rounded flex justify-between items-center cursor-pointer"
              >
                <span>{item.text}</span>
                <span className="text-blue-500 opacity-0 hover:opacity-100">Edit</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;