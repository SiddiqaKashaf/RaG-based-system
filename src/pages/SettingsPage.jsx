// src/pages/SettingsPage.jsx
import React from 'react';

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-lg mt-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Company Settings</h1>
      <form className="space-y-6">
        <div>
          <label className="block text-gray-700">Company Name</label>
          <input type="text" className="w-full border p-2 rounded-lg" placeholder="Your Company" />
        </div>
        <div>
          <label className="block text-gray-700">Industry</label>
          <input type="text" className="w-full border p-2 rounded-lg" placeholder="IT Services" />
        </div>
        <div>
          <label className="block text-gray-700">Logo URL</label>
          <input type="url" className="w-full border p-2 rounded-lg" placeholder="https://" />
        </div>
        <button className="py-2 px-4 bg-indigo-600 text-white rounded-lg">Save Settings</button>
      </form>
    </div>
  );
}
