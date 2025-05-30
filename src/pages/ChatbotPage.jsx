// src/pages/ChatbotPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { HiOutlineChatAlt2, HiOutlinePaperAirplane, HiUser } from 'react-icons/hi';
import { FaRobot } from 'react-icons/fa';
import { ImSpinner8 } from 'react-icons/im';
import axios from 'axios';

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:8000/chat',
        { question: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const botMsg = { from: 'bot', text: res.data.answer };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errMsg = err.response?.status === 404
        ? 'Chat service is in progress.'
        : 'Sorry, something went wrong. Please try again.';
      setMessages(prev => [...prev, { from: 'bot', text: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 rounded-3xl shadow-lg 
      bg-white dark:bg-white/10 dark:backdrop-blur-lg dark:shadow-md dark:ring-1 dark:ring-white/20">

      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2 
        text-gray-800 dark:text-white">
        <HiOutlineChatAlt2 className="text-indigo-500" />
        AI Chat Assistant
      </h1>

      <p className="text-sm text-gray-600 dark:text-white/70 mb-4">
        This assistant is here to help new users understand our organization better.
        Ask anything about our services, teams, policies, or how to get started!
      </p>


      <div className="flex flex-col h-[400px] border rounded-lg overflow-hidden 
        border-gray-200 dark:border-white/20">

        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-white/5">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 transition-all duration-300 ease-in-out 
                ${m.from === 'bot' ? 'self-start flex-row' : 'self-end flex-row-reverse'}`}
            >
              <div className="p-2 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-white">
                {m.from === 'bot' ? <FaRobot /> : <HiUser />}
              </div>
              <div className={`p-3 rounded-lg max-w-[80%] whitespace-pre-wrap
                ${m.from === 'bot'
                  ? 'bg-gray-200 text-gray-800 dark:bg-white/10 dark:text-white'
                  : 'bg-indigo-800 text-white dark:bg-indigo-600'}`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center p-3 border-t border-gray-300 dark:border-white/20"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 px-4 py-2 border rounded-lg h-12 resize-none 
              text-black dark:text-white 
              bg-white dark:bg-white/10 
              focus:ring-2 focus:ring-indigo-400 
              border-gray-300 dark:border-white/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="ml-2 p-2 rounded-lg transition 
              bg-indigo-600 text-white hover:bg-indigo-700 
              disabled:opacity-50"
          >
            {loading ? <ImSpinner8 className="animate-spin" /> : <HiOutlinePaperAirplane size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}
