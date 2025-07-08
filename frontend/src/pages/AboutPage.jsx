import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineLightBulb,
  HiOutlineShieldCheck,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineGlobe,
  HiOutlineDocumentText,
  HiOutlineChat,
  HiOutlineStar,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCode
} from 'react-icons/hi';
import { useTheme } from '../theme';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFeature, setSelectedFeature] = useState(null);
  const { getComponentClass } = useTheme();

  const companyStats = [
    { label: 'Active Users', value: '10,000+', icon: HiOutlineUsers, color: 'blue' },
    { label: 'Documents Processed', value: '1M+', icon: HiOutlineDocumentText, color: 'green' },
    { label: 'Countries Served', value: '25+', icon: HiOutlineGlobe, color: 'purple' },
    { label: 'Uptime', value: '99.9%', icon: HiOutlineShieldCheck, color: 'orange' }
  ];

  const features = [
    {
      icon: HiOutlineDocumentText,
      title: 'Document Management',
      description: 'Manage and process all your organization’s documents (PDF, CSV, DOCX, etc.). Add new documents to train the AI model for more relevant chatbot responses.',
      benefits: [
        'Centralized document storage',
        'Support for multiple file types',
        'Easy upload and management',
        'Continuous AI training with new data'
      ]
    },
    {
      icon: HiOutlineChat,
      title: 'AI-Powered Chatbot',
      description: 'Interact with your documents using advanced AI chat. Features include multi-language support (English/Urdu), voice and text chat, chat history, emoji picker, and options to clear, save, export, or share chats.',
      benefits: [
        'Chat with AI using text or voice',
        'Multi-language (English/Urdu)',
        'Chat history and export',
        'Emoji picker and sharing options'
      ]
    },
    {
      icon: HiOutlineChartBar,
      title: 'Analytics Dashboard',
      description: 'Visualize platform activity with bar and line charts. Track total queries, uploaded documents, and more. Dashboards are tailored for both admins and employees.',
      benefits: [
        'Real-time metrics',
        'Custom reports',
        'Role-based dashboards',
        'Data visualization'
      ]
    },
    {
      icon: HiOutlineUsers,
      title: 'User Management (Admin Only)',
      description: 'Admins can manage users, change roles, remove users, and monitor active sessions.',
      benefits: [
        'Role management',
        'User removal',
        'Active user monitoring',
        'Admin-only access'
      ]
    },
    {
      icon: HiOutlineShieldCheck,
      title: 'Settings & Security',
      description: 'Comprehensive settings for General, Security, Storage, and API. Enterprise-grade security with encryption and access controls.',
      benefits: [
        'General, Security, Storage, API settings',
        'Role-based access',
        'Audit trails',
        'GDPR compliant'
      ]
    },
    {
      icon: HiOutlineGlobe,
      title: 'Navigation & Additional Pages',
      description: 'Includes About, Contact, and Profile pages. Users can contact the company, personalize their profile, and toggle between dark and light themes.',
      benefits: [
        'About and Contact pages',
        'Profile customization',
        'Theme toggle (dark/light)',
        'Accessible to all users'
      ]
    }
  ];

  const renderStat = (stat, index) => {
    const Icon = stat.icon;
    return (
      <motion.div
        key={stat.label}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center ${
          stat.color === 'blue' ? 'hover:border-blue-300 dark:hover:border-blue-600' :
          stat.color === 'green' ? 'hover:border-green-300 dark:hover:border-green-600' :
          stat.color === 'purple' ? 'hover:border-purple-300 dark:hover:border-purple-600' :
          'hover:border-orange-300 dark:hover:border-orange-600'
        }`}
      >
        <div className={`inline-flex p-3 rounded-lg mb-4 ${
          stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
          stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
          stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
          'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
        }`}>
          <Icon size={24} />
        </div>
        <div className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{stat.value}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
      </motion.div>
    );
  };

  const renderFeature = (feature, index) => {
    const Icon = feature.icon;
    return (
      <motion.div
        key={feature.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={() => setSelectedFeature(selectedFeature === index ? null : index)}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{feature.description}</p>
            <AnimatePresence>
              {selectedFeature === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Key Benefits:</h4>
                    <ul className="space-y-1">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <HiOutlineCheckCircle className="w-4 h-4 text-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className={getComponentClass('typography', 'h1') + ' mb-4'}>About DocThinker</h1>
          <p className={getComponentClass('typography', 'body') + ' max-w-3xl mx-auto'}>
            We're revolutionizing how organizations manage and interact with their knowledge base. 
            Our AI-powered RAG system combines cutting-edge technology with intuitive design to deliver 
            the most advanced document management solution available.
          </p>
        </motion.div>

        {/* Company Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {companyStats.map((stat, index) => renderStat(stat, index))}
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {['overview', 'features', 'technology'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className={getComponentClass('card', 'contactGlass') + ' p-8'}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <HiOutlineLightBulb className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className={getComponentClass('typography', 'h2')}>Our Mission</h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  Our RAG-based SaaS platform empowers organizations with intelligent document management, seamless collaboration, and AI-driven insights. With a modern, user-friendly interface, we make knowledge accessible and actionable for both admins and employees.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Key Capabilities</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                        Secure login/signup with role-based access (admin/employee)
                      </li>
                      <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                        Dynamic homepage with summary cards and quick navigation
                      </li>
                      <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                        AI-powered chatbot with multi-language, voice, and export features
                      </li>
                      <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                        Analytics dashboard with real-time charts and role-based views
                      </li>
                      <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                        Document management for all file types and continuous AI training
                      </li>
                      <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                        User management (admin only): manage roles, remove users, monitor activity
                      </li>
                      <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                        Settings for General, Security, Storage, and API
                      </li>
                      <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                        About, Contact, and Profile pages with theme toggle (dark/light)
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Who Can Access?</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <HiOutlineStar className="w-5 h-5 text-yellow-500" />
                        The About page is visible to everyone, even without login.
                      </li>
                      <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <HiOutlineStar className="w-5 h-5 text-yellow-500" />
                        Most features are accessible after login, with role-based content for admins and employees.
                      </li>
                      <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <HiOutlineStar className="w-5 h-5 text-yellow-500" />
                        Backend features and integrations will be added in future updates.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'features' && (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {features.map((feature, index) => renderFeature(feature, index))}
            </motion.div>
          )}

          {activeTab === 'technology' && (
            <motion.div
              key="technology"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className={getComponentClass('card', 'contactGlass') + ' p-8'}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <HiOutlineCode className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className={getComponentClass('typography', 'h2')}>Technology Stack</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                      Frontend
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">⚛️</span>
                          <span className="font-medium text-gray-800 dark:text-white">React</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">18.x</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">📘</span>
                          <span className="font-medium text-gray-800 dark:text-white">TypeScript</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">5.x</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                      Backend
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🐍</span>
                          <span className="font-medium text-gray-800 dark:text-white">Python</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">3.11+</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">⚡</span>
                          <span className="font-medium text-gray-800 dark:text-white">FastAPI</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">0.104+</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <div className={getComponentClass('card', 'contactGlass') + ' p-8'}>
            <h2 className={getComponentClass('typography', 'h2') + ' mb-4'}>Ready to Get Started?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Join thousands of organizations that trust DocThinker to manage their knowledge base. 
              Experience the future of document management today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                Start Free Trial
                <HiOutlineArrowRight size={20} />
              </button>
              <button className="px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 