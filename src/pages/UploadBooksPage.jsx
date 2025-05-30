// src/pages/UploadBooksPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  HiOutlineUpload,
  HiOutlinePaperClip,
  HiOutlineXCircle,
  HiOutlinePaperAirplane,
  HiUser,
  HiOutlineArrowLeft,
  HiRefresh
} from 'react-icons/hi';

import { FaRobot } from 'react-icons/fa';
import { ImSpinner8 } from 'react-icons/im';
import axios from 'axios';


export default function UploadBooksPage() {
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (selected && allowedTypes.includes(selected.type)) {
      setFile(selected);
      setMessages([{ from: 'bot', text: 'Document loaded. Your bot is in progress...' }]);
    } else {
      alert('Only PDF and DOCX files are allowed.');
    }
  };

  const removeFile = () => {
    setFile(null);
    setMessages([]);
    setInput('');
  };

  const resetChat = () => {
    setMessages([{ from: 'bot', text: 'Chat reset. Ask a new question!' }]);
    setInput('');
  };

  const sendMessage = async () => {
    if (!input.trim() || !file) return;
    const userMsg = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('question', input);
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:8000/query-doc',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const botMsg = { from: 'bot', text: res.data.answer };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const botMsg = {
        from: 'bot',
        text: err.response?.status === 404
          ? 'Your bot is under progress.'
          : 'Failed to get answer. Please try again.'
      };
      setMessages(prev => [...prev, botMsg]);
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
<div className="flex items-center justify-between mb-6">

<button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-indigo-600 dark:text-indigo-300 hover:underline"
        >
          <HiOutlineArrowLeft className="text-xl" /> Back
        </button>
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2 
        text-gray-800 dark:text-white">
        <HiOutlineUpload className="text-indigo-500" />
        Upload & Chat
      </h1>
      <div className="w-12" /> {/* spacing placeholder */}
      </div>

      {/* File Upload Section */}
      {!file ? (
        <div className="border-2 border-dashed p-8 text-center rounded-lg 
          border-gray-300 text-gray-600 
          dark:border-white/30 dark:text-white/80">
          <HiOutlinePaperClip className="mx-auto text-4xl text-gray-400 mb-4 animate-pulse dark:text-white/40" />
          <p className="mb-2">Upload a PDF or DOCX to get started</p>
          <button
            className="px-6 py-2 rounded-lg transition 
              bg-indigo-700 text-white hover:bg-indigo-800"
            onClick={() => fileInputRef.current.click()}
          >
            Select File
          </button>
          <input
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <div className="mb-4 flex items-center justify-between p-3 rounded-lg 
          bg-gray-100 dark:bg-white/10 dark:text-white">
          <div className="flex items-center gap-2">
            <HiOutlinePaperClip className="text-indigo-800 dark:text-indigo-300" />
            <span className="truncate mr-2 text-indigo-700 dark:text-indigo-200">{file.name}</span>
            <span className="text-xs text-gray-800 dark:text-gray-300">
              ({(file.size / 1024).toFixed(2)} KB)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={resetChat} title="Reset chat" className="text-yellow-500 hover:text-yellow-600">
              <HiRefresh />
            </button>
            <button onClick={removeFile} title="Remove file" className="text-red-500 hover:text-red-700 dark:hover:text-red-400">
              <HiOutlineXCircle />
            </button>
          </div>
        </div>
      )}

      {/* Chat Section */}
      {file && (
        <div className="flex flex-col h-[400px] border rounded-lg overflow-hidden 
          border-gray-200 dark:border-white/20">
          <div className="flex-1 p-4 overflow-y-auto space-y-4 
            bg-gray-50 dark:bg-white/5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 transition-all duration-300 ease-in-out 
                  ${m.from === 'bot'
                    ? 'self-start flex-row'
                    : 'self-end flex-row-reverse'
                  }`}
              >
                <div className="p-2 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-white">
                  {m.from === 'bot' ? <FaRobot /> : <HiUser />}
                </div>
                <div className={`p-3 rounded-lg max-w-[80%] whitespace-pre-wrap
                  ${m.from === 'bot'
                    ? 'bg-gray-200 text-gray-800 dark:bg-white/10 dark:text-white'
                    : 'bg-indigo-800 text-white dark:bg-indigo-600'
                  }`}
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
            className="flex items-center p-3 border-t 
              border-gray-300 dark:border-white/20"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question..."
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
      )}
    </div>
  );
}
