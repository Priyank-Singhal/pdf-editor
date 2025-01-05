import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import React from 'react'
import DarkModeButton from './DarkModeButton';
import { useDispatch, useSelector } from 'react-redux';

const Header = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const handleGoogleSignIn = async () => {
        try {
            const googleAuthProvider = new GoogleAuthProvider();
            googleAuthProvider.setCustomParameters({
                prompt: "select_account"
            });
            const result = await signInWithPopup(auth, googleAuthProvider);
            dispatch(setUser({
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoURL
            }));
        } catch (error) {
            dispatch(setError(error.message));
        }
    };

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            dispatch(logout());
        } catch (error) {
            dispatch(setError(error.message));
        }
    };


    return (
        <div className="flex justify-between items-center mb-4">
            <DarkModeButton />
            {!user ? (
                <button
                    onClick={handleGoogleSignIn}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Sign in with Google
                </button>
            ) : (
                <div className="flex items-center gap-4">
                    <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full"
                    />
                    <span>{user.displayName}</span>
                    <button
                        onClick={handleSignOut}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    )
}

export default Header