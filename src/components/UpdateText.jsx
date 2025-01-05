import React from 'react'
import { PDFDocument, rgb } from 'pdf-lib';
import { useDispatch, useSelector } from 'react-redux';
import { setEditedText, setExtractedText, setPdfUrl, setSelectedText } from '../store/slices/pdfSlice';

const UpdateText = () => {
    const dispatch = useDispatch();
    const { darkMode } = useSelector(state => state.ui);
    const {
        pdfFile,
        extractedText,
        selectedText,
        editedText
      } = useSelector(state => state.pdf);
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
  )
}

export default UpdateText