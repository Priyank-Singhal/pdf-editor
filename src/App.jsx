import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';
import { Edit2 } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function App() {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [extractedText, setExtractedText] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pageHeight, setPageHeight] = useState(0);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setPdfFile(file);

    const fileReader = new FileReader();
    fileReader.onload = async function() {
      const typedArray = new Uint8Array(this.result);
      try {
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        setPageHeight(viewport.height);
        const textContent = await page.getTextContent();
        
        const texts = textContent.items.map(item => ({
          text: item.str,
          x: item.transform[4],
          y: viewport.height - item.transform[5],
          width: item.width,
          height: item.height
        }));

        setExtractedText(texts);
        setPdfUrl(URL.createObjectURL(file));
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fileReader.readAsArrayBuffer(file);
  };

  const handleUpdateText = async () => {
    if (!pdfFile || !selectedText) return;

    const fileReader = new FileReader();
    fileReader.onload = async function() {
      try {
        const pdfDoc = await PDFDocument.load(this.result);
        const pages = pdfDoc.getPages();
        const page = pages[0];
        const { height } = page.getSize();

        // Calculate correct y-coordinate
        const normalizedY = height - selectedText.y;

        // Cover old text with white rectangle
        page.drawRectangle({
          x: selectedText.x,
          y: normalizedY - 2,
          width: selectedText.text.length * 8,
          height: 14,
          color: rgb(1, 1, 1)
        });

        // Draw new text
        page.drawText(editedText, {
          x: selectedText.x,
          y: normalizedY,
          size: 12,
          color: rgb(0, 0, 0)
        });

        const pdfBytes = await pdfDoc.save();
        const newUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
        setPdfUrl(newUrl);

        const updatedTexts = extractedText.map(item =>
          item === selectedText ? { ...item, text: editedText } : item
        );
        setExtractedText(updatedTexts);
        setSelectedText(null);
      } catch (error) {
        console.error('Error updating PDF:', error);
      }
    };
    fileReader.readAsArrayBuffer(pdfFile);
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
                <Edit2 size={16} className="text-blue-500 opacity-0 hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;