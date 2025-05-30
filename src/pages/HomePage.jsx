// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineSearch,
  HiOutlineChatAlt2,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineLockClosed
} from 'react-icons/hi';
import { motion } from 'framer-motion';

// Helper to decode JWT payload
function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export default function HomePage() {
  const [role, setRole] = useState(null);
  const [metrics, setMetrics] = useState({
    documentsProcessed: 0,
    queriesToday: 0,
    activeUsers: 0
  });

  // Decode role from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && token.split('.').length === 3) {
      const { role } = decodeToken(token);
      if (role) setRole(role);
    }
  }, []);

  // Simulate metrics fetch
  useEffect(() => {
    setMetrics({ documentsProcessed: 128, queriesToday: 54, activeUsers: 12 });
  }, []);

  const features = [
    {
      title: 'Document Search',
      path: '/upload',
      icon: <HiOutlineSearch size={36} />,
      description: 'Securely upload and search your documents',
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      title: 'Interactive Chatbot',
      path: '/chatbot',
      icon: <HiOutlineChatAlt2 size={36} />,
      description: 'Chat with our AI assistant',
      gradient: 'from-green-400 to-teal-500'
    },
    {
      title: 'Analytics Dashboard',
      path: '/analytics',
      icon: <HiOutlineChartBar size={36} />,
      description: 'View real-time usage analytics',
      gradient: 'from-yellow-400 to-orange-400'
    },
    {
      title: 'User Management',
      path: role === 'Admin' ? '/admin' : '#',
      icon: role === 'Admin'
        ? <HiOutlineUserGroup size={36} />
        : <HiOutlineLockClosed size={36} />,
      description: role === 'Admin'
        ? 'Manage application users'
        : 'Admins only',
      gradient: role === 'Admin'
        ? 'from-red-500 to-red-600'
        : 'from-gray-300 to-gray-400',
      disabled: role !== 'Admin'
    }
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-extrabold text-current">
          RAG System for{' '}
          <span className="text-indigo-800 dark:text-indigo-300">
            Organizations
          </span>
        </h1>
        <p className="mt-4 text-lg text-current/75 max-w-2xl mx-auto">
          AI-powered Retrieval-Augmented Generation platform for secure document
          search, chatbot assistance, and analytics.
        </p>
        {role && (
          <p className="mt-2 text-indigo-800 dark:text-indigo-300">
            Logged in as: <strong>{role}</strong>
          </p>
        )}
      </motion.div>


        {/* metrics */}
     <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
  {Object.entries(metrics).map(([key, value]) => (
    <motion.div
      key={key}
      whileHover={{ scale: 1.05 }}
      className={`
        flex flex-col items-center rounded-xl shadow-lg p-6 transition-all duration-300
        bg-white text-gray-800 
        dark:bg-gradient-to-br dark:from-teal-700 dark:to-purple-800 dark:text-white
      `}
    >
      <span className="text-3xl font-bold text-indigo-600 dark:text-white">
        {value}
      </span>
      <span className="mt-2 uppercase text-sm text-gray-600 dark:text-gray-200">
        {key.replace(/([A-Z])/g, ' $1')}
      </span>
    </motion.div>
  ))}
</div>






{/* Feature Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
  {features.map(feat => {
    const cardContent = (
      <motion.div
        whileHover={{ y: -5 }}
        className={`relative block rounded-2xl p-6 text-white shadow-xl transition-transform ${
          feat.disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
        }`}
      >
        {/* Gradient background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${feat.gradient} rounded-2xl`}
        />
        <div className="relative z-10 flex flex-col h-full">
          <div className="bg-white bg-opacity-30 p-3 rounded-full mb-4">
            {feat.icon}
          </div>
          <h2 className="text-xl font-semibold mb-1">{feat.title}</h2>
          <p className="text-sm mb-4 opacity-90">{feat.description}</p>
          {!feat.disabled && (
            <span className="mt-auto inline-block px-4 py-2 bg-white bg-opacity-90 text-indigo-600 rounded-lg font-medium hover:bg-opacity-100 transition">
              Explore →
            </span>
          )}
        </div>
      </motion.div>
    );

    return feat.disabled ? (
      <div key={feat.title}>{cardContent}</div>
    ) : (
      <Link to={feat.path} key={feat.title}>
        {cardContent}
      </Link>
    );
  })}
</div>

    </div>
  );
}
