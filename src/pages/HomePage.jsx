import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineChatAlt2, HiOutlineChartBar, HiOutlineUserGroup } from 'react-icons/hi';

export default function HomePage() {
  // User roles
  const roles = ['Admin', 'Analyst', 'Guest'];
  const [role, setRole] = useState(roles[2]);

  // Dummy metrics for demonstration
  const [metrics, setMetrics] = useState({
    documentsProcessed: 0,
    queriesToday: 0,
    activeUsers: 0,
  });

  // Simulate fetching metrics
  useEffect(() => {
    setMetrics({ documentsProcessed: 128, queriesToday: 54, activeUsers: 12 });
  }, []);

  // Main features
  const options = [
    { title: 'Document Search', path: '/upload', icon: <HiOutlineSearch size={40} /> },
    { title: 'Interactive Chatbot', path: '/chatbot', icon: <HiOutlineChatAlt2 size={40} /> },
    { title: 'Analytics Dashboard', path: '/analytics', icon: <HiOutlineChartBar size={40} /> },
    { title: 'User Management', path: '/admin', icon: <HiOutlineUserGroup size={40} /> },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 bg-white bg-opacity-90 rounded-3xl shadow-lg backdrop-blur-sm">
        <h1 className="text-4xl font-extrabold text-gray-800">RAG System for Organizations</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Securely upload, query, and analyze your company's documents with AI-powered retrieval,
          chatbot assistance, and real-time analytics.
        </p>
        {/* Role selector */}
        <div className="mt-6">
          <label className="mr-2 font-medium text-gray-700">You are:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
          >
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl shadow text-center">
          <h3 className="text-2xl font-bold text-indigo-600">{metrics.documentsProcessed}</h3>
          <p className="text-gray-600 mt-1">Documents Processed</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow text-center">
          <h3 className="text-2xl font-bold text-indigo-600">{metrics.queriesToday}</h3>
          <p className="text-gray-600 mt-1">Queries Today</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow text-center">
          <h3 className="text-2xl font-bold text-indigo-600">{metrics.activeUsers}</h3>
          <p className="text-gray-600 mt-1">Active Users</p>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {options.map((opt) => (
          <Link
            key={opt.path}
            to={opt.path}
            className="flex flex-col items-center justify-center p-8 bg-white bg-opacity-90 rounded-3xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition duration-300 ease-in-out"
          >
            <div className="text-indigo-500 mb-4 animate-bounce">{opt.icon}</div>
            <h2 className="text-xl font-semibold text-gray-800">{opt.title}</h2>
          </Link>
        ))}
      </section>
    </div>
  );
}
