import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import pdfReducer from './slices/pdfSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pdf: pdfReducer,
    ui: uiReducer
  }
});