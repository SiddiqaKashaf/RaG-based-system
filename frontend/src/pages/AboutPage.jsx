import React from 'react';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { FaFileUpload, FaComments, FaChartBar, FaRegLightbulb, FaLock } from 'react-icons/fa';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 rounded-3xl shadow-lg
      bg-white dark:bg-indigo-500/5 dark:backdrop-blur-lg dark:shadow-md dark:ring-1 dark:ring-white/20 space-y-6"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-indigo-600 dark:text-indigo-300 hover:underline mb-4"
      >
        <HiOutlineArrowLeft className="text-xl" />
        Back
      </button>

      <h2 className="text-3xl font-bold text-gray-800 dark:text-indigo-100 border-b pb-2 border-indigo-300 dark:border-indigo-400">
        About Our RAG System
      </h2>

      <p className="text-gray-700 dark:text-indigo-100 leading-relaxed">
        Our Retrieval-Augmented Generation (RAG) system is a smart, secure, and scalable AI assistant tailored for modern IT companies. It offers a seamless experience for managing documents and gaining insights efficiently.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-800 dark:text-indigo-100">
        <div className="flex gap-3 items-start">
          <FaFileUpload className="mt-1 text-indigo-500 dark:text-indigo-300" />
          <div>
            <p className="font-medium">Upload & Manage Documents</p>
            <p className="text-sm">Organize internal files and knowledge sources for instant access.</p>
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <FaComments className="mt-1 text-indigo-500 dark:text-indigo-300" />
          <div>
            <p className="font-medium">Ask Context-Aware Questions</p>
            <p className="text-sm">Interact naturally with documents using conversational AI.</p>
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <FaChartBar className="mt-1 text-indigo-500 dark:text-indigo-300" />
          <div>
            <p className="font-medium">Analytics Dashboard</p>
            <p className="text-sm">Gain insights from usage data and user queries.</p>
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <FaRegLightbulb className="mt-1 text-indigo-500 dark:text-indigo-300" />
          <div>
            <p className="font-medium">Smart Recommendations</p>
            <p className="text-sm">Get suggestions and answers based on document context.</p>
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <FaLock className="mt-1 text-indigo-500 dark:text-indigo-300" />
          <div>
            <p className="font-medium">Secure & Private</p>
            <p className="text-sm">Data security and access control is built into the system.</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-indigo-200 mb-2">Key Use Cases</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-indigo-100">
          <li>Employee onboarding & knowledge sharing</li>
          <li>Compliance documentation assistance</li>
          <li>Internal Q&A for policies and procedures</li>
          <li>Real-time AI-powered customer/internal support</li>
        </ul>
      </div>
    </div>
  );
}
