import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState = {
  darkMode: Cookies.get('darkMode') === 'true' || false
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      // TODO: Save user preference on Firebase DB
      Cookies.set('darkMode', state.darkMode, {expires: 365});
    }
  }
});

export const { toggleDarkMode } = uiSlice.actions;
export default uiSlice.reducer;