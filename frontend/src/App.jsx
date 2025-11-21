/// src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import NavBar from './components/NavBar';
import Loader from './components/Loader';
import BackButton from './components/BackButton';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import ChatbotPage from './pages/ChatbotPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import UserManagementPage from './pages/UserManagementPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import PrivateRoute from './components/PrivateRoute';
import { NavBarProvider, useNavBar } from './contexts/NavBarContext';
import { ThemeProvider, useTheme } from './theme';

function MainContent({ loading, isLoggedIn, handleLogin, user }) {
  const { expanded } = useNavBar();
  const location = useLocation();
  const { getComponentClass } = useTheme();
  
  // Show back button on all pages except home and auth pages
  // const showBackButton = isLoggedIn && location.pathname !== '/' && 
  //   !location.pathname.includes('/login') && !location.pathname.includes('/signup');

  return (
    <main
      className={`flex-1 transition-all duration-300 px-4 py-8`}
      style={{ marginLeft: expanded ? 256 : 80 }}
    >
      {/* Global Back Button */}
      {/* Removed BackButton from here, now handled in NavBar */}
      
      {loading ? (
        <Loader />
      ) : (
        <Routes>
          {!isLoggedIn ? (
            <>
              <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/about" element={<PrivateRoute><AboutPage /></PrivateRoute>} />
              <Route path="/contact" element={<PrivateRoute><ContactPage /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<PrivateRoute><HomePage user={user} /></PrivateRoute>} />
              <Route path="/chatbot" element={<PrivateRoute><ChatbotPage /></PrivateRoute>} />
              <Route path="/analytics" element={<PrivateRoute><AnalyticsDashboard /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute><UserManagementPage /></PrivateRoute>} />
              <Route path="/admin/users" element={<PrivateRoute><UserManagementPage /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="/about" element={<PrivateRoute><AboutPage /></PrivateRoute>} />
              <Route path="/contact" element={<PrivateRoute><ContactPage /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      )}
    </main>
  );
}

// New: AppLayout component that uses useTheme
function AppLayout({
  loading,
  isLoggedIn,
  handleLogin,
  user,
  navOpen,
  setNavOpen,
  handleLogout
}) {
  const { isDarkMode } = useTheme();
  const darkGradient = 'linear-gradient(135deg, #181824 0%, #232046 60%, #6d28d9 100%)';
  const lightGradient = 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)';
  
  return (
    <div
      className={`min-h-screen transition-colors duration-500`}
      style={isDarkMode ? { background: darkGradient } : { background: lightGradient }}
    >
      {/* Fixed Sidebar */}
      <NavBar
        isLoggedIn={isLoggedIn}
        navOpen={navOpen}
        setNavOpen={setNavOpen}
        handleLogout={handleLogout}
        user={user}
      />
      {/* Main Content */}
      <MainContent loading={loading} isLoggedIn={isLoggedIn} handleLogin={handleLogin} user={user} />
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [user, setUser] = useState(null);

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
          setUser(data);
        })
        .catch(() => {
          setUser(null);
          toast.error('Could not load profile picture');
        });
    } else {
      setUser(null);
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
      <ThemeProvider>
        <NavBarProvider>
          <AppLayout
            loading={loading}
            isLoggedIn={isLoggedIn}
            handleLogin={handleLogin}
            user={user}
            navOpen={navOpen}
            setNavOpen={setNavOpen}
            handleLogout={handleLogout}
          />
        </NavBarProvider>
      </ThemeProvider>
    </>
  );
}
