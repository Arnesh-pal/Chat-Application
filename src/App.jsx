import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import AuthPage from './AuthPage.jsx';
import ChatPage from './ChatPage.jsx';
import { auth } from './firebase.js';

// The main App component that handles authentication-based routing
const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Listen for authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            setUser(authUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="bg-gray-900 flex items-center justify-center h-screen text-gray-400">
                <div className="text-xl font-medium animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 flex items-center justify-center min-h-screen text-gray-200">
            {user ? <ChatPage user={user} /> : <AuthPage />}
        </div>
    );
};

export default App;