import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

// Toast notifications
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Extra pages
import {
  UserProfilePage,
  CompanySettingsPage,
  AboutPage,
  ContactPage,
  NotFoundPage,
  NotificationsPage
} from './pages/ExtraPages';

// Existing components/pages
import Loader from './components/Loader';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import UploadBooksPage from './pages/UploadBooksPage';
import ChatbotPage from './pages/ChatbotPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import UserManagementPage from './pages/UserManagementPage';

import { HiSparkles } from 'react-icons/hi';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [loading, setLoading] = useState(false);

  // Login handler
  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setLoading(false);
      toast.success('Logged in successfully!');
    }, 1000);
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    toast.info('Logged out.');
  };

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 font-sans relative overflow-hidden">
        {/* Navbar */}
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <HiSparkles className="w-6 h-6 text-indigo-500" /> RAG System
            </Link>
            <div className="space-x-4">
              {!isLoggedIn ? (
                <>  
                  <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium">
                    Login
                  </Link>
                  <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-semibold">
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/profile" className="text-gray-600 hover:text-indigo-600">
                    Profile
                  </Link>
                  <Link to="/settings" className="text-gray-600 hover:text-indigo-600">
                    Settings
                  </Link>
                  <Link to="/about" className="text-gray-600 hover:text-indigo-600">
                    About
                  </Link>
                  <Link to="/contact" className="text-gray-600 hover:text-indigo-600">
                    Contact
                  </Link>
                  <Link to="/notifications" className="text-xl hover:text-indigo-600">🔔</Link>

                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-10 relative z-10">
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
