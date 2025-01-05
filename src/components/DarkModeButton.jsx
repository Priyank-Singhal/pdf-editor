import React from 'react'
import { toggleDarkMode } from '../store/slices/uiSlice'
import { useDispatch, useSelector } from 'react-redux';

const DarkModeButton = () => {
    const dispatch = useDispatch();
    const { darkMode } = useSelector(state => state.ui);

    return (
        <div>
            <button
                onClick={() => dispatch(toggleDarkMode())}
                className={`px-4 py-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'
                    }`}
            >
                {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
            </button>
        </div>
    );
}

export default DarkModeButton;