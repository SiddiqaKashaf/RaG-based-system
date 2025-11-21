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
import { Tooltip } from 'react-tooltip';
import { BsCheck2, BsCheck2All } from 'react-icons/bs';
import ReactMarkdown from 'react-markdown';


export default function ChatbotPage() {
  // Correct background and card classes for each mode
  const mainBgClass = 'min-h-screen w-full flex items-center justify-center py-8 px-2 bg-white dark:bg-gradient-to-br dark:from-[#181824] dark:via-[#23235b] dark:to-[#3a1c71]';
  const cardClass = 'rounded-3xl shadow-2xl backdrop-blur-lg bg-white/90 border border-gray-200 p-8 dark:bg-gray-900/60 dark:border-white/20';
  const sidebarCardClass = 'rounded-3xl shadow-xl backdrop-blur-lg bg-white/95 border border-gray-200 flex flex-col gap-6 p-6 h-full dark:bg-gray-900/60 dark:border-white/20';

  // Load messages from sessionStorage on mount, or use default welcome message
  const loadMessagesFromStorage = () => {
    try {
      const stored = sessionStorage.getItem('chatbot_messages');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        return parsed.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (e) {
      console.error('Error loading messages from storage:', e);
    }
    return [
      { 
        from: 'bot', 
        text: 'Hello! Welcome to the organization. I\'m here to assist you with any questions about our policies, procedures, employee benefits, onboarding, or document search. How may I help you today?',
        type: 'welcome',
        timestamp: new Date()
      }
    ];
  };

  // Concise state
  const [messages, setMessages] = useState(loadMessagesFromStorage);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState('general');
  const [savedChats, setSavedChats] = useState([]);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showSources, setShowSources] = useState(true);
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

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem('chatbot_messages', JSON.stringify(messages));
    } catch (e) {
      console.error('Error saving messages to storage:', e);
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  // Language removed - using default English
  const supportedLanguages = [
    { code: 'en-US', label: 'English' },
    { code: 'ur-PK', label: 'Urdu' }
  ];

  // Add document state
  const [documents, setDocuments] = useState([]);
  const [selectedLanguage] = useState('en-US'); // Fixed to English
  const fileInputRef = useRef(null);
  // Previously uploaded documents from backend
  const [userDocs, setUserDocs] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [loadingUserDocs, setLoadingUserDocs] = useState(false);
  const [isWaitingForIndexing, setIsWaitingForIndexing] = useState(false);

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
      // If user uploads documents, switch context to document search automatically
      setContext('documents');
      toast.success(`${file.name} uploaded successfully`);
    });
    e.target.value = '';
  };

  // Fetch user's previously uploaded documents from backend
  const fetchUserDocuments = async (token) => {
    setLoadingUserDocs(true);
    try {
      const resp = await axios.get('http://localhost:8000/api/chat/user-documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserDocs(resp.data.documents || []);
    } catch (err) {
      console.error('Failed to fetch user documents', err);
    } finally {
      setLoadingUserDocs(false);
    }
  };

  // Polling helper: wait until provided document IDs have status 'completed' or timeout
  const pollDocumentCompletion = async (docIds, token, timeoutMs = 30000, intervalMs = 2000) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const resp = await axios.get('http://localhost:8000/api/chat/user-documents', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const docs = resp.data.documents || [];
        const idToStatus = new Map(docs.map(d => [d.document_id, d.processing_status]));
        const unfinished = docIds.filter(id => idToStatus.get(id) !== 'completed');
        setUserDocs(docs);
        if (unfinished.length === 0) return true;
      } catch (err) {
        console.error('Polling error', err);
      }
      await new Promise(r => setTimeout(r, intervalMs));
    }
    return false;
  };

  // Load user docs on mount and refresh periodically
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetchUserDocuments(token);
    const iv = setInterval(() => fetchUserDocuments(token), 10000);
    return () => clearInterval(iv);
  }, []);

  // Load saved chats from API on mount
  const loadSavedChats = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await axios.get('http://localhost:8000/api/chat/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sessions = response.data.sessions || [];
      // Convert sessions to saved chats format
      const formattedChats = sessions.map(session => ({
        id: session.session_id,
        title: session.title || `Chat ${new Date(session.created_at).toLocaleDateString()}`,
        session_id: session.session_id,
        context: session.context,
        created_at: session.created_at,
        message_count: session.message_count || 0
      }));
      setSavedChats(formattedChats);
    } catch (error) {
      console.error('Error loading saved chats:', error);
    }
  };

  useEffect(() => {
    loadSavedChats();
  }, []);

  // Save chat to backend
  const saveChatToBackend = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to save chats');
      return;
    }

    if (messages.length <= 1) {
      toast.warning('No messages to save');
      return;
    }

    try {
      // Generate a title from the first user message
      const firstUserMessage = messages.find(m => m.from === 'user');
      const title = firstUserMessage 
        ? firstUserMessage.text.substring(0, 50) + (firstUserMessage.text.length > 50 ? '...' : '')
        : `Chat ${new Date().toLocaleDateString()}`;

      const response = await axios.post('http://localhost:8000/api/chat/save-session', {
        title: title,
        messages: messages,
        context: context
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Chat saved successfully');
      // Reload saved chats
      await loadSavedChats();
    } catch (error) {
      console.error('Error saving chat:', error);
      toast.error(error.response?.data?.detail || 'Failed to save chat');
    }
  };

  // Load a saved chat session
  const loadChatSession = async (sessionId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to load chats');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8000/api/chat/session/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const session = response.data;
      // Parse messages if stored as string
      let parsedMessages = session.messages;
      if (typeof parsedMessages === 'string') {
        try {
          parsedMessages = JSON.parse(parsedMessages);
        } catch (e) {
          // If parsing fails, try eval (for Python string representation)
          try {
            parsedMessages = eval(parsedMessages);
          } catch (e2) {
            console.error('Error parsing messages:', e2);
            parsedMessages = [];
          }
        }
      }
      
      // Set messages and context
      setMessages(parsedMessages || []);
      if (session.context) {
        setContext(session.context);
      }
      toast.success('Chat loaded successfully');
    } catch (error) {
      console.error('Error loading chat session:', error);
      toast.error(error.response?.data?.detail || 'Failed to load chat');
    }
  };

  // Delete a saved chat session
  const deleteChatSession = async (sessionId, e) => {
    e.stopPropagation(); // Prevent loading the chat when clicking delete
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to delete chats');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/chat/session/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Chat deleted successfully');
      // Reload saved chats
      await loadSavedChats();
    } catch (error) {
      console.error('Error deleting chat session:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete chat');
    }
  };

  // Reset chat function
  const resetChat = () => {
    const welcomeMessage = [{
      from: 'bot',
      text: 'Hello! Welcome to the organization. I\'m here to assist you with any questions about our policies, procedures, employee benefits, onboarding, or document search. How may I help you today?',
      type: 'welcome',
      timestamp: new Date()
    }];
    setMessages(welcomeMessage);
    try {
      sessionStorage.setItem('chatbot_messages', JSON.stringify(welcomeMessage));
    } catch (e) {
      console.error('Error saving messages to storage:', e);
    }
    setDocuments([]);
    setSelectedDocIds([]);
    toast.info('Chat reset');
  };

  // Handle context change - reset chat when context changes
  const handleContextChange = (newContext) => {
    if (newContext !== context) {
      // Reset chat when context changes
      resetChat();
      setContext(newContext);
      // Show helpful message when switching contexts
      if (newContext === 'documents') {
        toast.info('Document Search mode: Upload or select documents to search within them.');
      } else if (newContext === 'general') {
        toast.info('General mode: Ask questions about the organization, policies, procedures, and employee information.');
      }
    }
  };

  const removeDocument = (name) => {
    setDocuments(prev => prev.filter(doc => doc.name !== name));
    toast.info('Document removed');
  };

  // Delete uploaded document from backend
  const deleteUserDocument = async (documentId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to delete documents');
      return;
    }
    
    try {
      await axios.delete(`http://localhost:8000/api/chat/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Document deleted successfully');
      // Remove from selected documents if selected
      setSelectedDocIds(prev => prev.filter(id => id !== documentId));
      // Refresh document list
      await fetchUserDocuments(token);
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete document');
    }
  };

  // Update voice recognition and synthesis to use selected language
  // Voice features removed - this hook is no longer needed
  useEffect(() => {
    // Voice features have been disabled
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
    const messageToSend = input;
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
      // If there are files to upload, upload them first to /api/chat/upload-documents
      let documentIds = null;
      if (documents && documents.length > 0) {
        try {
          const uploadForm = new FormData();
          documents.forEach((file) => uploadForm.append('files', file));
          const uploadResp = await axios.post('http://localhost:8000/api/chat/upload-documents', uploadForm, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });

          // Collect document IDs returned by backend
          const uploaded = uploadResp.data?.uploaded_documents || [];
          documentIds = uploaded.filter(d => d.document_id).map(d => d.document_id);
          // Auto-select newly uploaded documents in the UI
          if (documentIds.length > 0) {
            setSelectedDocIds(prev => Array.from(new Set([...prev, ...documentIds])));
            // Refresh user docs list
            await fetchUserDocuments(token);
          }
        } catch (err) {
          console.error('Upload error', err);
          throw new Error('Failed to upload documents');
        }
      }

      // Prepare form data for RAG chat endpoint
      const chatForm = new FormData();
      chatForm.append('question', messageToSend);
      chatForm.append('context', context);
      chatForm.append('language', selectedLanguage);
      
      // Only include documents if context is "documents"
      if (context === 'documents') {
        if (documentIds && documentIds.length > 0) {
          // Optionally wait for indexing to finish before sending the chat
          setIsWaitingForIndexing(true);
          const allIndexed = await pollDocumentCompletion(documentIds, token, 30000, 2000);
          setIsWaitingForIndexing(false);
          if (!allIndexed) {
            toast.info('Some documents are still indexing; answers may be incomplete.');
          }
          chatForm.append('documents', JSON.stringify(documentIds));
        } else if (selectedDocIds && selectedDocIds.length > 0) {
          // If user selected previously uploaded docs, ensure they are ready (optional wait)
          setIsWaitingForIndexing(true);
          const allIndexed = await pollDocumentCompletion(selectedDocIds, token, 30000, 2000);
          setIsWaitingForIndexing(false);
          if (!allIndexed) {
            toast.info('Some selected documents are still indexing; answers may be incomplete.');
          }
          chatForm.append('documents', JSON.stringify(selectedDocIds));
        } else {
          // No documents selected but context is documents - backend will handle this
          toast.info('No documents selected. Searching all your uploaded documents...');
        }
      }

      const response = await axios.post('http://localhost:8000/api/chat/rag', chatForm, {
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
                  ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 dark:from-indigo-700 dark:to-indigo-600 text-white'
                  : 'bg-white/90 dark:bg-gradient-to-br dark:from-indigo-900 dark:via-purple-900 dark:to-indigo-700 text-gray-900 dark:text-white backdrop-blur-md border border-gray-200/60 dark:border-indigo-900/40'}
                animate-fadeIn`}
              tabIndex={0}
              aria-label={isUser ? 'Your message bubble' : 'Bot message bubble'}
            >
              <div className={`prose prose-sm dark:prose-invert max-w-none break-words ${isUser ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className={`mb-2 last:mb-0 leading-relaxed ${isUser ? 'text-white' : ''}`}>{children}</p>,
                    strong: ({ children }) => <strong className={`font-bold ${isUser ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{children}</strong>,
                    em: ({ children }) => <em className={`italic ${isUser ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>{children}</em>,
                    ul: ({ children }) => <ul className="list-disc list-outside mb-3 ml-4 space-y-1.5">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-outside mb-3 ml-4 space-y-1.5">{children}</ol>,
                    li: ({ children }) => <li className={`ml-2 leading-relaxed ${isUser ? 'text-white' : ''}`}>{children}</li>,
                    h1: ({ children }) => <h1 className={`text-xl font-bold mb-3 mt-2 ${isUser ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{children}</h1>,
                    h2: ({ children }) => <h2 className={`text-lg font-bold mb-2 mt-3 ${isUser ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{children}</h2>,
                    h3: ({ children }) => <h3 className={`text-base font-semibold mb-1.5 mt-2 ${isUser ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{children}</h3>,
                    code: ({ children }) => <code className={`${isUser ? 'bg-gray-700 text-white' : 'bg-gray-100 dark:bg-gray-800'} px-1.5 py-0.5 rounded text-sm`}>{children}</code>,
                    blockquote: ({ children }) => <blockquote className={`border-l-4 ${isUser ? 'border-white' : 'border-indigo-500'} pl-4 italic my-2 ${isUser ? 'text-white' : ''}`}>{children}</blockquote>,
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
              {/* Sources for bot messages */}
              {isBot && message.sources && message.sources.length > 0 && showSources && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sources:</p>
                  <div className="space-y-1">
                    {message.sources.map((source, idx) => {
                        // Ensure we render a string for each source. Backend may return objects.
                        let srcText = '';
                        if (typeof source === 'string') srcText = source;
                        else if (source === null || source === undefined) srcText = '';
                        else if (typeof source === 'object') {
                          // Prefer top-level source, then metadata.source or metadata.filename, then document_id
                          srcText = source.source || (source.metadata && (source.metadata.source || source.metadata.filename)) || source.document_id || source.filename || source.chunk_id || '';
                          if (!srcText && source.content) srcText = String(source.content).slice(0, 160) + (String(source.content).length > 160 ? '…' : '');
                          if (!srcText) {
                            try { srcText = JSON.stringify(source); } catch (e) { srcText = String(source); }
                          }
                        } else {
                          srcText = String(source);
                        }

                        return (
                          <div key={idx} className="text-xs text-indigo-600 dark:text-indigo-400">• {srcText}</div>
                        );
                      })}
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
            {/* Document Upload - Only show when context is "documents" */}
            {context === 'documents' && (
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
                {/* Previously uploaded documents from backend */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className={getComponentClass('form', 'label') + ' mb-0'}>Your Documents</label>
                    <button onClick={async () => { const token = localStorage.getItem('token'); if (token) await fetchUserDocuments(token); }} className="text-xs text-indigo-600">Refresh</button>
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {loadingUserDocs ? (
                      <div className="text-sm text-gray-500">Loading documents...</div>
                    ) : userDocs.length === 0 ? (
                      <div className={getComponentClass('typography', 'caption')}>No previously uploaded documents</div>
                    ) : (
                      userDocs.map(doc => (
                        <div key={doc.document_id} className="flex items-center justify-between bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-xs shadow-sm">
                          <label className="flex items-center gap-2 flex-1 min-w-0">
                            <input type="checkbox" checked={selectedDocIds.includes(doc.document_id)} onChange={(e) => {
                              if (e.target.checked) setSelectedDocIds(prev => [...prev, doc.document_id]);
                              else setSelectedDocIds(prev => prev.filter(id => id !== doc.document_id));
                            }} />
                            <span className="truncate text-gray-800 dark:text-gray-100" title={doc.filename}>{doc.filename}</span>
                          </label>
                          <div className="flex items-center gap-2">
                            {doc.processing_status === 'processing' && <ImSpinner8 className="animate-spin text-indigo-500" size={14} />}
                            <span className={`text-xs ${doc.processing_status === 'completed' ? 'text-green-600' : doc.processing_status === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>{doc.processing_status}</span>
                            <button
                              onClick={() => deleteUserDocument(doc.document_id)}
                              className="text-red-500 hover:text-red-700 ml-1"
                              aria-label={`Delete ${doc.filename}`}
                              title="Delete document"
                            >
                              <HiOutlineTrash size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Context Selector */}
            <div>
              <label className={getComponentClass('form', 'label') + ' mb-1'}>Context</label>
              <select
                value={context}
                onChange={(e) => handleContextChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                aria-label="Select chat context"
              >
                <option value="general">General</option>
                <option value="documents">Document Search</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {context === 'documents' && 'Upload documents to search within them'}
                {context === 'general' && 'Ask questions about the organization, policies, procedures, and employee information'}
              </p>
            </div>
            {/* Quick Actions */}
            <div className="space-y-2 mt-4">
              <button
                onClick={resetChat}
                className={getComponentClass('button', 'primary') + ' flex items-center gap-2 w-full'}
                aria-label="Reset chat"
              >
                <HiRefresh size={16} />
                Reset Chat
              </button>
              <button
                onClick={saveChatToBackend}
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
                    <div key={chat.id || chat.session_id} className="group flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-600/10 transition">
                      <button
                        onClick={() => loadChatSession(chat.session_id || chat.id)}
                        className="flex-1 flex items-center gap-2 text-left text-gray-700 dark:text-gray-200 min-w-0"
                        aria-label={`Load chat: ${chat.title}`}
                      >
                        <HiOutlineChatAlt2 size={16} className="flex-shrink-0" />
                        <span className="truncate text-xs">{chat.title}</span>
                      </button>
                      <button
                        onClick={(e) => deleteChatSession(chat.session_id || chat.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 flex-shrink-0"
                        aria-label={`Delete chat: ${chat.title}`}
                        title="Delete chat"
                      >
                        <HiOutlineTrash size={14} />
                      </button>
                    </div>
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
                      {context === 'general' ? 'General Assistant' : 'Document Search'}
                    </p>
                  </div>
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
                    className={getComponentClass('form', 'input') + ' resize-none'}
                    rows={1}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                    aria-label="Chat input"
                  />
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
