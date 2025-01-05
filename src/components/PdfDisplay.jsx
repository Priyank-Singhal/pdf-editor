import React from 'react'
import { useSelector } from 'react-redux';

const PdfDisplay = () => {
    const { darkMode } = useSelector(state => state.ui);
    const { pdfUrl } = useSelector(state => state.pdf);
    return (
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
    )
}

export default PdfDisplay