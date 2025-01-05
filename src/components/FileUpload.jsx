import React from 'react'
import * as pdfjsLib from 'pdfjs-dist';
import { useDispatch, useSelector } from 'react-redux';
import { setExtractedText, setPdfFile, setPdfUrl } from '../store/slices/pdfSlice';

const FileUpload = () => {
    const dispatch = useDispatch();
    const { darkMode } = useSelector(state => state.ui);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        dispatch(setPdfFile(file));
        try {
            const arrayBuffer = await file.arrayBuffer();

            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            // TODO: Select Page dynalically
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

    return (
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
    )
}

export default FileUpload