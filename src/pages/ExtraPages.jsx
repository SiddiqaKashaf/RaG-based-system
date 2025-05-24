// src/pages/ExtraPages.jsx
import React from 'react';
import { toast } from 'react-toastify';

// 1. User Profile
export function UserProfilePage() {
  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 mt-8">
      <h2 className="text-3xl font-semibold text-indigo-700 mb-6 border-b pb-2">My Profile</h2>
      <div className="grid grid-cols-2 gap-6 text-gray-800">
        <div><span className="font-semibold">Name:</span> Siddiqa Kashaf</div>
        <div><span className="font-semibold">Email:</span> siddiqa@example.com</div>
        <div><span className="font-semibold">Role:</span> IT Specialist</div>
        <div><span className="font-semibold">Company:</span> TechVision Ltd</div>
      </div>
    </div>
  );
}

// 2. Company Settings
export function CompanySettingsPage() {
  const handleSave = () => toast.success('Settings saved!');
  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 mt-8">
      <h2 className="text-3xl font-semibold text-indigo-700 mb-6 border-b pb-2">Company Settings</h2>
      <form className="space-y-5">
        <div>
          <label className="block mb-1 font-medium">Company Name</label>
          <input type="text" className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-indigo-300" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Industry</label>
          <input type="text" className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-indigo-300" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Company Logo</label>
          <input type="file" className="w-full border px-4 py-2 rounded" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Policies / FAQs</label>
          <textarea className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-indigo-300" rows={4} />
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}

// 3. About
export function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 mt-8 space-y-5">
      <h2 className="text-3xl font-semibold text-indigo-700 mb-4">About Our RAG System</h2>
      <p className="text-gray-700">This is a secure, AI-based, document-aware assistant tailored for IT companies.</p>
      <ul className="list-disc list-inside text-gray-800 space-y-1">
        <li>📄 Upload and manage internal documents</li>
        <li>💬 Ask context-aware questions</li>
        <li>📊 Analyze interaction patterns with analytics</li>
      </ul>
      <p className="text-gray-700">Use cases include employee onboarding, compliance support, internal knowledge search, and real-time assistance.</p>
    </div>
  );
}

// 4. Contact
export function ContactPage() {
  const handleSend = () => toast.success('Message sent!');
  return (
    <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8 mt-8">
      <h2 className="text-3xl font-semibold text-indigo-700 mb-6 border-b pb-2">Contact Support</h2>
      <form className="space-y-5">
        <div>
          <label className="block mb-1 font-medium">Your Name</label>
          <input type="text" className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-indigo-300" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Your Email</label>
          <input type="email" className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-indigo-300" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Message</label>
          <textarea
            className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-indigo-300"
            rows={4}
          />
        </div>
        <button
          type="button"
          onClick={handleSend}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}

// 5. 404 Not Found
export function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-extrabold text-red-600 mb-4">404</h1>
      <p className="text-xl text-gray-600">Oops! The page you're looking for does not exist.</p>
      <p className="mt-4 text-gray-500">Please check the URL or return to the homepage.</p>
    </div>
  );
}

// 6. Notifications
export function NotificationsPage() {
  const handleMarkRead = () => toast.info('All notifications marked as read');
  return (
    <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8 mt-8">
      <h2 className="text-3xl font-semibold text-indigo-700 mb-6 border-b pb-2">Notifications</h2>
      <ul className="space-y-3 text-gray-700">
        <li>🔔 Document "HR_Policies.pdf" was updated</li>
        <li>🔔 New user "Ahmed Raza" signed up</li>
        <li>🔔 System maintenance scheduled for Sunday</li>
      </ul>
      <button
        type="button"
        onClick={handleMarkRead}
        className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
      >
        Mark All as Read
      </button>
    </div>
  );
}
