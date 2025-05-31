import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import axios from "../axios";
import { Pencil, Camera } from "lucide-react";

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
    formData.append("role", profile.role || "");
    formData.append("department", profile.department || "");
    formData.append("phone", profile.phone || "");
    if (profile.avatarFile) {
      formData.append("avatar", profile.avatarFile);
    }

    axios
      .put("/api/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        toast.success("Profile updated!");
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
    <div className="max-w-3xl mx-auto mt-10 p-8 rounded-3xl shadow-lg
      bg-white dark:bg-indigo-500/5 dark:backdrop-blur-lg dark:shadow-md dark:ring-1 dark:ring-white/20"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-indigo-100">
          My Profile
        </h2>
        <button
          onClick={() => setEditMode(!editMode)}
          disabled={saving}
          className="flex items-center text-sm text-indigo-600 dark:text-indigo-300 hover:underline transition"
        >
          <Pencil size={16} className="mr-2" />
          {editMode ? "Cancel" : "Edit"}
        </button>
      </div>

      <div className="flex items-center gap-8 mb-8">
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
            className="h-28 w-28 rounded-full border-4 border-indigo-200 object-cover shadow-md group-hover:scale-105 transition-transform"
          />

          {editMode && (
            <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full cursor-pointer hover:bg-indigo-700 transition">
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
        <div className="space-y-2">
          <div>
            <p className="text-sm text-gray-500 dark:text-indigo-200">Name</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-indigo-100">
              {profile.name || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-indigo-200">Email</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-indigo-100">
              {profile.email || "-"}
            </p>
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-200 dark:border-indigo-300/20" />

      <div className="space-y-6">
        {['role', 'department', 'phone'].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-600 dark:text-indigo-200 capitalize">
              {field}
            </label>
            {editMode ? (
              <input
                type="text"
                value={profile[field] || ''}
                onChange={handleChange(field)}
                className="mt-1 w-full border border-gray-300 dark:border-indigo-300 bg-white dark:bg-indigo-500/10 text-gray-900 dark:text-indigo-100 rounded-lg px-4 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                disabled={saving}
                placeholder={`Enter ${field}`}
              />
            ) : (
              <p className="mt-1 text-gray-800 dark:text-indigo-100">{profile[field] || '-'}</p>
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



// ... other page components unchanged ...






























// ... other page components unchanged ...



































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

