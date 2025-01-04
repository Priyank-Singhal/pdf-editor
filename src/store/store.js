import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import pdfReducer from './slices/pdfSlice';
import uiReducer from './slices/uiSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui'] // Only persist auth and ui state
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    pdf: pdfReducer,
    ui: uiReducer
  }
});

export const persistor = persistStore(store);