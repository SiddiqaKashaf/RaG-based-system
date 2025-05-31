import React, { useState } from 'react';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function ContactPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Optionally, integrate with backend here
    // await axios.post('/api/contact', { email, message });

    toast.success('Message sent successfully!');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 rounded-3xl shadow-lg
      bg-white dark:bg-indigo-500/5 dark:backdrop-blur-lg dark:shadow-md dark:ring-1 dark:ring-white/20"
    >
      <div className="flex items-center justify-between mb-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-indigo-600 dark:text-indigo-300 hover:underline mb-6"
      >
        <HiOutlineArrowLeft className="text-xl" />
        Back
        
      </button>

      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-indigo-100">
        Contact Support
      </h1>
      <div className="w-12" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 text-gray-700 dark:text-indigo-100">
            Your Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded-xl bg-gray-100 border border-gray-300 text-gray-800 
              dark:bg-indigo-500/10 dark:border-indigo-300 dark:text-indigo-100 
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block mb-2 text-gray-700 dark:text-indigo-100">
            Message
          </label>
          <textarea
            rows="5"
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            className="w-full p-3 rounded-xl bg-gray-100 border border-gray-300 text-gray-800 
              dark:bg-indigo-500/10 dark:border-indigo-300 dark:text-indigo-100 
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="How can we help?"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 
            transition duration-200 dark:bg-indigo-600 dark:hover:bg-indigo-500"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
