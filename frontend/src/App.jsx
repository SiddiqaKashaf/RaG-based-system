/// src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
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
import UploadBooksPage from './pages/UploadBooksPage';
import ChatbotPage from './pages/ChatbotPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import UserManagementPage from './pages/UserManagementPage';
import ContactPage from './pages/ContactPage';
import CompanySettingsPage from './pages/CompanySettingsPage';
import AboutPage from './pages/AboutPage';
import NotificationsPage from './pages/NotificationPage';
import {
  UserProfilePage,
  NotFoundPage,
} from './pages/ProfilePage';

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
    <Router>
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
          user={user} // pass full user object instead of avatarUrl
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
                  <Route path="/" element={<HomePage />} />
                  <Route path="/upload" element={<UploadBooksPage />} />
                  <Route path="/chatbot" element={<ChatbotPage />} />
                  <Route path="/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/admin" element={<UserManagementPage />} />
                  <Route path="/profile" element={<UserProfilePage />} />
                  <Route path="/settings" element={<CompanySettingsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </>
              )}
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}
