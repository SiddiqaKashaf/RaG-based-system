import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineLocationMarker, 
  HiOutlineClock,
  HiOutlineChat,
  HiOutlineSupport,
  HiOutlineDocumentText,
  HiOutlineQuestionMarkCircle,
  HiOutlineArrowRight,
  HiOutlineStar,
  HiOutlineLightBulb
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useTheme } from '../theme';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium',
    category: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, from: 'support', message: 'Hello! How can we help you today?', timestamp: new Date() }
  ]);
  const { getComponentClass } = useTheme();

  const contactMethods = [
    {
      icon: HiOutlineMail,
      title: 'Email Support',
      description: 'Get detailed responses within 24 hours',
      value: 'support@docthinker.com',
      color: 'blue'
    },
    {
      icon: HiOutlinePhone,
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      value: '+1 (555) 123-4567',
      color: 'green'
    },
    {
      icon: HiOutlineChat,
      title: 'Live Chat',
      description: 'Instant support during business hours',
      value: 'Available Now',
      color: 'purple'
    },
    {
      icon: HiOutlineLocationMarker,
      title: 'Office Location',
      description: 'Visit our headquarters',
      value: '123 Tech Street, Silicon Valley, CA',
      color: 'orange'
    }
  ];

  const businessHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM PST' },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM PST' },
    { day: 'Sunday', hours: 'Closed' }
  ];

  const faqData = [
    {
      question: 'How do I upload documents to the system?',
      answer: 'You can upload documents by navigating to the Documents page and clicking the "Upload Document" button. Supported formats include PDF, DOCX, and TXT files up to 10MB each.'
    },
    {
      question: 'What is the difference between Admin and Employee roles?',
      answer: 'Admins have full access to user management, system settings, and analytics. Employees have access to documents, chat features, and basic functionality.'
    },
    {
      question: 'How secure is my data?',
      answer: 'We use enterprise-grade encryption (AES-256) for all data at rest and in transit. Your documents are stored securely and access is controlled through role-based permissions.'
    }
  ];

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing & Subscription' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'security', label: 'Security Concern' }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'green' },
    { value: 'medium', label: 'Medium Priority', color: 'yellow' },
    { value: 'high', label: 'High Priority', color: 'red' },
    { value: 'urgent', label: 'Urgent', color: 'red' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/contact', {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        priority: formData.priority
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'medium',
        category: 'general'
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      from: 'user',
      message: chatMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage('');

    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        from: 'support',
        message: 'Thank you for your message. A support agent will respond shortly.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const renderContactMethod = (method, index) => {
    const Icon = method.icon;
    return (
      <motion.div
        key={method.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer ${
          method.color === 'blue' ? 'hover:border-blue-300 dark:hover:border-blue-600' :
          method.color === 'green' ? 'hover:border-green-300 dark:hover:border-green-600' :
          method.color === 'purple' ? 'hover:border-purple-300 dark:hover:border-purple-600' :
          'hover:border-orange-300 dark:hover:border-orange-600'
        }`}
        onClick={() => method.title === 'Live Chat' && setShowLiveChat(true)}
      >
        <div className={`inline-flex p-3 rounded-lg mb-4 ${
          method.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
          method.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
          method.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
          'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
        }`}>
          <Icon size={24} />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{method.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-2">{method.description}</p>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{method.value}</p>
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
          <h1 className={getComponentClass('typography', 'h1') + ' mb-4'}>Contact Us</h1>
          <p className={getComponentClass('typography', 'body') + ' max-w-2xl mx-auto'}>
            We're here to help! Get in touch with our support team through multiple channels. 
            Our experts are ready to assist you with any questions or concerns.
          </p>
        </motion.div>

        {/* Contact Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactMethods.map((method, index) => renderContactMethod(method, index))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className={getComponentClass('card', 'contactGlass') + ' p-8'}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <HiOutlineSupport className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className={getComponentClass('typography', 'h2')}>Send us a Message</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Please provide detailed information about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <HiOutlineArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Business Hours */}
            <div className={getComponentClass('card', 'contactGlass') + ' p-6'}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <HiOutlineClock className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className={getComponentClass('typography', 'h3')}>Business Hours</h3>
              </div>
              <div className="space-y-3">
                {businessHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{schedule.day}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{schedule.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={getComponentClass('card', 'contactGlass') + ' p-6'}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <HiOutlineLightBulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className={getComponentClass('typography', 'h3')}>Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setShowFAQ(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <HiOutlineQuestionMarkCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View FAQ</span>
                </button>
                <button
                  onClick={() => setShowLiveChat(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <HiOutlineChat className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Chat</span>
                </button>
                <button
                  onClick={() => window.open('https://docs.docthinker.com', '_blank')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <HiOutlineDocumentText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Documentation</span>
                </button>
              </div>
            </div>

            {/* Support Stats */}
            <div className={getComponentClass('card', 'contactGlass') + ' p-6'}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <HiOutlineStar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className={getComponentClass('typography', 'h3')}>Support Stats</h3>
              </div>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24/7</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Support Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">98%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Satisfaction Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">&lt;2h</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average Response</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <AnimatePresence>
          {showFAQ && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowFAQ(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={getComponentClass('card', 'contactGlass') + ' w-full max-w-2xl max-h-[80vh] overflow-y-auto'}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className={getComponentClass('typography', 'h2')}>Frequently Asked Questions</h2>
                  <button
                    onClick={() => setShowFAQ(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-4">
                  {faqData.map((faq, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                      <button
                        onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <span className="font-medium text-gray-800 dark:text-white">{faq.question}</span>
                        <HiOutlineArrowRight 
                          size={20} 
                          className={`text-gray-500 transition-transform ${activeFAQ === index ? 'rotate-90' : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {activeFAQ === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-0 text-gray-600 dark:text-gray-400">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Chat Modal */}
        <AnimatePresence>
          {showLiveChat && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowLiveChat(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={getComponentClass('card', 'contactGlass') + ' w-full max-w-md h-96 flex flex-col'}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h3 className={getComponentClass('typography', 'h3')}>Live Chat</h3>
                  </div>
                  <button
                    onClick={() => setShowLiveChat(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ×
                  </button>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.from === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 