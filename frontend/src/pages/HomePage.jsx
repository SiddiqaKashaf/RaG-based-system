import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  HiOutlineSearch,
  HiOutlineChatAlt2,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineLockClosed,
  HiOutlineDocumentText,
  HiOutlineLightBulb,
  HiOutlineClock,
  HiOutlineShare,
  HiOutlineTag,
  HiOutlineBookmark,
  HiOutlineCollection,
  HiOutlineUpload,
  HiOutlineBell,
  HiOutlineExclamationCircle,
  HiOutlineQuestionMarkCircle,
  HiOutlineArrowRight,
  HiOutlineDatabase,
  HiOutlineCog,
  HiOutlineShieldCheck,
  HiOutlineChartPie
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useTheme } from '../theme';

// Helper to decode JWT payload
function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
}

const SYSTEM_NAME = "DocThinker Enterprise"; // Updated system name

export default function HomePage() {
  const { getComponentClass, getGradient, getStatusClass, theme: themeConfig } = useTheme();
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  // Simulated notifications and activity for demo
  const [notifications] = useState([
    { type: 'info', message: 'System maintenance scheduled for Sunday 2am.' },
    { type: 'alert', message: '1 user pending approval.' }
  ]);
  const [recentActivity] = useState([
    { type: 'upload', detail: 'Uploaded "Q2_report.pdf"', time: '2 hours ago' },
    { type: 'query', detail: 'Searched for "HR policy"', time: '5 hours ago' },
    { type: 'chat', detail: 'Chatted with AI Assistant', time: '1 day ago' }
  ]);
  const [orgActivity] = useState([
    { user: 'Alice', action: 'Uploaded "sales.xlsx"', time: '1 hour ago' },
    { user: 'Bob', action: 'Searched for "client list"', time: '3 hours ago' },
    { user: 'Admin', action: 'Added new user', time: 'yesterday' }
  ]);
  const [orgStats] = useState({ users: 42, active: 37, uptime: '99.98%', pending: 1 });
  const [personalStats] = useState({ queries: 12, uploads: 3, lastLogin: 'Today, 09:12 AM' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.role) setRole(decoded.role.toLowerCase());
      if (decoded && (decoded.username || decoded.name)) setUsername(decoded.username || decoded.name);
    }
    setLoading(false);
  }, []);

  const features = [
    {
      title: 'Enterprise Search',
      path: '/search',
      icon: <HiOutlineSearch size={24} />,
      description: 'Advanced semantic search across your entire document repository',
      gradient: 'search',
      stats: 'Enterprise-grade'
    },
    {
      title: 'AI Assistant',
      path: '/chatbot',
      icon: <HiOutlineChatAlt2 size={24} />,
      description: 'Intelligent document analysis and insights generation',
      gradient: 'aiAssistant',
      stats: 'Powered by GPT-4'
    },
    {
      title: 'Analytics Hub',
      path: '/analytics',
      icon: <HiOutlineChartPie size={24} />,
      description: 'Comprehensive analytics and business intelligence',
      gradient: 'analytics',
      stats: 'Real-time Insights'
    },
    {
      title: 'Document Management',
      path: '/documents',
      icon: <HiOutlineDatabase size={24} />,
      description: 'Secure document storage and management system',
      gradient: 'documents',
      stats: 'Enterprise Security'
    },
    {
      title: 'User Management',
      path: role === 'admin' ? '/admin/users' : '#',
      icon: role === 'admin' ? <HiOutlineUserGroup size={24} /> : <HiOutlineLockClosed size={24} />,
      description: role === 'admin' ? 'Advanced user and permission management' : 'Admin access required',
      gradient: role === 'admin' ? 'userManagement' : 'disabled',
      disabled: role !== 'admin',
      stats: role === 'admin' ? 'Full Control' : 'Restricted'
    },
    {
      title: 'System Settings',
      path: role === 'admin' ? '/admin/settings' : '#',
      icon: <HiOutlineCog size={24} />,
      description: 'Configure system parameters and integrations',
      gradient: 'settings',
      stats: 'Customizable'
    }
  ];

  // Remove Enterprise Search and System Settings from features
  const filteredFeatures = features.filter(f => f.title !== 'Enterprise Search' && f.title !== 'System Settings');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen`}>
      {/* Enterprise Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${  getComponentClass('card', 'contactGlass')}`}
      >
        <div className={`${themeConfig.spacing.container.maxWidth} mx-auto ${themeConfig.spacing.container.padding} py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg"
              >
                <span>{SYSTEM_NAME[0]}</span>
              </motion.div>
              <div>
                <h1 className={getComponentClass('typography', 'h1')}>{SYSTEM_NAME}</h1>
                <p className={getComponentClass('typography', 'caption')}>Enterprise Document Intelligence Platform</p>
              </div>
            </div>
            {username && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-4"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{role}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-medium">
                  {username[0].toUpperCase()}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      <div className={`${themeConfig.spacing.container.maxWidth} mx-auto ${themeConfig.spacing.container.padding} ${themeConfig.spacing.section.padding}`}>
        {/* Quick Stats */}
        <div className={`grid grid-cols-1 md:grid-cols-4 ${themeConfig.spacing.card.gap} mb-8`}>
          <motion.div 
            whileHover={{ y: -4 }}
            className={`${  getComponentClass('card', 'contactGlass')} ${themeConfig.spacing.card.padding}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Documents</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">1,234</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <HiOutlineDocumentText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                <span className="font-medium">+12.5%</span>
                <span className="ml-2">from last month</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className={`${  getComponentClass('card', 'contactGlass')} ${themeConfig.spacing.card.padding}`}
          >
            <div className="flex items-center justify-between ">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{orgStats.active}</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <HiOutlineUserGroup className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                <span className="font-medium">+8.2%</span>
                <span className="ml-2">from last week</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className={`${  getComponentClass('card', 'contactGlass')} ${themeConfig.spacing.card.padding}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">AI Queries</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">892</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                <HiOutlineLightBulb className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                <span className="font-medium">+23.1%</span>
                <span className="ml-2">from last month</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className={`${  getComponentClass('card', 'contactGlass')} ${themeConfig.spacing.card.padding}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">System Health</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{orgStats.uptime}</p>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-900/30 rounded-lg">
                <HiOutlineShieldCheck className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                <span className="font-medium">All Systems</span>
                <span className="ml-2">operational</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature Grid and Recent Activity Side by Side */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Feature Cards - left aligned, full width */}
          <div className="flex-1">
            <div className={`grid grid-cols-1 gap-6`}>
              {filteredFeatures.map((feat, index) => {
                const cardContent = (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className={`w-full min-h-[120px] p-3 ${getComponentClass('featureCard', 'base')} bg-gradient-to-br ${getGradient(feat.gradient)} ${
                      feat.disabled ? getComponentClass('featureCard', 'disabled') : ''
                    }`}
                  >
                    <div className="relative z-10 flex flex-col h-full">
                      <div className={getComponentClass('featureCard', 'icon') + ' flex items-center gap-2 mb-2'}>
                        {feat.icon}
                        <h2 className="text-lg font-semibold">{feat.title}</h2>
                      </div>
                      <p className="text-sm mb-4 opacity-90">{feat.description}</p>
                      {!feat.disabled && (
                        <motion.div 
                          whileHover={{ x: 4 }}
                          className="mt-auto flex items-center justify-between"
                        >
                          <span className={getComponentClass('featureCard', 'badge')}>
                            {feat.stats}
                          </span>
                          <span className={getComponentClass('featureCard', 'action')}>
                            Explore <HiOutlineArrowRight size={16} />
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
                return feat.disabled ? (
                  <div key={feat.title}>{cardContent}</div>
                ) : (
                  <Link to={feat.path} key={feat.title}>
                    {cardContent}
                  </Link>
                );
              })}
            </div>
          </div>
          {/* Right column: Recent Activity above System Notifications */}
          <div className="flex-1 max-w-lg flex flex-col gap-8">
            {/* Recent Activity */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={getComponentClass('card', 'recentActivity')}
            >
              <h2 className={`${getComponentClass('typography', 'h2')} mb-4 flex items-center gap-2`}>
                <HiOutlineClock className="text-blue-600 dark:text-blue-400" />
                Recent Activity
              </h2>
              <div className="space-y-4">
                <AnimatePresence>
                  {(role === 'admin' ? orgActivity : recentActivity).map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                      <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                        {item.type === 'upload' ? <HiOutlineUpload className="w-5 h-5 text-blue-600 dark:text-blue-400" /> :
                         item.type === 'query' ? <HiOutlineSearch className="w-5 h-5 text-purple-600 dark:text-purple-400" /> :
                         item.type === 'chat' ? <HiOutlineChatAlt2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> :
                         item.user ? <HiOutlineUserGroup className="w-5 h-5 text-amber-600 dark:text-amber-400" /> :
                         <HiOutlineDocumentText className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {role === 'admin'
                            ? <><span className="text-blue-600 dark:text-blue-400">{item.user}</span> {item.action}</>
                            : item.detail}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{item.time}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
            {/* System Notifications */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={getComponentClass('card', 'systemNotifications')}
            >
              <h2 className={`${getComponentClass('typography', 'h2')} mb-4 flex items-center gap-2`}>
                <HiOutlineBell className="text-rose-600 dark:text-rose-400" />
                System Notifications
              </h2>
              <div className="space-y-4">
                {notifications.map((notification, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-4 rounded-lg ${
                      notification.type === 'alert' 
                        ? getStatusClass('error')
                        : getStatusClass('info')
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        notification.type === 'alert'
                          ? 'bg-rose-100 dark:bg-rose-800/50'
                          : 'bg-blue-100 dark:bg-blue-800/50'
                      }`}>
                        {notification.type === 'alert' 
                          ? <HiOutlineExclamationCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                          : <HiOutlineBell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        }
                      </div>
                      <p className="text-sm text-gray-800 dark:text-white">{notification.message}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Help Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-8 sm:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                    <HiOutlineQuestionMarkCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Need Enterprise Support?</h3>
                    <p className="text-sm text-white/80 mt-1">Access our comprehensive documentation and support resources</p>
                  </div>
                </div>
                <Link 
                  to="/help"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Get Support
                  <HiOutlineArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
