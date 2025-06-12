// src/components/NavBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiSparkles,
  HiSun,
  HiMoon,
  HiMenu,
  HiArrowLeft
} from 'react-icons/hi';
import {
  FiUser,
  FiSettings,
  FiBell,
  FiInfo,
  FiUpload,
  FiHome,
  FiBarChart2,
  FiUsers,
  FiPhone
} from 'react-icons/fi';

export default function NavBar({
  isLoggedIn,
  dark,
  setDark,
  navOpen,
  setNavOpen,
  handleLogout,
  user
}) {
  const avatarUrl = user?.avatarUrl || '/static/avatars/avatar1.jpg';

  const slideDown = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 }
  };

  const mobileMenu = {
    open: { height: 'auto', opacity: 1 },
    closed: { height: 0, opacity: 0 }
  };

  const links = !isLoggedIn
    ? [
        { to: '/', label: 'Login' },
        { to: '/signup', label: 'Sign Up', button: true }
      ]
    : [
        { to: '/', label: 'Home', icon: <FiHome size={18} />, title: 'Home' },
        { to: '/upload', label: 'Upload', icon: <FiUpload size={18} />, title: 'Upload Documents' },
        { to: '/chatbot', label: 'Chatbot', icon: <HiSparkles size={18} />, title: 'Chatbot Assistant' },
        { to: '/analytics', label: 'Analytics', icon: <FiBarChart2 size={18} />, title: 'Analytics Dashboard' },
        { to: '/admin', label: 'Users', icon: <FiUsers size={18} />, title: 'User Management' },
        { to: '/contact', label: 'Contact', icon: <FiPhone size={18} />, title: 'Contact Support' },
        { to: '/about', icon: <FiInfo size={18} />, title: 'About' },
        { to: '/notifications', icon: <FiBell size={18} />, title: 'Notifications' },
        { to: '/settings', icon: <FiSettings size={18} />, title: 'Settings' },
        {
          to: '/profile',
          title: 'Profile',
          customRender: (
            <img
              src={`http://localhost:8000${avatarUrl}`}
              alt="Profile"
              title="Profile"
              className="h-8 w-8 rounded-full object-cover"
              loading="lazy"
              draggable={false}
            />
          )
        },
        { to: '', label: 'Logout', action: handleLogout, danger: true }
      ];

  return (
    <AnimatePresence>
      <motion.nav
        key="navbar"
        variants={slideDown}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`sticky top-0 z-50 transition-colors duration-500 shadow-lg ${
          dark
            ? 'bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e]'
            : 'bg-gradient-to-r from-[#f8f9fa] via-[#e0e0e0] to-[#ffffff]'
        }`}
      >
        <div className="container mx-auto flex items-center justify-between p-4">

          {/* Left: Back Button + Brand */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition"
              title="Go Back"
              aria-label="Go Back"
            >
              <HiArrowLeft size={20} className={dark ? 'text-white' : 'text-gray-800'} />
            </button>

            <Link
              to="/"
              className={`flex items-center text-2xl font-bold ${
                dark ? 'text-white' : 'text-gray-900'
              }`}
            >
              <HiSparkles
                className={`w-6 h-6 mr-2 transition-colors duration-300 ${
                  dark ? 'text-yellow-300' : 'text-indigo-600'
                }`}
              />
              RAG System
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <button
              onClick={() => setDark((d) => !d)}
              className="p-2 rounded-full transition-colors duration-300"
              aria-label="Toggle Theme"
              title="Toggle Theme"
            >
              {dark ? (
                <HiSun size={20} className="text-yellow-300 animate-pulse" />
              ) : (
                <HiMoon size={20} className="text-gray-700" />
              )}
            </button>

            {links.map((item, i) =>
              item.action ? (
                <button
                  key={i}
                  onClick={item.action}
                  title={item.title}
                  className={`px-4 py-2 rounded-full transition-colors duration-300 ${
                    item.danger
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : dark
                      ? 'bg-white/20 text-white hover:bg-white/30'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={i}
                  to={item.to}
                  title={item.title}
                  className={`flex items-center justify-center transition-colors duration-300 ${
                    item.button
                      ? dark
                        ? 'px-4 py-2 bg-white/20 text-white hover:bg-white/30 rounded-full'
                        : 'px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-full'
                      : dark
                      ? 'text-white hover:text-[#a29aac]'
                      : 'text-gray-800 hover:text-gray-600'
                  }`}
                >
                  {item.customRender
                    ? item.customRender
                    : item.icon || (
                        <span className="select-none">{item.label}</span>
                      )}
                </Link>
              )
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setNavOpen((o) => !o)}
              aria-label="Toggle Menu"
              className="focus:outline-none"
            >
              <HiMenu size={24} className={dark ? 'text-white' : 'text-gray-800'} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {navOpen && (
            <motion.div
              variants={mobileMenu}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden overflow-hidden"
            >
              <div className="flex flex-col space-y-2 p-4">
                <button
                  onClick={() => setDark((d) => !d)}
                  className="self-end p-2 rounded-full transition-colors duration-300"
                  aria-label="Toggle Theme"
                >
                  {dark ? (
                    <HiSun size={20} className="text-yellow-300 animate-pulse" />
                  ) : (
                    <HiMoon size={20} className="text-gray-700" />
                  )}
                </button>

                {links.map((item, i) =>
                  item.action ? (
                    <button
                      key={i}
                      onClick={() => {
                        item.action();
                        setNavOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-full transition-colors duration-300 ${
                        item.danger
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : dark
                          ? 'bg-white/20 text-white hover:bg-white/30'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      key={i}
                      to={item.to}
                      title={item.title}
                      onClick={() => setNavOpen(false)}
                      className={`block px-4 py-2 rounded-full transition-colors duration-300 ${
                        item.button
                          ? dark
                            ? 'bg-white/20 text-white hover:bg-white/30'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : dark
                          ? 'text-white hover:text-[#a29aac]'
                          : 'text-gray-800 hover:text-gray-600'
                      }`}
                    >
                      {item.customRender
                        ? item.customRender
                        : item.icon || (
                            <span className="select-none">{item.label}</span>
                          )}
                    </Link>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </AnimatePresence>
  );
}
