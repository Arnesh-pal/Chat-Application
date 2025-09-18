import React, { useState, useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase.js';

const ChatPage = ({ user }) => {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [vanishEnabled, setVanishEnabled] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to the bottom of the chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const appId = 'default-app-id';
        const messagesCollectionRef = collection(db, `artifacts/${appId}/users/${user.uid}/chat_messages`);
        const messagesQuery = query(messagesCollectionRef, orderBy('timestamp'));

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(fetchedMessages);
        }, (err) => {
            console.error("Error fetching messages:", err);
        });

        return () => unsubscribe();
    }, [user]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (messageInput.trim() === "") return;

        try {
            const appId = 'default-app-id';
            const docRef = await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/chat_messages`), {
                text: messageInput,
                timestamp: new Date(),
                userId: user.uid
            });
            setMessageInput('');

            if (vanishEnabled) {
                setTimeout(() => {
                    deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/chat_messages/${docRef.id}`))
                        .catch(e => console.error("Error deleting vanishing message:", e));
                }, 15000);
            }

        } catch (e) {
            console.error("Error adding document:", e);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (e) {
            console.error("Logout failed:", e);
        }
    };

    return (
        <div className="bg-gray-900 text-white w-full h-screen overflow-hidden flex flex-col animate-fade-in md:w-3/4 lg:w-1/2">
            <header className="bg-gray-900 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between shadow-lg border-b-2 border-indigo-700">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <h1 className="text-xl font-semibold text-indigo-400">Your Private Chat Log</h1>
                    <div className="flex items-center space-x-2">
                        <label htmlFor="vanish-toggle" className="text-xs font-medium opacity-80 select-none cursor-pointer">Vanishing Messages</label>
                        <input
                            type="checkbox"
                            id="vanish-toggle"
                            checked={vanishEnabled}
                            onChange={() => setVanishEnabled(!vanishEnabled)}
                            className="form-checkbox h-4 w-4 text-indigo-500 rounded-md border-gray-600 bg-gray-700 focus:ring-indigo-500 transition duration-150"
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium opacity-80">
                        {`User ID: ${user.uid.substring(0, 8)}...`}
                    </div>
                    <button onClick={handleLogout} className="bg-gray-700 text-white text-xs rounded-lg px-3 py-1 font-medium hover:bg-gray-600 transition duration-200">
                        Logout
                    </button>
                </div>
            </header>

            <div className="chat-container p-4 space-y-4 flex-grow flex flex-col items-start bg-gray-800 overflow-y-auto">
                {messages.map((msg, index) => {
                    return (
                        <div
                            key={msg.id}
                            className={`message rounded-xl p-3 shadow-md bg-indigo-600 text-white animate-fade-in max-w-[80%]`}
                        >
                            <div className="font-medium text-xs mb-1 opacity-80">You</div>
                            <div>{msg.text}</div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-gray-700 border-t border-gray-600 flex items-center space-x-2">
                <input
                    type="text"
                    name="message"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow rounded-lg border-2 border-gray-600 bg-gray-800 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                />
                <button type="submit" className="bg-indigo-600 text-white rounded-lg px-6 py-2 font-medium hover:bg-indigo-700 transition duration-200 shadow-md">
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatPage;