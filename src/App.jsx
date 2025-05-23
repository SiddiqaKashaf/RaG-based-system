import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import UploadBooksPage from './pages/UploadBooksPage';
import ChatbotPage from './pages/ChatbotPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import UserManagementPage from './pages/UserManagementPage';
import { HiSparkles } from 'react-icons/hi';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ✅ FIXED

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 font-sans relative overflow-hidden">
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <HiSparkles className="w-6 h-6 text-indigo-500" /> RAG System
            </Link>
            <div className="space-x-4">
              {!isLoggedIn ? (
                <>
                  <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium">Login</Link>
                  <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-semibold">Sign Up</Link>
                </>
              ) : (
                <button onClick={() => setIsLoggedIn(false)} className="text-red-600 hover:text-red-800 font-medium">Logout</button>
              )}
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-6 py-10 relative z-10">
          <Routes>
            {!isLoggedIn ? (
              <>
                <Route path="/" element={<LoginPage onLogin={() => setIsLoggedIn(true)} />} />
                <Route path="/signup" element={<SignupPage />} />
              </>
            ) : (
              <>
                <Route path="/" element={<HomePage />} />
                <Route path="/upload" element={<UploadBooksPage />} />
                <Route path="/chatbot" element={<ChatbotPage />} />
                <Route path="/analytics" element={<AnalyticsDashboard />} />
                <Route path="/admin" element={<UserManagementPage />} />

           

              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}
