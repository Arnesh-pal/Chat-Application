import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase.js';

const AuthPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [error, setError] = useState(null);

    const handleAuth = async () => {
        setError(null);
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }

        try {
            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (e) {
            console.error("Authentication failed:", e);
            setError("Authentication failed: " + e.message);
        }
    };

    return (
        <div className="bg-gray-900 text-white rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col items-center animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-indigo-400">{isLoginMode ? 'Login' : 'Sign Up'}</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-700 bg-gray-800 text-white px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-700 bg-gray-800 text-white px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            />
            <button onClick={handleAuth} className="w-full bg-indigo-600 text-white rounded-lg px-6 py-3 font-semibold hover:bg-indigo-700 transition duration-200 shadow-md transform hover:scale-105">
                {isLoginMode ? 'Login' : 'Sign Up'}
            </button>
            <p className="mt-6 text-sm text-gray-400">
                {isLoginMode ? "Don't have an account?" : "Already have an account?"}{' '}
                <button type="button" onClick={() => setIsLoginMode(!isLoginMode)} className="text-indigo-400 hover:underline">
                    {isLoginMode ? 'Sign up' : 'Login'}
                </button>
            </p>
            {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}
        </div>
    );
};

export default AuthPage;