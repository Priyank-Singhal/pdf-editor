import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pdfFile: null,
  pdfUrl: null,
  extractedText: [],
  selectedText: null,
  editedText: ''
};

const pdfSlice = createSlice({
  name: 'pdf',
  initialState,
  reducers: {
    setPdfFile: (state, action) => {
      state.pdfFile = action.payload;
    },
    setPdfUrl: (state, action) => {
      state.pdfUrl = action.payload;
    },
    setExtractedText: (state, action) => {
      state.extractedText = action.payload;
    },
    setSelectedText: (state, action) => {
      state.selectedText = action.payload;
    },
    setEditedText: (state, action) => {
      state.editedText = action.payload;
    }
  }
});

export const {
  setPdfFile,
  setPdfUrl,
  setExtractedText,
  setSelectedText,
  setEditedText
} = pdfSlice.actions;
export default pdfSlice.reducer;