/// src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import NavBar from './components/NavBar';
import Loader from './components/Loader';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import ChatbotPage from './pages/ChatbotPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import UserManagementPage from './pages/UserManagementPage';
import ContactPage from './pages/ContactPage';
import CompanySettingsPage from './pages/CompanySettingsPage';
import AboutPage from './pages/AboutPage';
import NotificationPage from './pages/NotificationPage';
import ProfilePage from './pages/ProfilePage';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [navOpen, setNavOpen] = useState(false);
  const [user, setUser] = useState(null); // Updated: store full user info instead of just avatar

  // Persist & apply theme
  useEffect(() => {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  // Fetch user profile after login
  useEffect(() => {
    if (isLoggedIn) {
      fetch('http://localhost:8000/api/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch profile');
          return res.json();
        })
        .then(data => {
          setUser(data); // store full user data (including avatarUrl)
        })
        .catch(() => {
          setUser(null);
          toast.error('Could not load profile picture');
        });
    } else {
      setUser(null); // Clear user on logout
    }
  }, [isLoggedIn]);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setLoading(false);
      toast.success('Logged in successfully!');
    }, 800);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('access_token');
    toast.info('Logged out.');
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <div className={`min-h-screen transition-colors duration-500 ${dark
        ? 'bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white'
        : 'bg-gradient-to-br from-[#f8f9fa] via-[#e0e0e0] to-[#ffffff] text-gray-900'
        }`}>

        <NavBar
          isLoggedIn={isLoggedIn}
          dark={dark}
          setDark={setDark}
          navOpen={navOpen}
          setNavOpen={setNavOpen}
          handleLogout={handleLogout}
          user={user}
        />

        <main className="container mx-auto px-4 py-8">
          {loading ? (
            <Loader />
          ) : (
            <Routes>
              {!isLoggedIn ? (
                <>
                  <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
                  <Route path="/chatbot" element={<PrivateRoute><ChatbotPage /></PrivateRoute>} />
                  <Route path="/analytics" element={<PrivateRoute><AnalyticsDashboard /></PrivateRoute>} />
                  <Route path="/admin" element={<PrivateRoute><UserManagementPage /></PrivateRoute>} />
                  <Route path="/admin/users" element={<PrivateRoute><UserManagementPage /></PrivateRoute>} />
                  <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                  <Route path="/settings" element={<PrivateRoute><CompanySettingsPage /></PrivateRoute>} />
                  <Route path="/about" element={<PrivateRoute><AboutPage /></PrivateRoute>} />
                  <Route path="/contact" element={<PrivateRoute><ContactPage /></PrivateRoute>} />
                  <Route path="/notifications" element={<PrivateRoute><NotificationPage /></PrivateRoute>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              )}
            </Routes>
          )}
        </main>
      </div>
    </>
  );
}
