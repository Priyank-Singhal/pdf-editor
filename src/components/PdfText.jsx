import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setEditedText, setSelectedText } from '../store/slices/pdfSlice';

const PdfText = () => {
    const dispatch = useDispatch();
    const { darkMode } = useSelector(state => state.ui);
    const { extractedText } = useSelector(state => state.pdf);
    return (
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
  )
}

export default PdfText