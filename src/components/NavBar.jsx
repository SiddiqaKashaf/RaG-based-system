// src/components/NavBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiSparkles,
  HiSun,
  HiMoon,
  HiMenu
} from 'react-icons/hi';
import {
  FiUser,
  FiSettings,
  FiBell,
  FiInfo
} from 'react-icons/fi';

export default function NavBar({
  isLoggedIn,
  dark,
  setDark,
  navOpen,
  setNavOpen,
  handleLogout,
  user  // <-- user prop received
}) {

  // Get avatar URL from user or fallback to default
  const avatarUrl = user?.avatarUrl || '/static/avatars/avatar1.jpg';  

  // animations
  const slideDown = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 }
  };
  const mobileMenu = {
    open: { height: 'auto', opacity: 1 },
    closed: { height: 0, opacity: 0 }
  };

  // Navigation links
  const links = !isLoggedIn
    ? [
        { to: '/', label: 'Login' },
        { to: '/signup', label: 'Sign Up', button: true }
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/upload', label: 'Upload' },
        { to: '/chatbot', label: 'Chatbot' },
        { to: '/analytics', label: 'Analytics' },
        { to: '/admin', label: 'Users' },
        { to: '/contact', label: 'Contact' },
        { to: '/about', icon: <FiInfo size={18} /> },
        { to: '/notifications', icon: <FiBell size={18} /> },
        { to: '/settings', icon: <FiSettings size={18} /> },
        {
          to: '/profile',
          customRender: (
            <img
              src={`http://localhost:8000${avatarUrl}`}
              alt="Profile"
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

          {/* Brand */}
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

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {/* Theme toggle */}
            <button
              onClick={() => setDark((d) => !d)}
              className="p-2 rounded-full transition-colors duration-300"
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
                  onClick={item.action}
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

          {/* Mobile menu button */}
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

        {/* Mobile Menu (animated) */}
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
                {/* Theme toggle */}
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
