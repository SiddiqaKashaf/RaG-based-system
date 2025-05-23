// src/pages/UploadBooksPage.jsx
import React, { useState } from 'react';
import { HiOutlineUpload } from 'react-icons/hi';

export default function UploadBooksPage() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState("Here is a sample response: This document outlines the company's quarterly revenue increase by 12% compared to the previous quarter. Key highlights include improvements in the IT department's operational efficiency and the successful deployment of new software tools for data analytics.");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate receiving a response
    setResponse(
      `Sample Response for \"${question}\":

The document you uploaded covers the following points:
1. Overview of system architecture.
2. Security protocols implemented.
3. Performance benchmarks and optimization strategies.`
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-white bg-opacity-90 p-10 rounded-3xl shadow-xl border border-gray-100 backdrop-blur-sm animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <HiOutlineUpload className="text-indigo-500" /> Upload Documents & Ask
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Select File (PDF/DOCX)</label>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Your Question</label>
          <textarea
            rows="4"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-400"
            placeholder="Type your question here..."
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-900 transition"
        >
          Ask
        </button>
      </form>

      {/* Sample Response Section */}
      {response && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-line">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sample Response</h2>
          <p className="text-gray-700">{response}</p>
        </div>
      )}
    </div>
  );
}
