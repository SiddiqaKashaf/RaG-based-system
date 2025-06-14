import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  HiOutlineSearch,
  HiOutlineChatAlt2,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineLockClosed,
  HiOutlineDocumentText,
  HiOutlineLightBulb,
  HiOutlineClock,
  HiOutlineShare,
  HiOutlineTag,
  HiOutlineBookmark,
  HiOutlineCollection,
  HiOutlineUpload,
  HiOutlineBell,
  HiOutlineExclamationCircle,
  HiOutlineQuestionMarkCircle
} from 'react-icons/hi';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

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
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  // Simulated notifications and activity for demo
  const [notifications] = useState([
    { type: 'info', message: 'System maintenance scheduled for Sunday 2am.' },
    { type: 'alert', message: '1 user pending approval.' }
  ]);
  const [recentActivity] = useState([
    { type: 'upload', detail: 'Uploaded "Q2_report.pdf"', time: '2 hours ago' },
    { type: 'query', detail: 'Searched for "HR policy"', time: '5 hours ago' },
    { type: 'chat', detail: 'Chatted with AI Assistant', time: '1 day ago' }
  ]);
  const [orgActivity] = useState([
    { user: 'Alice', action: 'Uploaded "sales.xlsx"', time: '1 hour ago' },
    { user: 'Bob', action: 'Searched for "client list"', time: '3 hours ago' },
    { user: 'Admin', action: 'Added new user', time: 'yesterday' }
  ]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.role) setRole(decoded.role.toLowerCase());
      if (decoded && (decoded.username || decoded.name)) setUsername(decoded.username || decoded.name);
    }
    setLoading(false);
  }, []);

  const features = [
    {
      title: 'AI Assistant',
      path: '/chatbot',
      icon: <HiOutlineChatAlt2 size={28} />,
      description: 'Chat with our AI assistant',
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      title: 'Analytics Dashboard',
      path: '/analytics',
      icon: <HiOutlineChartBar size={28} />,
      description: 'View usage analytics',
      gradient: 'from-yellow-400 to-orange-400'
    },
    {
      title: 'User Management',
      path: role === 'admin' ? '/admin/users' : '#',
      icon: role === 'admin'
        ? <HiOutlineUserGroup size={28} />
        : <HiOutlineLockClosed size={28} />,
      description: role === 'admin'
        ? 'Manage users'
        : 'Admins only',
      gradient: role === 'admin'
        ? 'from-red-500 to-red-600'
        : 'from-gray-300 to-gray-400',
      disabled: role !== 'admin'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Hero Section: RAG System branding and tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6"
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
      </motion.div>

      {/* Subtle Welcome and Role Badge */}
      <div className="text-center mb-8">
        {username && (
          <div className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-1">
            Welcome back, {username}!
          </div>
        )}
        {role && (
          <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 rounded-full text-xs font-semibold">
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        )}
      </div>

      {/* Notifications/Alerts */}
      {role === 'admin' && notifications.length > 0 && (
        <div className="mb-8 flex flex-col items-center">
          {notifications.map((n, i) => (
            <div key={i} className={`flex items-center gap-2 mb-2 px-4 py-2 rounded-lg shadow text-sm ${n.type === 'alert' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' : 'bg-indigo-50 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'}`}>
              {n.type === 'alert' ? <HiOutlineExclamationCircle /> : <HiOutlineBell />} {n.message}
            </div>
          ))}
        </div>
      )}

      {/* Recent Activity */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <HiOutlineDocumentText className="text-indigo-500" />
          {role === 'admin' ? 'Recent Organization Activity' : 'Your Recent Activity'}
        </h2>
        <div className="space-y-3">
          {(role === 'admin' ? orgActivity : recentActivity).map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-white dark:bg-indigo-500/10 rounded-lg p-3 shadow-sm">
              <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-500/20">
                {item.type === 'upload' ? <HiOutlineUpload /> :
                 item.type === 'query' ? <HiOutlineSearch /> :
                 item.type === 'chat' ? <HiOutlineChatAlt2 /> :
                 item.user ? <HiOutlineUserGroup /> :
                 <HiOutlineDocumentText />}
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  {role === 'admin'
                    ? <><span className="font-medium">{item.user}</span> {item.action}</>
                    : item.detail}
                </p>
                <span className="text-xs text-gray-500">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Cards (Single Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
        {features.map(feat => {
          const cardContent = (
            <motion.div
              whileHover={{ y: -5 }}
              className={`relative block rounded-2xl p-6 text-white shadow-xl transition-transform ${
                feat.disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
              }`}
            >
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

      {/* Need Help Card */}
      <div className="flex justify-center">
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-indigo-500/10 rounded-xl shadow text-indigo-700 dark:text-indigo-200">
          <HiOutlineQuestionMarkCircle className="text-2xl" />
          <div>
            <div className="font-semibold">Need Help?</div>
            <a href="/help" className="underline">Visit Documentation & Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
