// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:8000/login', {
        email,
        password
      });

      const token = res.data.access_token;
      localStorage.setItem('token', token);
      onLogin();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gradient-to-br dark:from-inherit- dark:to-purple-950 text-gray-800 dark:text-white rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center text-indigo-700 dark:text-white mb-6">
          Welcome Back
        </h2>

        {error && (
          <p className="text-red-500 bg-red-100 dark:bg-red-700 dark:text-white text-sm p-2 rounded mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-200 text-gray-900 dark:text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-200 text-gray-900 dark:text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-600 hover:underline dark:text-indigo-300">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
