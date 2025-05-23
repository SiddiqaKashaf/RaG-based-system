// src/pages/ChatbotPage.jsx
import React, { useState } from 'react';
import { HiOutlineChatAlt2 } from 'react-icons/hi';

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: 'user', text: input }]);
    // simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: 'I am processing your request...' }]);
    }, 500);
    setInput('');
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <HiOutlineChatAlt2 className="text-indigo-500" /> Interactive Chatbot
      </h1>
      <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg ${m.from === 'bot' ? 'bg-gray-100 text-gray-800' : 'bg-indigo-100 text-indigo-800'} max-w-md`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-grow px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
          placeholder="Type your question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}




