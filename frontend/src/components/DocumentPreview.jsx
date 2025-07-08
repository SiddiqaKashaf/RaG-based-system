import React, { useState } from 'react';
import {
  HiOutlineDocument,
  HiOutlinePencil,
  HiOutlineEye,
  HiOutlineDownload,
  HiOutlineShare,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineChat,
  HiOutlineAnnotation,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineDotsVertical,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineSortAscending,
  HiOutlineBookmark,
  HiOutlineTag,
  HiOutlineLink,
  HiOutlineDocumentDuplicate,
  HiOutlineRefresh,
  HiOutlineArchive,
  HiOutlineTrash
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocumentPreview({ document, onClose }) {
  const [activeTab, setActiveTab] = useState('preview');
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(document?.content || '');

  // Mock data for demonstration
  const [comments] = useState([
    {
      id: 1,
      user: 'John Doe',
      content: 'Please review the financial figures in section 3.',
      timestamp: '2024-03-15 10:30 AM',
      type: 'comment'
    },
    {
      id: 2,
      user: 'Jane Smith',
      content: 'Updated the quarterly projections.',
      timestamp: '2024-03-15 11:45 AM',
      type: 'edit'
    }
  ]);

  const [versions] = useState([
    {
      id: 1,
      version: '2.1',
      user: 'Jane Smith',
      timestamp: '2024-03-15 11:45 AM',
      changes: 'Updated quarterly projections'
    },
    {
      id: 2,
      version: '2.0',
      user: 'John Doe',
      timestamp: '2024-03-14 03:20 PM',
      changes: 'Added executive summary'
    }
  ]);

  const renderPreview = () => (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {document?.name}
          </h1>
          <div className="prose dark:prose-invert max-w-none">
            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            ) : (
              <div className="whitespace-pre-wrap">{document?.content}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderComments = () => (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-4">
          {comments.map(comment => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  {comment.type === 'comment' ? (
                    <HiOutlineChat className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <HiOutlinePencil className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      {comment.user}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {comment.timestamp}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    {comment.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            rows={3}
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => {
                // Handle comment submission
                setComment('');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Post Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVersions = () => (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-4">
          {versions.map(version => (
            <motion.div
              key={version.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30">
                  <HiOutlineDocumentDuplicate className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        Version {version.version}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {version.user}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {version.timestamp}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    {version.changes}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-50 dark:bg-gray-900 w-full h-full md:w-11/12 md:h-5/6 rounded-xl shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <HiOutlineXCircle size={24} />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {document?.name}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <HiOutlinePencil size={20} />
            </button>
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <HiOutlineDownload size={20} />
            </button>
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <HiOutlineShare size={20} />
            </button>
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <HiOutlineDotsVertical size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'preview'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'comments'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Comments
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'versions'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Versions
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'preview' && renderPreview()}
            {activeTab === 'comments' && renderComments()}
            {activeTab === 'versions' && renderVersions()}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
} 