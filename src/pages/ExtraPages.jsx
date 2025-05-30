// src/pages/ExtraPages.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from '../axios';
import { Pencil, Camera } from 'lucide-react';

export function UserProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    avatarUrl: '',
    name: '',
    email: '',
    role: '',
    department: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(() => {
    axios.get('/api/profile')
      .then(({ data }) => setProfile(prev => ({ ...prev, ...data })))
      .catch(err => {
        console.error(err);
        toast.error('Failed to load profile');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleChange = (field) => (e) =>
    setProfile(prev => ({ ...prev, [field]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile(prev => ({
        ...prev,
        avatarUrl: URL.createObjectURL(file),
        avatarFile: file
      }));
    }
  };

  const handleSave = () => {
    setSaving(true);
    const hasAvatar = !!profile.avatarFile;
    let request;

    if (hasAvatar) {
      const formData = new FormData();
      formData.append('role', profile.role);
      formData.append('department', profile.department);
      formData.append('phone', profile.phone);
      formData.append('avatar', profile.avatarFile);
      request = axios.put('/api/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      request = axios.put('/api/profile', {
        role: profile.role,
        department: profile.department,
        phone: profile.phone
      });
    }

    request
      .then(() => {
        toast.success('Profile updated!');
        setEditMode(false);
        fetchProfile();
      })
      .catch(err => {
        console.error(err);
        toast.error(`Update failed: ${err.response?.data?.message || err.message}`);
      })
      .finally(() => setSaving(false));
  };

  if (loading) return <div className="text-center py-20 text-lg text-gray-500">Loading profile…</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-3xl p-10 mt-10 transition duration-300 ease-in-out">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-indigo-700">My Profile</h2>
        <button
          onClick={() => setEditMode(!editMode)}
          disabled={saving}
          className="flex items-center text-sm text-indigo-600 hover:underline hover:text-indigo-800 transition"
        >
          <Pencil size={16} className="mr-2" /> {editMode ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="flex items-center gap-8 mb-8">
        <div className="relative group">
          <img
            src={profile.avatarUrl || '/images/default-avatar.png'}
            alt="Avatar"
            className="h-28 w-28 rounded-full border-4 border-indigo-200 object-cover shadow-md group-hover:scale-105 transition-transform"
          />
          {editMode && (
            <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full cursor-pointer hover:bg-indigo-700 transition">
              <Camera size={16} />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          )}
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-lg font-semibold text-gray-800">{profile.name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-semibold text-gray-800">{profile.email || '-'}</p>
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-200" />

      <div className="space-y-6">
        {['role', 'department', 'phone'].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-600 capitalize">{field}</label>
            {editMode ? (
              <input
                type="text"
                value={profile[field] || ''}
                onChange={handleChange(field)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                disabled={saving}
                placeholder={`Enter ${field}`}
              />
            ) : (
              <p className="mt-1 text-gray-800">{profile[field] || '-'}</p>
            )}
          </div>
        ))}
      </div>

      {editMode && (
        <div className="flex justify-end mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}



// ... other page components unchanged ...




















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
