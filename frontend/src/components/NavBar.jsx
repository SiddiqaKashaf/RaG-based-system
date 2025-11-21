// src/components/NavBar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiMenu, 
  FiX, 
  FiLogOut,
  FiHome,
  FiMessageSquare,
  FiBarChart2,
  FiUsers,
  FiInfo,
  FiPhone,
  FiUser,
  FiSun,
  FiMoon
} from 'react-icons/fi';
import { useNavBar } from '../contexts/NavBarContext';
import { useTheme } from '../theme';
import BackButton from './BackButton';
import { HiOutlineArrowLeft } from 'react-icons/hi';

export default function NavBar({
  isLoggedIn,
  navOpen,
  setNavOpen,
  handleLogout,
  user
}) {
  const SYSTEM_NAME = 'DocThinker';
  const { expanded, toggleExpanded } = useNavBar();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { getComponentClass } = useTheme();
  const location = useLocation();

  // Default avatar as data URI to avoid external dependencies
  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

  const navigation = [
    { name: 'Home', href: '/', icon: FiHome, description: 'Dashboard overview' },
    { name: 'Chatbot', href: '/chatbot', icon: FiMessageSquare, description: 'AI-powered chat assistant' },
    { name: 'Analytics', href: '/analytics', icon: FiBarChart2, description: 'Data insights and reports' },
    // Users link will be conditionally added below
    { name: 'About', href: '/about', icon: FiInfo, description: 'About the system' },
    { name: 'Contact', href: '/contact', icon: FiPhone, description: 'Get in touch' },
  ];

  // Conditionally add Users link for admin only
  const adminNavigation = [
    ...navigation.slice(0, 3),
    { name: 'Users', href: '/admin/users', icon: FiUsers, description: 'User management' },
    ...navigation.slice(3)
  ];

  const mainLinks = !isLoggedIn
    ? [
      { name: 'Home', href: '/', icon: FiHome },
      { name: 'About', href: '/about', icon: FiInfo },
      { name: 'Contact', href: '/contact', icon: FiPhone },
    ]
    : (user?.role === 'admin' ? adminNavigation : navigation);

  // Show back button on all pages except home and auth pages
  const showBackButton = isLoggedIn;

  return (
    <nav
      className={`fixed top-0 left-0 h-full bg-white/95 dark:bg-indigo-500/5 dark:backdrop-blur-lg dark:shadow-md dark:ring-1 dark:ring-white/20 rounded-3xl shadow-lg border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        expanded ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600">
          {expanded && (
            <h1 className="text-xl font-bold text-white">
              {SYSTEM_NAME}
            </h1>
          )}
          <div className="flex items-center space-x-2">
            {expanded ? (
              <button
                onClick={() => toggleDarkMode()}
                className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
                title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? (
                  <FiSun className="w-5 h-5" />
                ) : (
                  <FiMoon className="w-5 h-5" />
                )}
              </button>
            ) : null}
            <button
              onClick={() => toggleExpanded()}
              className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
            >
              {expanded ? (
                <FiX className="w-5 h-5" />
              ) : (
                <FiMenu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* BackButton above navigation links */}
        {showBackButton && (
          <div className={`pt-4 ${expanded ? 'px-4' : 'flex justify-center'}`}>
            <BackButton
              className={
                expanded
                  ? 'w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 text-white font-semibold py-2 rounded-lg shadow transition-all'
                  : 'w-18 h-8 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 text-white rounded-full shadow transition-all p-0'
              }
            >
              {expanded ? 'Back' : null}
            </BackButton>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {mainLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-indigo-600 dark:hover:text-indigo-300'
                  }`}
                  title={expanded ? '' : item.description}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-300'
                        : 'text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300'
                    }`}
                  />
                  {expanded && (
                    <span className="ml-3 text-sm font-medium">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Section */}
        {isLoggedIn && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center">
              <Link to="/profile" className="flex-shrink-0 group">
                <img
                  className="h-8 w-8 rounded-full ring-2 ring-indigo-600 dark:ring-indigo-400 cursor-pointer group-hover:ring-4 group-hover:ring-indigo-400 transition-all duration-200"
                  src={user?.profilePicture || defaultAvatar}
                  alt={user?.name || 'User'}
                  onError={(e) => {
                    e.target.src = defaultAvatar;
                  }}
                  title="Go to profile"
                />
              </Link>
              {expanded && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role || 'User'}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className={`mt-4 flex items-center w-full px-2 py-4 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg transition-colors ${
                !expanded && 'justify-center'
              }`}
            >
              <FiLogOut className="w-4 h-4" />
              {expanded && <span className="ml-2">Logout</span>}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

