/// src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

// Toast notifications
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components & Pages
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
} from './pages/ExtraPages';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [navOpen, setNavOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(""); // NEW state for avatar URL

  // Persist & apply theme
  useEffect(() => {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  // Fetch current user profile to get avatar URL after login
  // useEffect(() => {
  //   if (isLoggedIn) {
  //     // Replace base URL with your backend URL if different
  //     fetch('http://localhost:8000/api/profile', {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem('access_token')}` // Assumes token stored here after login
  //       }
  //     })
  //       .then(res => {
  //         if (!res.ok) throw new Error('Failed to fetch profile');
  //         return res.json();
  //       })
  //       .then(data => {
  //         // Backend returns avatarUrl like "/static/avatars/xyz.png"
  //         setAvatarUrl(data.avatarUrl || "");
  //       })
  //       .catch(() => {
  //         setAvatarUrl("");
  //         toast.error('Could not load profile picture');
  //       });
  //   } else {
  //     setAvatarUrl(""); // Clear avatar on logout
  //   }
  // }, [isLoggedIn]);

  // Simulated login/logout
  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
        

      fetch('http://localhost:8000/api/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
       
        }
        
      })


      setLoading(false);
      toast.success('Logged in successfully!');
    }, 800);
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    setAvatarUrl("");
    localStorage.removeItem('access_token'); // Remove token on logout
    toast.info('Logged out.');
  };

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Theme wrapper */}
      <div className={`min-h-screen transition-colors duration-500 ${dark
        ? 'bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white'
        : 'bg-gradient-to-br from-[#f8f9fa] via-[#e0e0e0] to-[#ffffff] text-gray-900'
        }`}>

        {/* NavBar component with avatarUrl prop */}
        <NavBar
          isLoggedIn={isLoggedIn}
          dark={dark}
          setDark={setDark}
          navOpen={navOpen}
          setNavOpen={setNavOpen}
          handleLogout={handleLogout}
          avatarUrl={avatarUrl}  // <-- new prop here
        />

        {/* Main content */}
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
