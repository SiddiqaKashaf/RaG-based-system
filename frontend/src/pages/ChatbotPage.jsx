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
  HiOutlineUserGroup
} from 'react-icons/hi';
import { FaRobot } from 'react-icons/fa';
import { ImSpinner8 } from 'react-icons/im';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ChatbotPage() {
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
  const [documents, setDocuments] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const [savedChats, setSavedChats] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showSources, setShowSources] = useState(true);
  const [exportFormat, setExportFormat] = useState('txt');
  const [notificationSound, setNotificationSound] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(true);
  const [messageHistory, setMessageHistory] = useState([]);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(window.speechSynthesis);

  // New state variables for advanced features
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTeamSpace, setShowTeamSpace] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    dateRange: null,
    documentType: null,
    department: null,
    tags: []
  });
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [showDocumentManager, setShowDocumentManager] = useState(false);
  const [documentCategories, setDocumentCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    theme: 'light',
    notifications: true,
    autoSave: true,
    defaultView: 'chat'
  });

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
      setAvailableVoices(voices);
      // Set default voice to first English voice
      const englishVoice = voices.find(voice => voice.lang.startsWith('en-')) || voices[0];
      setSelectedVoice(englishVoice);
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

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
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
        if (documents.some(doc => doc.name === file.name)) {
          toast.warning(`${file.name} is already uploaded`);
          return;
        }

        const newDoc = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          file: file,
          uploadTime: new Date()
        };

        setDocuments(prev => [...prev, newDoc]);
        setContext('document');
        
        setMessages(prev => [...prev, { 
          from: 'bot', 
          text: `Document "${file.name}" has been loaded. You can now ask questions about it.`,
          type: 'upload',
          timestamp: new Date()
        }]);
      } else {
        toast.error(`${file.name} is not a supported file type. Please upload PDF or DOCX files.`);
      }
    });
  };

  const removeDocument = (docId) => {
    const docToRemove = documents.find(doc => doc.id === docId);
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    
    if (docToRemove) {
      setMessages(prev => [...prev, { 
        from: 'bot', 
        text: `Document "${docToRemove.name}" has been removed.`,
        type: 'system',
        timestamp: new Date()
      }]);
    }

    if (documents.length === 1) {
      setContext('general');
    }
  };

  const removeAllDocuments = () => {
    setDocuments([]);
    setContext('general');
    setMessages(prev => [...prev, { 
      from: 'bot', 
      text: 'All documents have been removed. You can now ask general questions or upload new documents.',
      type: 'system',
      timestamp: new Date()
    }]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUploadTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const resetChat = () => {
    setMessages([{ 
      from: 'bot', 
      text: 'Chat reset. You can ask a new question or upload a document.',
      type: 'system',
      timestamp: new Date()
    }]);
    setInput('');
  };

  const saveChat = () => {
    const chatData = {
      id: Date.now(),
      title: `Chat ${new Date().toLocaleString()}`,
      messages,
      context,
      file: documents.length > 0 ? documents[0].name : null,
      timestamp: new Date()
    };
    setSavedChats(prev => [...prev, chatData]);
    toast.success('Chat saved successfully!');
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      let response;
      if (context === 'document' && documents.length > 0) {
        const formData = new FormData();
        formData.append('file', documents[0].file);
        formData.append('question', input);
        
        try {
          response = await axios.post(
            'http://localhost:8000/query-doc',
            formData,
            { 
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              } 
            }
          );
        } catch (error) {
          if (error.response?.status === 404) {
            throw new Error('Document query endpoint not found. Please check if the server is running.');
          }
          throw error;
        }
      } else {
        try {
          response = await axios.post(
            'http://localhost:8000/api/chat',
            { 
              question: input,
              context: context
            },
            { 
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              } 
            }
          );
        } catch (error) {
          if (error.response?.status === 401) {
            throw new Error('Authentication failed. Please log in again.');
          }
          throw error;
        }
      }
      
      const botMsg = { 
        from: 'bot', 
        text: response.data.answer,
        type: context === 'document' ? 'document' : 'general',
        sources: response.data.sources || [],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Error sending message:', err);
      const errMsg = err.message || 'Sorry, something went wrong. Please try again.';
      setMessages(prev => [...prev, { 
        from: 'bot', 
        text: errMsg,
        type: 'error',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Add token validation on component mount
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessages(prev => [...prev, { 
          from: 'bot', 
          text: 'Please log in to use the chat.',
          type: 'error',
          timestamp: new Date()
        }]);
        return;
      }

      try {
        // You can add a token validation endpoint here
        // const response = await axios.get('http://localhost:8000/validate-token', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
      } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('token');
        setMessages(prev => [...prev, { 
          from: 'bot', 
          text: 'Your session has expired. Please log in again.',
          type: 'error',
          timestamp: new Date()
        }]);
      }
    };

    validateToken();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = (message) => {
    const isBot = message.from === 'bot';
    return (
      <div
        className={`flex items-start gap-2 transition-all duration-300 ease-in-out 
          ${isBot ? 'self-start flex-row' : 'self-end flex-row-reverse'}`}
      >
        <div className="p-2 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-white">
          {isBot ? <FaRobot /> : <HiUser />}
        </div>
        <div className="flex flex-col gap-1 max-w-[80%]">
          <div className={`p-3 rounded-lg whitespace-pre-wrap
            ${isBot
              ? 'bg-gray-200 text-gray-800 dark:bg-white/10 dark:text-white'
              : 'bg-indigo-800 text-white dark:bg-indigo-600'}`}
          >
            {message.text}
          </div>
          {message.sources && message.sources.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              Sources: {message.sources.join(', ')}
            </div>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    );
  };

  const exportChat = (format) => {
    const chatContent = messages.map(msg => {
      const timestamp = formatTimestamp(msg.timestamp);
      const source = msg.sources ? `\nSources: ${msg.sources.join(', ')}` : '';
      return `[${timestamp}] ${msg.from.toUpperCase()}: ${msg.text}${source}`;
    }).join('\n\n');

    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    setShowExportOptions(false);
    toast.success('Chat exported successfully!');
  };

  const shareChat = async () => {
    try {
      const chatData = {
        messages,
        documents: documents.map(doc => doc.name),
        timestamp: new Date().toISOString()
      };
      
      if (navigator.share) {
        await navigator.share({
          title: 'Shared Chat',
          text: 'Check out this chat conversation',
          files: [new File([JSON.stringify(chatData)], 'chat.json', { type: 'application/json' })]
        });
        toast.success('Chat shared successfully!');
      } else {
        // Fallback for browsers that don't support Web Share API
        const url = `data:application/json,${encodeURIComponent(JSON.stringify(chatData))}`;
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chat.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Chat downloaded as JSON!');
      }
    } catch (error) {
      toast.error('Failed to share chat');
    }
  };

  // New functions for advanced features
  const handleFeedback = (messageId, feedback) => {
    setCurrentFeedback({ messageId, feedback });
    // API call to save feedback
  };

  const categorizeDocument = (docId, category) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, category } : doc
    ));
  };

  const searchChatHistory = (query) => {
    // Implement semantic search across chat history
  };

  const exportAnalytics = () => {
    // Export usage analytics and insights
  };

  const shareWithTeam = (chatId, teamMembers) => {
    // Share chat with selected team members
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="w-full h-full max-w-[1920px] mx-auto p-6 rounded-3xl shadow-lg
        bg-white dark:bg-indigo-500/5 dark:backdrop-blur-lg dark:shadow-md dark:ring-1 dark:ring-white/20
        flex flex-col">
        
        {/* Top Navigation Bar */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold flex items-center gap-2 
              text-gray-800 dark:text-white">
              <HiOutlineChatAlt2 className="text-indigo-500" />
              AI Assistant
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDocuments(!showDocuments)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 
                text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-800 
                dark:text-white dark:hover:bg-indigo-700 transition"
            >
              <HiOutlineDocumentAdd />
              Manage Documents
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 
                text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-800 
                dark:text-white dark:hover:bg-indigo-700 transition"
            >
              <HiOutlineUpload />
              Upload Document
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg text-gray-500 hover:text-indigo-500 
                hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              title="Settings"
            >
              <HiOutlineCog size={20} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.docx"
              multiple
            />
          </div>
        </div>

        {/* Feature Navigation */}
        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
          <button
            onClick={() => setShowChatHistory(!showChatHistory)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              showChatHistory 
                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-white' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10'
            }`}
          >
            <HiOutlineClock size={18} />
            <span>Chat History</span>
          </button>
          <button
            onClick={() => setShowKnowledgeBase(!showKnowledgeBase)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              showKnowledgeBase 
                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-white' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10'
            }`}
          >
            <HiOutlineDocumentText size={18} />
            <span>Knowledge Base</span>
          </button>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              showAnalytics 
                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-white' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10'
            }`}
          >
            <HiOutlineLightBulb size={18} />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setShowTeamSpace(!showTeamSpace)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              showTeamSpace 
                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-white' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10'
            }`}
          >
            <HiOutlineUserGroup size={18} />
            <span>Team Space</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex gap-6 flex-1 min-h-0">
          {/* Chat Interface */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/70">
                <HiOutlineLightBulb className="text-indigo-500" />
                <span>Current Mode: {context === 'document' ? 'Document Search' : 'General Chat'}</span>
              </div>
              {documents.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/70">
                  <HiOutlineDocumentText className="text-indigo-500" />
                  <span>{documents.length} document{documents.length > 1 ? 's' : ''} loaded</span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col border rounded-lg overflow-hidden 
              border-gray-200 dark:border-white/20 min-h-0">
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-white/5">
                {messages.map((m, i) => (
                  <div key={i}>
                    {renderMessage(m)}
                  </div>
                ))}
                {loading && typingIndicator && (
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <ImSpinner8 className="animate-spin" />
                    <span>AI is typing...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="flex items-center gap-2 p-3 border-t border-gray-300 dark:border-white/20">
                <div className="relative">
                  <button
                    onClick={() => setShowExportOptions(!showExportOptions)}
                    className="p-2 rounded-lg text-gray-500 hover:text-indigo-500 
                      hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    title="More Options"
                  >
                    <HiOutlineBookmark size={20} />
                  </button>
                  {showExportOptions && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            saveChat();
                            setShowExportOptions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <HiOutlineBookmark size={16} />
                          Save Chat
                        </button>
                        <button
                          onClick={() => {
                            shareChat();
                            setShowExportOptions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <HiOutlineShare size={16} />
                          Share Chat
                        </button>
                        <button
                          onClick={() => {
                            resetChat();
                            setShowExportOptions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <HiRefresh size={16} />
                          Reset Chat
                        </button>
                        <button
                          onClick={() => {
                            exportChat(exportFormat);
                            setShowExportOptions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <HiOutlineDownload size={16} />
                          Export Chat
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex-1 flex items-center relative"
                >
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={context === 'document' 
                      ? "Ask a question about the document..."
                      : "Ask a general question or upload a document..."}
                    disabled={loading || isListening}
                    className="flex-1 px-4 py-2 pr-12 border rounded-lg h-12 resize-none 
                      text-black dark:text-white 
                      bg-white dark:bg-white/10 
                      focus:ring-2 focus:ring-indigo-400 
                      border-gray-300 dark:border-white/30"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      type="submit"
                      disabled={loading || isListening}
                      className="p-2 rounded-lg transition 
                        bg-indigo-600 text-white hover:bg-indigo-700 
                        disabled:opacity-50"
                    >
                      {loading ? <ImSpinner8 className="animate-spin" /> : <HiOutlinePaperAirplane size={20} />}
                    </button>
                  </div>
                </form>
                {voiceEnabled && (
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`p-2 rounded-lg transition-colors ${
                      isListening 
                        ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
                        : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                    }`}
                    title={isListening ? 'Stop Listening' : 'Start Voice Input'}
                  >
                    <HiOutlineMicrophone size={20} className={isListening ? 'animate-pulse' : ''} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Feature Panels */}
          {(showChatHistory || showKnowledgeBase || showAnalytics || showTeamSpace) && (
            <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 overflow-y-auto">
              {showChatHistory && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 dark:text-white">Chat History</h3>
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <div className="space-y-2">
                    {chatHistory.map(chat => (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChat(chat)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <p className="text-sm font-medium">{chat.title}</p>
                        <p className="text-xs text-gray-500">{chat.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showKnowledgeBase && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 dark:text-white">Knowledge Base</h3>
                  <div className="space-y-2">
                    {documentCategories.map(category => (
                      <div
                        key={category.id}
                        onClick={() => setSelectedCategory(category)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <p className="text-sm font-medium">{category.name}</p>
                        <p className="text-xs text-gray-500">{category.count} documents</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showAnalytics && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 dark:text-white">Analytics</h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm font-medium">Total Queries</p>
                      <p className="text-2xl font-bold">1,234</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm font-medium">Success Rate</p>
                      <p className="text-2xl font-bold">98%</p>
                    </div>
                    <button
                      onClick={exportAnalytics}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Export Analytics
                    </button>
                  </div>
                </div>
              )}

              {showTeamSpace && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 dark:text-white">Team Space</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm font-medium">Active Users</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm font-medium">Shared Documents</p>
                      <p className="text-2xl font-bold">45</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Keep existing modals */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">User Settings</h3>
              <button
                onClick={() => setShowUserSettings(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <HiOutlineXCircle size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Toggle dark/light theme</p>
                </div>
                <input
                  type="checkbox"
                  checked={userPreferences.theme === 'dark'}
                  onChange={(e) => setUserPreferences(prev => ({
                    ...prev,
                    theme: e.target.checked ? 'dark' : 'light'
                  }))}
                  className="toggle toggle-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Enable/disable notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={userPreferences.notifications}
                  onChange={(e) => setUserPreferences(prev => ({
                    ...prev,
                    notifications: e.target.checked
                  }))}
                  className="toggle toggle-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-save</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Automatically save chat history</p>
                </div>
                <input
                  type="checkbox"
                  checked={userPreferences.autoSave}
                  onChange={(e) => setUserPreferences(prev => ({
                    ...prev,
                    autoSave: e.target.checked
                  }))}
                  className="toggle toggle-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showDocumentManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Document Manager</h3>
              <button
                onClick={() => setShowDocumentManager(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <HiOutlineXCircle size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Categories</h4>
                <div className="space-y-2">
                  {documentCategories.map(category => (
                    <div
                      key={category.id}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Documents</h4>
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{doc.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{doc.category}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => categorizeDocument(doc.id, 'new-category')}
                            className="p-1 rounded-lg text-gray-500 hover:text-indigo-500"
                          >
                            <HiOutlineTag size={16} />
                          </button>
                          <button
                            onClick={() => removeDocument(doc.id)}
                            className="p-1 rounded-lg text-gray-500 hover:text-red-500"
                          >
                            <HiOutlineTrash size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUserSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">User Settings</h3>
              <button
                onClick={() => setShowUserSettings(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <HiOutlineXCircle size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Toggle dark/light theme</p>
                </div>
                <input
                  type="checkbox"
                  checked={userPreferences.theme === 'dark'}
                  onChange={(e) => setUserPreferences(prev => ({
                    ...prev,
                    theme: e.target.checked ? 'dark' : 'light'
                  }))}
                  className="toggle toggle-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Enable/disable notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={userPreferences.notifications}
                  onChange={(e) => setUserPreferences(prev => ({
                    ...prev,
                    notifications: e.target.checked
                  }))}
                  className="toggle toggle-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-save</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Automatically save chat history</p>
                </div>
                <input
                  type="checkbox"
                  checked={userPreferences.autoSave}
                  onChange={(e) => setUserPreferences(prev => ({
                    ...prev,
                    autoSave: e.target.checked
                  }))}
                  className="toggle toggle-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
