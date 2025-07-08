import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineFolder,
  HiOutlineDocument,
  HiOutlineTag,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineLockClosed,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineSortAscending,
  HiOutlineDotsVertical,
  HiOutlineDownload,
  HiOutlineShare,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineEye,
  HiOutlineArchive,
  HiOutlineRefresh,
  HiOutlineDocumentDuplicate,
  HiOutlineLink,
  HiOutlineKey,
  HiOutlineClipboardCheck,
  HiOutlineChartBar,
  HiOutlineViewGrid,
  HiOutlineViewList
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import axios from 'axios';
import DocumentPreview from '../components/DocumentPreview';
import { useTheme } from '../theme';

export default function DocumentManagementPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'type'
  const [filterType, setFilterType] = useState('all'); // 'all', 'pdf', 'doc', 'image'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    dateRange: 'all',
    fileType: 'all',
    status: 'all',
    department: 'all'
  });
  const fileInputRef = useRef(null);
  const { getComponentClass } = useTheme();

  // Default document thumbnail as data URI
  const defaultThumbnail = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z'/%3E%3Cpath d='M14 2v6h6'/%3E%3C/svg%3E";

  // Mock data for demonstration
  const [folders] = useState([
    { id: 1, name: 'Projects', count: 12, color: 'blue' },
    { id: 2, name: 'Reports', count: 8, color: 'green' },
    { id: 3, name: 'Contracts', count: 5, color: 'purple' },
    { id: 4, name: 'Policies', count: 3, color: 'orange' },
  ]);

  // Update mock data to use a different placeholder service
  useEffect(() => {
    const mockDocuments = [
      {
        id: 1,
        name: 'Q4 Financial Report.pdf',
        type: 'pdf',
        size: '2.4 MB',
        lastModified: '2024-03-15',
        owner: 'John Doe',
        tags: ['finance', 'report', 'q4'],
        thumbnail: defaultThumbnail,
        status: 'active'
      },
      {
        id: 2,
        name: 'Project Proposal.docx',
        type: 'doc',
        size: '1.8 MB',
        lastModified: '2024-03-14',
        owner: 'Jane Smith',
        tags: ['proposal', 'project'],
        thumbnail: defaultThumbnail,
        status: 'active'
      }
    ];
    setDocuments(mockDocuments);
    setLoading(false);
  }, [defaultThumbnail]);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    setShowUploadModal(true);
    setUploadProgress(0);

    try {
      // Get the authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to upload documents');
        setShowUploadModal(false);
        return;
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        formData.append('category', selectedFolder?.name || 'Uncategorized');

        // Upload file to backend with authentication token
        await axios.post('http://localhost:8000/api/documents/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          },
        });

        // Add to local state
        const newDoc = {
          id: Date.now() + i,
          name: file.name,
          type: file.type.split('/')[1],
          size: formatFileSize(file.size),
          lastModified: new Date().toISOString().split('T')[0],
          owner: 'You',
          tags: [],
          status: 'pending',
          version: '1.0',
          thumbnail: defaultThumbnail
        };

        setDocuments(prev => [...prev, newDoc]);
      }

      toast.success('Files uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to upload documents');
      } else {
        toast.error('Failed to upload files');
      }
    } finally {
      setShowUploadModal(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDelete = async (docId) => {
    try {
      // API call to delete document
      await axios.delete(`http://localhost:8000/api/documents/${docId}`);
      setDocuments(docs => docs.filter(doc => doc.id !== docId));
      toast.success('Document deleted successfully');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleShare = (docId) => {
    // Implement sharing functionality
    toast.info('Sharing functionality coming soon!');
  };

  const filteredDocuments = documents
    .filter(doc => {
      if (filterType === 'all') return true;
      return doc.type === filterType;
    })
    .filter(doc => 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.lastModified) - new Date(a.lastModified);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  const renderFolderStructure = () => (
    <div className={getComponentClass('card', 'contactGlass') + ' p-6'}>
      <h2 className={getComponentClass('typography', 'h2') + ' flex items-center gap-2 text-gray-800 dark:text-white mb-4'}>
        <HiOutlineFolder className="text-blue-600 dark:text-blue-400" />
        Folder Structure
      </h2>
      <div className="space-y-2">
        {folders.map(folder => (
          <motion.div
            key={folder.id}
            whileHover={{ x: 4 }}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
              selectedFolder === folder.id
                ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
            onClick={() => setSelectedFolder(folder.id)}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${folder.color}-50 dark:bg-${folder.color}-900/30`}>
                <HiOutlineFolder className={`w-5 h-5 text-${folder.color}-600 dark:text-${folder.color}-400`} />
              </div>
              <span className="font-medium text-gray-800 dark:text-white">{folder.name}</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{folder.count} items</span>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderMetadataPanel = () => (
    <div className={getComponentClass('card', 'contactGlass') + ' p-6'}>
      <h2 className={getComponentClass('typography', 'h2') + ' flex items-center gap-2 text-gray-800 dark:text-white mb-4'}>
        <HiOutlineTag className="text-purple-600 dark:text-purple-400" />
        Document Metadata
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Document Type
            </label>
            <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
              <option>Report</option>
              <option>Contract</option>
              <option>Policy</option>
              <option>Proposal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department
            </label>
            <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
              <option>Finance</option>
              <option>HR</option>
              <option>IT</option>
              <option>Operations</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {['finance', 'report', 'q4'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                {tag}
              </span>
            ))}
            <button className="px-3 py-1 border border-dashed border-gray-300 dark:border-gray-600 rounded-full text-sm text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500">
              + Add Tag
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWorkflowPanel = () => (
    <div className={getComponentClass('card', 'contactGlass') + ' p-6'}>
      <h2 className={getComponentClass('typography', 'h2') + ' flex items-center gap-2 text-gray-800 dark:text-white mb-4'}>
        <HiOutlineClock className="text-green-600 dark:text-green-400" />
        Workflow Status
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30">
              <HiOutlineCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Draft Created</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">By John Doe on Mar 15, 2024</p>
            </div>
          </div>
          <span className="text-sm text-green-600 dark:text-green-400">Completed</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/30">
              <HiOutlineExclamationCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Under Review</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">By Jane Smith on Mar 16, 2024</p>
            </div>
          </div>
          <span className="text-sm text-yellow-600 dark:text-yellow-400">In Progress</span>
        </div>
      </div>
    </div>
  );

  const renderSecurityPanel = () => (
    <div className={getComponentClass('card', 'contactGlass') + ' p-6'}>
      <h2 className={getComponentClass('typography', 'h2') + ' flex items-center gap-2 text-gray-800 dark:text-white mb-4'}>
        <HiOutlineShieldCheck className="text-red-600 dark:text-red-400" />
        Security & Access
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30">
              <HiOutlineLockClosed className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Access Level</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Restricted to Finance Department</p>
            </div>
          </div>
          <button className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg text-sm">
            Change
          </button>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
              <HiOutlineKey className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Encryption</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">AES-256 Encryption Enabled</p>
            </div>
          </div>
          <span className="text-sm text-green-600 dark:text-green-400">Active</span>
        </div>
      </div>
    </div>
  );

  const renderAdvancedSearch = () => (
    <div className={getComponentClass('card', 'contactGlass') + ' p-6'}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date Range
          </label>
          <select
            value={searchFilters.dateRange}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            File Type
          </label>
          <select
            value={searchFilters.fileType}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, fileType: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word</option>
            <option value="xlsx">Excel</option>
            <option value="pptx">PowerPoint</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={searchFilters.status}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, status: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Department
          </label>
          <select
            value={searchFilters.department}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, department: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          >
            <option value="all">All Departments</option>
            <option value="finance">Finance</option>
            <option value="hr">HR</option>
            <option value="it">IT</option>
            <option value="operations">Operations</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => setShowAdvancedSearch(false)}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            // Apply filters
            setShowAdvancedSearch(false);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  // Update the search and filter bar in the main content area
  const renderSearchBar = () => (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
        />
        <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      <button
        onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
        className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
      >
        <HiOutlineFilter size={20} />
      </button>
      <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
        <HiOutlineSortAscending size={20} />
      </button>
    </div>
  );

  // Update the document card click handler
  const handleDocumentClick = (doc) => {
    setSelectedDocument(doc);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={getComponentClass('typography', 'h1')}>Document Management</h1>
            <p className={getComponentClass('typography', 'body')}>Manage and organize your enterprise documents</p>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <HiOutlinePlus size={20} />
              Upload Document
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <HiOutlineViewGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <HiOutlineViewList size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3 space-y-6">
            {renderFolderStructure()}
            {renderMetadataPanel()}
          </div>

          {/* Main Document Area */}
          <div className="col-span-6">
            <div className={getComponentClass('card', 'contactGlass') + ' p-6'}>
              {renderSearchBar()}
              {showAdvancedSearch && renderAdvancedSearch()}
              
              {/* Document Grid/List */}
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
                {filteredDocuments.map(doc => (
                  <motion.div
                    key={doc.id}
                    whileHover={{ y: -4 }}
                    onClick={() => handleDocumentClick(doc)}
                    className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 cursor-pointer ${
                      viewMode === 'list' ? 'flex items-center justify-between' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        {doc.type === 'pdf' ? (
                          <HiOutlineDocument className="w-6 h-6 text-red-600 dark:text-red-400" />
                        ) : doc.type === 'docx' ? (
                          <HiOutlineDocument className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <HiOutlineDocument className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white">{doc.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {doc.size} • Modified {doc.lastModified}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            doc.status === 'approved'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          }`}>
                            {doc.status}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                            v{doc.version}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <HiOutlineEye size={20} />
                      </button>
                      <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <HiOutlineDownload size={20} />
                      </button>
                      <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <HiOutlineShare size={20} />
                      </button>
                      <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <HiOutlineDotsVertical size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3 space-y-6">
            {renderWorkflowPanel()}
            {renderSecurityPanel()}
          </div>
        </div>
      </div>

      {/* Upload Progress Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={getComponentClass('card', 'contactGlass') + ' w-full max-w-md p-6'}>
            <h3 className={getComponentClass('typography', 'h3') + ' mb-4'}>Uploading Files</h3>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
              {uploadProgress}% Complete
            </p>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {selectedDocument && (
        <DocumentPreview
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
} 