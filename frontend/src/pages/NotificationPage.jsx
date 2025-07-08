import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  HiOutlineArrowLeft, 
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineBell,
  HiOutlineCog,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineArchive,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineChartBar
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useTheme } from '../theme';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { getComponentClass } = useTheme();
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterDate, setFilterDate] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      type: 'System', 
      priority: 'high',
      message: '🔔 Document "HR_Policies.pdf" was updated', 
      description: 'The HR policies document has been updated with new guidelines.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      icon: HiOutlineDocumentText,
      color: 'blue'
    },
    { 
      id: 2, 
      type: 'User', 
      priority: 'medium',
      message: '👤 New user "Ahmed Raza" signed up', 
      description: 'A new user has joined the platform and requires approval.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      icon: HiOutlineUser,
      color: 'green'
    },
    { 
      id: 3, 
      type: 'System', 
      priority: 'low',
      message: '🔧 System maintenance scheduled for Sunday', 
      description: 'Scheduled maintenance will occur from 2:00 AM to 4:00 AM EST.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: false,
      icon: HiOutlineCog,
      color: 'orange'
    },
    { 
      id: 4, 
      type: 'Security', 
      priority: 'high',
      message: '🔒 Unusual login activity detected', 
      description: 'Multiple failed login attempts detected from unknown IP address.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      read: true,
      icon: HiOutlineShieldCheck,
      color: 'red'
    },
    { 
      id: 5, 
      type: 'Analytics', 
      priority: 'medium',
      message: '📊 Weekly report is ready', 
      description: 'Your weekly analytics report has been generated and is available for download.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      read: true,
      icon: HiOutlineChartBar,
      color: 'purple'
    }
  ]);

  const notificationSettings = {
    email: true,
    push: true,
    system: true,
    user: true,
    security: true,
    analytics: false
  };

  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
    toast.info('Notification marked as read');
  };

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    toast.success('Notification deleted');
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    toast.info('All notifications marked as read');
  };

  const handleArchive = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    toast.success('Notification archived');
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityBgColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'bg-green-100 dark:bg-green-900/30';
      default: return 'bg-gray-100 dark:bg-gray-700/50';
    }
  };

  const filtered = notifications.filter(
    (n) => {
      const matchesTab = activeTab === 'All' || n.type === activeTab;
      const matchesSearch = n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           n.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = filterDate === 'all' || 
        (filterDate === 'today' && new Date(n.timestamp).toDateString() === new Date().toDateString()) ||
        (filterDate === 'week' && (new Date() - n.timestamp) < 7 * 24 * 60 * 60 * 1000);
      const matchesPriority = filterPriority === 'all' || n.priority === filterPriority;
      
      return matchesTab && matchesSearch && matchesDate && matchesPriority;
    }
  );

  const renderNotification = (notif) => {
    const Icon = notif.icon;
    return (
      <motion.li
        key={notif.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md ${
          notif.read 
            ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600' 
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-lg ${getPriorityBgColor(notif.priority)}`}>
            <Icon className={`w-5 h-5 ${getPriorityColor(notif.priority)}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`font-medium ${notif.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                    {notif.message}
                  </p>
                  {!notif.read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {notif.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <HiOutlineClock className="w-3 h-3" />
                    {formatTimeAgo(notif.timestamp)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBgColor(notif.priority)} ${getPriorityColor(notif.priority)}`}>
                    {notif.priority}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                    {notif.type}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!notif.read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <HiOutlineEye className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleArchive(notif.id)}
                  className="p-2 text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                  title="Archive"
                >
                  <HiOutlineArchive className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Delete"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.li>
    );
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <HiOutlineBell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className={getComponentClass('typography', 'h1')}>Notifications</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {notifications.filter((n) => !n.read).length} unread notifications
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Notification settings"
            >
              <HiOutlineCog className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Advanced filters"
            >
              <HiOutlineFilter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className={getComponentClass('card', 'contactGlass') + ' p-6'}>
                <h3 className={getComponentClass('typography', 'h3') + ' mb-4'}>Notification Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {key} notifications
                      </span>
                      <button
                        className={`w-12 h-6 rounded-full transition-colors ${
                          value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className={getComponentClass('card', 'contactGlass') + ' p-6'}>
                <h3 className={getComponentClass('typography', 'h3') + ' mb-4'}>Advanced Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date Range
                    </label>
                    <select
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className={getComponentClass('card', 'contactGlass') + ' p-6'}>
          {/* Tabs and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="bg-gray-100 dark:bg-gray-700 rounded-lg">
                {['All', 'System', 'User', 'Security', 'Analytics'].map((tab) => (
                  <TabsTrigger key={tab} value={tab} className="px-4 py-2">
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="relative flex-1 max-w-md">
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <HiOutlineBell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No notifications found.</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              filtered.map((notif) => renderNotification(notif))
            )}
          </div>

          {/* Actions */}
          {filtered.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filtered.length} of {notifications.length} notifications
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleMarkAllRead}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <HiOutlineCheckCircle className="w-4 h-4" />
                    Mark All as Read
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
