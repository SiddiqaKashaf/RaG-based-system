// src/pages/ChatbotPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  HiOutlineChatAlt2, 
  HiOutlinePaperAirplane, 
  HiUser, 
  HiOutlineUpload,
  HiOutlineDocumentText,
  HiOutlineLightBulb,
  HiOutlinePaperClip,
  HiOutlineXCircle,
  HiRefresh,
  HiOutlineInformationCircle,
  HiOutlineClock,
  HiOutlineBookmark,
  HiOutlineCog,
  HiOutlineTrash,
  HiOutlineDocument,
  HiOutlineDocumentAdd,
  HiOutlineDocumentRemove,
  HiOutlineDownload,
  HiOutlineShare,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineMicrophone,
  HiOutlineVolumeUp,
  HiOutlineTag,
  HiOutlineUserGroup,
  HiOutlineArrowDown
} from 'react-icons/hi';
import { FaRobot } from 'react-icons/fa';
import { ImSpinner8 } from 'react-icons/im';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTheme } from '../theme';
import { motion } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import { Tooltip } from 'react-tooltip';
import { BsCheck2, BsCheck2All } from 'react-icons/bs';


export default function ChatbotPage() {
  // Correct background and card classes for each mode
  const mainBgClass = 'min-h-screen w-full flex items-center justify-center py-8 px-2 bg-white dark:bg-gradient-to-br dark:from-[#181824] dark:via-[#23235b] dark:to-[#3a1c71]';
  const cardClass = 'rounded-3xl shadow-2xl backdrop-blur-lg bg-white/90 border border-gray-200 p-8 dark:bg-gray-900/60 dark:border-white/20';
  const sidebarCardClass = 'rounded-3xl shadow-xl backdrop-blur-lg bg-white/95 border border-gray-200 flex flex-col gap-6 p-6 h-full dark:bg-gray-900/60 dark:border-white/20';

  // Concise state
  const [messages, setMessages] = useState([
    { 
      from: 'bot', 
      text: 'Hello! I can help you with both document search and general questions about the organization. How can I assist you today?',
      type: 'welcome',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState('general');
  const [savedChats, setSavedChats] = useState([]);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showSources, setShowSources] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(window.speechSynthesis);
  const { getComponentClass } = useTheme();

  // Top-tier avatars
  const botAvatar = (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg border-2 border-indigo-300 dark:border-indigo-700">
      <FaRobot size={20} className="text-white" />
      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full" title="Online" />
    </div>
  );
  const userAvatar = (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-blue-400 flex items-center justify-center shadow-lg border-2 border-indigo-400">
      <HiUser size={20} className="text-white" />
    </div>
  );

  // Message status icon
  const statusIcon = (status) => {
    if (status === 'sent') return <BsCheck2 className="inline ml-1 text-gray-400" title="Sent" />;
    if (status === 'delivered') return <BsCheck2All className="inline ml-1 text-blue-400" title="Delivered" />;
    return null;
  };

  // Typing indicator
  const [botTyping, setBotTyping] = useState(false);

  // Animate bot typing for 1s when loading
  useEffect(() => {
    if (loading) setBotTyping(true);
    else setTimeout(() => setBotTyping(false), 600);
  }, [loading]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Error with voice recognition. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      toast.warning('Voice recognition is not supported in your browser.');
    }

    // Initialize speech synthesis
    const loadVoices = () => {
      const voices = synthesisRef.current.getVoices();
      setSelectedVoice(voices[0]);
    };

    if (synthesisRef.current.onvoiceschanged !== undefined) {
      synthesisRef.current.onvoiceschanged = loadVoices;
    }
    loadVoices();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakResponse = (text) => {
    if (!voiceEnabled || !selectedVoice) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      // Add a class to indicate speech is being spoken
      const chatCard = document.querySelector('.chat-card');
      if (chatCard) {
        chatCard.classList.add('speaking');
      }
    };
    utterance.onend = () => {
      // Remove the class when speech ends
      const chatCard = document.querySelector('.chat-card');
      if (chatCard) {
        chatCard.classList.remove('speaking');
      }
    };
    utterance.onerror = () => {
      setIsListening(false);
      toast.error('Error with voice synthesis. Please try again.');
    };

    synthesisRef.current.speak(utterance);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    files.forEach(file => {
      if (allowedTypes.includes(file.type)) {
        if (file.size > maxSize) {
          toast.error(`${file.name} is too large. Maximum size is 10MB`);
          return;
        }
        
        // Check if file already exists
        if (messages.some(msg => msg.text === file.name)) {
          toast.warning(`${file.name} is already uploaded`);
          return;
        }

        const newMsg = {
          from: 'user',
          text: file.name,
          timestamp: new Date(),
          type: 'file'
        };

        setMessages(prev => [...prev, newMsg]);
        toast.success(`${file.name} uploaded successfully`);
      } else {
        toast.error(`${file.name} is not a supported file type`);
      }
    });
  };

  const removeMessage = (index) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
    toast.info('Message removed');
  };

  const resetChat = () => {
    setMessages([
      { 
        from: 'bot', 
        text: 'Hello! I can help you with both document search and general questions about the organization. How can I assist you today?',
        type: 'welcome',
        timestamp: new Date()
      }
    ]);
    toast.info('Chat reset successfully');
  };

  // Add supported languages
  const supportedLanguages = [
    { code: 'en-US', label: 'English' },
    { code: 'ur-PK', label: 'Urdu' }
  ];

  // Add document state
  const [documents, setDocuments] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const fileInputRef = useRef(null);

  // Handle document upload
  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB
    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type`);
        return;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        return;
      }
      if (documents.some(doc => doc.name === file.name)) {
        toast.warning(`${file.name} is already uploaded`);
        return;
      }
      setDocuments(prev => [...prev, file]);
      toast.success(`${file.name} uploaded successfully`);
    });
    e.target.value = '';
  };

  const removeDocument = (name) => {
    setDocuments(prev => prev.filter(doc => doc.name !== name));
    toast.info('Document removed');
  };

  // Update voice recognition and synthesis to use selected language
  useEffect(() => {
    if ('webkitSpeechRecognition' in window && recognitionRef.current) {
      recognitionRef.current.lang = selectedLanguage;
    }
  }, [selectedLanguage]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = {
      from: 'user',
      text: input,
      timestamp: new Date(),
      type: 'user'
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      // Validate token first
      const validateToken = async () => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        try {
          await axios.get('http://localhost:8000/api/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          return token;
        } catch (error) {
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            throw new Error('Authentication expired. Please login again.');
          }
          throw error;
        }
      };
      const token = await validateToken();
      // Prepare form data for file upload
      const formData = new FormData();
      formData.append('question', input);
      formData.append('context', context);
      formData.append('language', selectedLanguage);
      documents.forEach((file, idx) => {
        formData.append('documents', file, file.name);
      });
      const response = await axios.post('http://localhost:8000/api/chat', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      const botMessage = {
        from: 'bot',
        text: response.data.answer || response.data.response || 'I received your message but couldn\'t process it properly.',
        timestamp: new Date(),
        type: 'bot',
        sources: response.data.sources || []
      };
      setMessages(prev => [...prev, botMessage]);
      if (voiceEnabled) speakResponse(botMessage.text);
    } catch (error) {
      let errorMessage = 'Failed to get response. Please try again.';
      if (error.message.includes('Authentication expired')) {
        errorMessage = 'Session expired. Please login again.';
      } else if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => err.msg || err.message).join(', ');
        } else {
          errorMessage = 'Invalid request format. Please check your input.';
        }
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid request format. Please check your input.';
      }
      const errorBotMessage = {
        from: 'bot',
        text: errorMessage,
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Responsive, accessible, animated chat bubble
  const renderMessage = (message, index) => {
    const isUser = message.from === 'user';
    const isBot = message.from === 'bot';
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.04 }}
        className={`group flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}
        tabIndex={0}
        aria-label={isUser ? 'Your message' : 'Bot message'}
      >
        <div className={`flex items-end gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
          {/* Avatar */}
          <div className="relative">
            {isUser ? userAvatar : botAvatar}
          </div>
          {/* Bubble */}
          <div className={`relative flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
            <div
              className={`px-4 py-2 rounded-2xl shadow-lg transition group-hover:ring-2 group-hover:ring-indigo-400
                ${isUser
                  ? 'bg-gradient-to-br from-indigo-600 to-blue-500 text-white'
                  : 'bg-white/90 dark:bg-gradient-to-br dark:from-indigo-900 dark:via-purple-900 dark:to-indigo-700 text-gray-900 dark:text-white backdrop-blur-md border border-gray-200/60 dark:border-indigo-900/40'}
                animate-fadeIn`}
              tabIndex={0}
              aria-label={isUser ? 'Your message bubble' : 'Bot message bubble'}
            >
              <span className="whitespace-pre-wrap break-words">{message.text}</span>
              {/* Sources for bot messages */}
              {isBot && message.sources && message.sources.length > 0 && showSources && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sources:</p>
                  <div className="space-y-1">
                    {message.sources.map((source, idx) => (
                      <div key={idx} className="text-xs text-indigo-600 dark:text-indigo-400">• {source}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Timestamp and Status (on hover or always on mobile) */}
            <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-gray-400 dark:text-gray-300">
              <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>{isUser ? statusIcon('sent') : statusIcon('delivered')}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const exportChat = (format) => {
    const chatContent = messages.map(msg => 
      `${msg.from === 'user' ? 'You' : 'AI'}: ${msg.text}`
    ).join('\n\n');
    
    if (format === 'txt') {
      const blob = new Blob([chatContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chat-${new Date().toISOString().split('T')[0]}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
    
    toast.success('Chat exported successfully');
  };

  const shareChat = async () => {
    try {
      const chatData = {
        messages: messages,
        timestamp: new Date()
      };

      if (navigator.share) {
        await navigator.share({
          title: 'Chat Conversation',
          text: 'Check out this conversation with our AI assistant',
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        const chatText = messages.map(msg => 
          `${msg.from === 'user' ? 'You' : 'AI'}: ${msg.text}`
        ).join('\n\n');
        
        await navigator.clipboard.writeText(chatText);
        toast.success('Chat copied to clipboard');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share chat');
    }
  };

  const handleFeedback = (messageId, feedback) => {
    toast.success('Thank you for your feedback!');
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={mainBgClass}>
      <div className="max-w-7xl w-full grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3 flex flex-col h-full">
          <div className={sidebarCardClass}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              {botAvatar}
              <div>
                <h2 className={getComponentClass('typography', 'h2')}>AI Assistant</h2>
                <p className={getComponentClass('typography', 'body') + ' mt-1'}>Your smart assistant for chat and document search</p>
              </div>
            </div>
            {/* Language Selector */}
            <div className="mb-4">
              <label className={getComponentClass('form', 'label') + ' mb-1'}>Language</label>
              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                aria-label="Select language"
              >
                {supportedLanguages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>
            </div>
            {/* Document Upload */}
            <div className="mb-4">
              <label className={getComponentClass('form', 'label') + ' mb-1'}>Upload Documents</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleDocumentUpload}
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.docx,.txt"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={getComponentClass('button', 'secondary') + ' w-full mb-2'}
                aria-label="Upload document"
              >
                <HiOutlineUpload className="inline mr-2" /> Upload Document
              </button>
              {/* List uploaded docs */}
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {documents.length === 0 ? (
                  <div className={getComponentClass('typography', 'caption')}>No documents uploaded</div>
                ) : (
                  documents.map(doc => (
                    <div key={doc.name} className="flex items-center justify-between bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-xs shadow-sm">
                      <span className="truncate text-gray-800 dark:text-gray-100" title={doc.name}>{doc.name}</span>
                      <button onClick={() => removeDocument(doc.name)} className="ml-2 text-red-500 hover:text-red-700" aria-label={`Remove ${doc.name}`}><HiOutlineTrash size={14} /></button>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* Context Selector */}
            <div>
              <label className={getComponentClass('form', 'label') + ' mb-1'}>Context</label>
              <select
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                aria-label="Select chat context"
              >
                <option value="general">General</option>
                <option value="documents">Document Search</option>
                <option value="technical">Technical Support</option>
                <option value="business">Business</option>
              </select>
            </div>
            {/* Quick Actions */}
            <div className="space-y-2 mt-4">
              <button
                onClick={() => setMessages([messages[0]])}
                className={getComponentClass('button', 'primary') + ' flex items-center gap-2 w-full'}
                aria-label="Reset chat"
              >
                <HiRefresh size={16} />
                Reset Chat
              </button>
              <button
                onClick={() => setSavedChats(prev => [...prev, { id: Date.now(), title: `Chat ${new Date().toLocaleDateString()}`, messages }])}
                className={getComponentClass('button', 'primary') + ' flex items-center gap-2 w-full'}
                aria-label="Save chat"
              >
                <HiOutlineBookmark size={16} />
                Save Chat
              </button>
            </div>
            {/* Saved Chats List */}
            <div className="mt-4">
              <h3 className={getComponentClass('typography', 'h3') + ' mb-2'}>Saved Chats</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {savedChats.length === 0 ? (
                  <div className={getComponentClass('typography', 'caption')}>No saved chats</div>
                ) : (
                  savedChats.map((chat) => (
                    <button key={chat.id} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-600/10 transition text-gray-700 dark:text-gray-200" aria-label={`Load chat: ${chat.title}`}>
                      <HiOutlineChatAlt2 size={16} />
                      <span className="truncate text-xs">{chat.title}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Main Chat Area */}
        <div className="col-span-9 flex flex-col h-[90vh]">
          <div className="relative flex flex-col h-full">
            {/* Chat Card */}
            <div className={cardClass + ' flex-1 flex flex-col h-[90vh] max-h-[90vh]'}>
              {/* Chat Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {userAvatar}
                  <div>
                    <h1 className={getComponentClass('typography', 'h1')}>AI Assistant</h1>
                    <p className={getComponentClass('typography', 'body')}>
                      {context === 'general' ? 'General Assistant' :
                        context === 'documents' ? 'Document Search' :
                          context === 'technical' ? 'Technical Support' : 'Business Assistant'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className={getComponentClass('button', 'secondary') + ' flex items-center gap-2'} aria-label="Export chat" data-tooltip-id="main-tooltip" data-tooltip-content="Export chat">
                    <HiOutlineArrowDown size={16} />
                  </button>
                  <button className={getComponentClass('button', 'secondary') + ' flex items-center gap-2'} aria-label="Share chat" data-tooltip-id="main-tooltip" data-tooltip-content="Share chat">
                    <HiOutlineTag size={16} />
                  </button>
                  <Tooltip id="main-tooltip" className="z-50 !bg-gray-900 !text-white !rounded-lg !px-3 !py-2 !shadow-lg" />
                </div>
              </div>
              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 h-full scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-transparent"
                onScroll={() => {
                  if (!chatContainerRef.current) return;
                  const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
                  setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
                }}
                ref={chatContainerRef}
                style={{ scrollBehavior: 'smooth' }}
                aria-live="polite"
              >
                {messages.map(renderMessage)}
                {botTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-end gap-3 max-w-[80%]"
                  >
                    {botAvatar}
                    <div className="px-4 py-2 rounded-2xl shadow-lg bg-white/90 dark:bg-gradient-to-br dark:from-indigo-900 dark:via-purple-900 dark:to-indigo-700 text-gray-900 dark:text-white animate-pulse flex items-center gap-2">
                      <ImSpinner8 className="animate-spin text-indigo-500" size={16} />
                      <span>AI is typing...</span>
                    </div>
                  </motion.div>
                )}
                {loading && !botTyping && (
                  <div className="w-fit max-w-2xl">
                    <div className="p-4 flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow">
                      <ImSpinner8 className="animate-spin text-indigo-500" size={16} />
                      <span className="text-gray-500 dark:text-gray-400">AI is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              {/* Input Area */}
              <div className="flex items-end gap-2 mt-auto relative z-10">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Type your message here..."
                    className={getComponentClass('form', 'input') + ' pr-20 resize-none'}
                    rows={1}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                    aria-label="Chat input"
                  />
                  {/* Emoji Picker Button */}
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="absolute right-14 bottom-2 p-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition" aria-label="Open emoji picker">
                    <HiOutlineTag size={16} />
                  </button>
                  {/* Voice Input Button */}
                  <button
                    onClick={() => setIsListening(!isListening)}
                    className={`absolute right-8 bottom-2 p-1 rounded-lg ${isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'} transition`}
                    aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                  >
                    <HiOutlineMicrophone size={16} />
                  </button>
                  {/* Emoji Picker Dropdown */}
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-14 right-0 z-50"
                    >
                      <EmojiPicker
                        onEmojiClick={(emojiData) => setInput(input + emojiData.emoji)}
                        theme={window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}
                        aria-label="Emoji picker"
                      />
                    </motion.div>
                  )}
                </div>
                <motion.button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  className={getComponentClass('button', 'primary') + ' p-3 rounded-lg shadow-lg focus:ring-2 focus:ring-indigo-400'}
                  aria-label="Send message"
                >
                  <HiOutlinePaperAirplane size={20} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
