// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import axios from "../axios";
import { Pencil, Camera, MapPin, Briefcase, Globe, Linkedin, Github, Twitter } from "lucide-react";

export function UserProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    avatarUrl: "",
    name: "",
    email: "",
    role: "",
    department: "",
    phone: "",
    avatarFile: null,
    jobTitle: "",
    bio: "",
    location: "",
    linkedin: "",
    github: "",
    twitter: "",
    skills: [],
    achievements: [],
    education: [],
    experience: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const fetchProfile = useCallback(() => {
    axios
      .get("/api/profile")
      .then(({ data }) =>
        setProfile((prev) => ({
          ...prev,
          ...data,
          avatarFile: null, // reset file on fetch
        }))
      )
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (field) => (e) =>
    setProfile((prev) => ({ ...prev, [field]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Revoke old object URL to avoid memory leaks
      if (profile.avatarUrl && profile.avatarFile) {
        URL.revokeObjectURL(profile.avatarUrl);
      }

      setProfile((prev) => ({
        ...prev,
        avatarUrl: URL.createObjectURL(file),
        avatarFile: file,
      }));
    }
  };

  // Cleanup object URL on component unmount
  useEffect(() => {
    return () => {
      if (profile.avatarUrl && profile.avatarFile) {
        URL.revokeObjectURL(profile.avatarUrl);
      }
    };
  }, [profile.avatarUrl, profile.avatarFile]);

  const handleSave = () => {
    setSaving(true);

    const formData = new FormData();
    Object.keys(profile).forEach(key => {
      if (key !== 'avatarFile' && key !== 'avatarUrl') {
        if (Array.isArray(profile[key])) {
          formData.append(key, JSON.stringify(profile[key]));
        } else {
          formData.append(key, profile[key] || "");
        }
      }
    });
    
    if (profile.avatarFile) {
      formData.append("avatar", profile.avatarFile);
    }

    axios
      .put("/api/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        toast.success("Profile updated successfully!");
        setEditMode(false);
        fetchProfile();
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          `Update failed: ${
            err.response?.data?.detail || err.message || "Unknown error"
          }`
        );
      })
      .finally(() => setSaving(false));
  };

  if (loading)
    return (
      <div className="text-center py-20 text-lg text-gray-500 dark:text-indigo-200">
        Loading profile…
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 rounded-3xl shadow-lg
      bg-white dark:bg-indigo-500/5 dark:backdrop-blur-lg dark:shadow-md dark:ring-1 dark:ring-white/20"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-indigo-100">
          Professional Profile
        </h2>
        <button
          onClick={() => setEditMode(!editMode)}
          disabled={saving}
          className="flex items-center text-sm text-indigo-600 dark:text-indigo-300 hover:underline transition"
        >
          <Pencil size={16} className="mr-2" />
          {editMode ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* Profile Header Section */}
      <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
        <div className="relative group">
          <img
            src={
              profile.avatarUrl
                ? `${BACKEND_URL}${profile.avatarUrl.startsWith("/") ? "" : "/"}${
                    profile.avatarUrl
                  }`
                : "/images/default-avatar.png"
            }
            alt="Avatar"
            className="h-32 w-32 rounded-full border-4 border-indigo-200 object-cover shadow-md group-hover:scale-105 transition-transform"
          />

          {editMode && (
            <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition">
              <Camera size={16} />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          )}
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-indigo-100">
              {profile.name || "-"}
            </h1>
            <p className="text-lg text-indigo-600 dark:text-indigo-300">
              {profile.jobTitle || profile.role || "-"}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center text-gray-600 dark:text-indigo-200">
              <MapPin size={16} className="mr-2" />
              {profile.location || "Location not specified"}
            </div>
            <div className="flex items-center text-gray-600 dark:text-indigo-200">
              <Briefcase size={16} className="mr-2" />
              {profile.department || "Department not specified"}
            </div>
          </div>

          <div className="flex gap-4">
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700">
                <Linkedin size={20} />
              </a>
            )}
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700">
                <Github size={20} />
              </a>
            )}
            {profile.twitter && (
              <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700">
                <Twitter size={20} />
              </a>
            )}
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-200 dark:border-indigo-300/20" />

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-indigo-100 mb-4">About</h3>
            {editMode ? (
              <textarea
                value={profile.bio || ''}
                onChange={handleChange('bio')}
                className="w-full h-32 border border-gray-300 dark:border-indigo-300 bg-white dark:bg-indigo-500/10 text-gray-900 dark:text-indigo-100 rounded-lg px-4 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Write a brief professional bio..."
              />
            ) : (
              <p className="text-gray-600 dark:text-indigo-200">{profile.bio || "No bio provided"}</p>
            )}
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-indigo-100 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-500 dark:text-indigo-200">Email</label>
                <p className="text-gray-800 dark:text-indigo-100">{profile.email || "-"}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-indigo-200">Phone</label>
                {editMode ? (
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={handleChange('phone')}
                    className="mt-1 w-full border border-gray-300 dark:border-indigo-300 bg-white dark:bg-indigo-500/10 text-gray-900 dark:text-indigo-100 rounded-lg px-4 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-indigo-100">{profile.phone || "-"}</p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-indigo-100 mb-4">Professional Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-indigo-200">Job Title</label>
                {editMode ? (
                  <input
                    type="text"
                    value={profile.jobTitle || ''}
                    onChange={handleChange('jobTitle')}
                    className="mt-1 w-full border border-gray-300 dark:border-indigo-300 bg-white dark:bg-indigo-500/10 text-gray-900 dark:text-indigo-100 rounded-lg px-4 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Enter job title"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-indigo-100">{profile.jobTitle || "-"}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-indigo-200">Department</label>
                {editMode ? (
                  <input
                    type="text"
                    value={profile.department || ''}
                    onChange={handleChange('department')}
                    className="mt-1 w-full border border-gray-300 dark:border-indigo-300 bg-white dark:bg-indigo-500/10 text-gray-900 dark:text-indigo-100 rounded-lg px-4 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Enter department"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-indigo-100">{profile.department || "-"}</p>
                )}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-indigo-100 mb-4">Social Links</h3>
            <div className="space-y-4">
              {['linkedin', 'github', 'twitter'].map((platform) => (
                <div key={platform}>
                  <label className="block text-sm text-gray-500 dark:text-indigo-200 capitalize">
                    {platform}
                  </label>
                  {editMode ? (
                    <input
                      type="url"
                      value={profile[platform] || ''}
                      onChange={handleChange(platform)}
                      className="mt-1 w-full border border-gray-300 dark:border-indigo-300 bg-white dark:bg-indigo-500/10 text-gray-900 dark:text-indigo-100 rounded-lg px-4 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder={`Enter ${platform} URL`}
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-indigo-100">
                      {profile[platform] || "-"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
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

function InputField({ label, value, disabled, onChange }) {
  return (
    <div>
      <label
        htmlFor={label.toLowerCase()}
        className="block mb-1 text-gray-700 dark:text-indigo-200"
      >
        {label}
      </label>
      <input
        id={label.toLowerCase()}
        type="text"
        value={value || ""}
        disabled={disabled}
        onChange={onChange}
        className={`w-full rounded border px-4 py-2 text-gray-900 dark:text-indigo-50 
          focus:outline-none focus:ring-2 focus:ring-indigo-400
          ${disabled ? "bg-gray-100 dark:bg-indigo-900 cursor-not-allowed" : "bg-white dark:bg-indigo-600"}`}
        spellCheck={false}
      />
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

