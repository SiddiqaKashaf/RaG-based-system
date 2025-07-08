// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import axios from "../axios";
import { User, Mail, Phone, Briefcase, MapPin, Linkedin, Github, Twitter, Pencil, Camera, Save } from "lucide-react";
import { useTheme } from '../theme';

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
  const { getComponentClass } = useTheme();

  // Default avatar as data URI to avoid external dependencies
  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

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

    // Debug logging
    console.log('Profile data being sent:', profile);
    console.log('FormData contents:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    console.log('Job Title specifically:', formData.get('jobTitle'));

    axios
      .put("/api/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        console.log('Server response:', response);
        toast.success("Profile updated successfully!");
        setEditMode(false);
        fetchProfile();
      })
      .catch((err) => {
        console.error('Error details:', err.response?.data);
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
      <div className="text-center py-20 text-lg text-gray-600 dark:text-gray-300">
        Loading profile…
      </div>
    );

  return (
    <div className={`max-w-4xl mx-auto mt-10 p-8 ${getComponentClass('card', 'contactGlass')} ${getComponentClass('text', 'primary')} rounded-3xl shadow-lg`}>
      <div className="flex items-center justify-between mb-8">
        <h2 className={`text-3xl font-extrabold flex items-center gap-2 text-black dark:${getComponentClass('text', 'accent')}`}> 
          <User className="w-7 h-7 text-black dark:text-indigo-400" /> Profile
        </h2>
        <button
          onClick={() => setEditMode(!editMode)}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow"
        >
          <Pencil size={16} />
          {editMode ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* Profile Header Section */}
      <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
        <div className="relative group">
          <div className="h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-lg">
            <img
              src={
                profile.avatarUrl
                  ? `${BACKEND_URL}${profile.avatarUrl.startsWith("/") ? "" : "/"}${profile.avatarUrl}`
                  : defaultAvatar
              }
              alt="Avatar"
              className="h-full w-full rounded-full object-cover  dark:bg-indigo-900"
              onError={(e) => {
                e.target.src = defaultAvatar;
              }}
            />
            {editMode && (
              <label className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition border-2 border-white dark:border-indigo-900 shadow-lg">
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
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h1 className={`text-2xl font-bold flex items-center gap-2 ${getComponentClass('text', 'primary')}`}>{profile.name || "-"}</h1>
            <p className={`text-lg ${getComponentClass('text', 'accent')}`}>{profile.jobTitle || "-"}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "-"}
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <MapPin size={16} className="text-emerald-500" />
              {profile.location || "Location not specified"}
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Briefcase size={16} className="text-indigo-500" />
              {profile.department || "Department not specified"}
            </div>
          </div>
          <div className="flex gap-4 mt-2">
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition">
                <Linkedin size={22} />
              </a>
            )}
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-300 transition">
                <Github size={22} />
              </a>
            )}
            {profile.twitter && (
              <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-sky-500 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition">
                <Twitter size={22} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="mb-8 p-6 rounded-2xl shadow-md bg-white/80 dark:bg-indigo-900/30 border border-gray-200 dark:border-indigo-800">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-5 h-5 text-indigo-500" />
          <h3 className={`text-xl font-semibold ${getComponentClass('text', 'primary')}`}>About</h3>
        </div>
        {editMode ? (
          <textarea
            value={profile.bio || ""}
            onChange={handleChange("bio")}
            className={`w-full h-32 border ${getComponentClass('border', 'primary')} ${getComponentClass('background', 'card')} ${getComponentClass('text', 'primary')} rounded-lg px-4 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
            placeholder="Tell us about yourself..."
          />
        ) : (
          <p className="text-gray-600 dark:text-gray-300">{profile.bio || "No bio provided"}</p>
        )}
      </div>

      {/* Contact Information */}
      <div className="mb-8 p-6 rounded-2xl shadow-md bg-white/80 dark:bg-indigo-900/30 border border-gray-200 dark:border-indigo-800">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-5 h-5 text-emerald-500" />
          <h3 className={`text-xl font-semibold ${getComponentClass('text', 'primary')}`}>Contact Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-indigo-500" />
            <span className="font-medium">Email:</span>
            <span className="text-gray-800 dark:text-white">{profile.email || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-emerald-500" />
            <span className="font-medium">Phone:</span>
            {editMode ? (
              <input
                type="tel"
                value={profile.phone || ""}
                onChange={handleChange("phone")}
                className={`w-full border ${getComponentClass('border', 'primary')} ${getComponentClass('background', 'card')} ${getComponentClass('text', 'primary')} rounded-lg px-4 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                placeholder="Enter phone number"
              />
            ) : (
              <span className="text-gray-800 dark:text-white">{profile.phone || "-"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Professional Details */}
      <div className="mb-8 p-6 rounded-2xl shadow-md bg-white/80 dark:bg-indigo-900/30 border border-gray-200 dark:border-indigo-800">
        <div className="flex items-center gap-2 mb-3">
          <Briefcase className="w-5 h-5 text-indigo-500" />
          <h3 className={`text-xl font-semibold ${getComponentClass('text', 'primary')}`}>Professional Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-indigo-500" />
            <span className="font-medium">Job Title:</span>
            {editMode ? (
              <input
                type="text"
                value={profile.jobTitle || ""}
                onChange={handleChange("jobTitle")}
                className={`w-full border ${getComponentClass('border', 'primary')} ${getComponentClass('background', 'card')} ${getComponentClass('text', 'primary')} rounded-lg px-4 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                placeholder="Enter job title"
              />
            ) : (
              <span className="text-gray-800 dark:text-white">{profile.jobTitle || "-"}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-indigo-500" />
            <span className="font-medium">Department:</span>
            {editMode ? (
              <input
                type="text"
                value={profile.department || ""}
                onChange={handleChange("department")}
                className={`w-full border ${getComponentClass('border', 'primary')} ${getComponentClass('background', 'card')} ${getComponentClass('text', 'primary')} rounded-lg px-4 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                placeholder="Enter department"
              />
            ) : (
              <span className="text-gray-800 dark:text-white">{profile.department || "-"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="mb-8 p-6 rounded-2xl shadow-md bg-white/80 dark:bg-indigo-900/30 border border-gray-200 dark:border-indigo-800">
        <div className="flex items-center gap-2 mb-3">
          <Linkedin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className={`text-xl font-semibold ${getComponentClass('text', 'primary')}`}>Social Links</h3>
        </div>
        <div className="flex gap-6 mt-2">
          <div className="flex items-center gap-2">
            <Linkedin size={20} className="text-blue-600 dark:text-blue-400" />
            {editMode ? (
              <input
                type="url"
                value={profile.linkedin || ""}
                onChange={handleChange("linkedin")}
                className={`w-full border ${getComponentClass('border', 'primary')} ${getComponentClass('background', 'card')} ${getComponentClass('text', 'primary')} rounded-lg px-4 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                placeholder="https://linkedin.com/in/username"
              />
            ) : (
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{profile.linkedin || "-"}</a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Github size={20} className="text-gray-800 dark:text-white" />
            {editMode ? (
              <input
                type="url"
                value={profile.github || ""}
                onChange={handleChange("github")}
                className={`w-full border ${getComponentClass('border', 'primary')} ${getComponentClass('background', 'card')} ${getComponentClass('text', 'primary')} rounded-lg px-4 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                placeholder="https://github.com/username"
              />
            ) : (
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 dark:text-white hover:underline">{profile.github || "-"}</a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Twitter size={20} className="text-sky-500 dark:text-sky-400" />
            {editMode ? (
              <input
                type="url"
                value={profile.twitter || ""}
                onChange={handleChange("twitter")}
                className={`w-full border ${getComponentClass('border', 'primary')} ${getComponentClass('background', 'card')} ${getComponentClass('text', 'primary')} rounded-lg px-4 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                placeholder="https://twitter.com/username"
              />
            ) : (
              <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-sky-500 dark:text-sky-400 hover:underline">{profile.twitter || "-"}</a>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      {editMode && (
        <div className="flex justify-end pt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}

function InputField({ label, value, disabled, onChange }) {
  return (
    <div className="mb-4">
      <label className="block mb-1 text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        type="text"
        value={value || ""}
        disabled={disabled}
        onChange={onChange}
        className={`w-full rounded border px-4 py-2 text-gray-700 dark:text-gray-300`}
      />
    </div>
  );
}

// 5. 404 Not Found
export function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-extrabold text-red-600 mb-4">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300">Oops! The page you're looking for does not exist.</p>
      <p className="mt-4 text-gray-500 dark:text-gray-400">Please check the URL or return to the homepage.</p>
    </div>
  );
}

// Add default export
const ProfilePage = UserProfilePage;
export default ProfilePage;

