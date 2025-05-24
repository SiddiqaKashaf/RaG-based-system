// src/pages/ContactPage.jsx
import React from 'react';

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-lg mt-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Contact Support</h1>
      <form className="space-y-6">
        <div>
          <label className="block text-gray-700">Your Email</label>
          <input type="email" className="w-full border p-2 rounded-lg" placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-gray-700">Message</label>
          <textarea rows="5" className="w-full border p-2 rounded-lg" placeholder="How can we help?" />
        </div>
        <button className="py-2 px-4 bg-indigo-600 text-white rounded-lg">Send Message</button>
      </form>
    </div>
  );
}
