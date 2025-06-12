// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [organization, setOrganization] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!role) {
      toast.error("Please select your role (Admin or Employee).");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:8000/signup', {
        email,
        password,
        confirm_password: confirmPassword,
        name: username,
        role: role.toLowerCase(),
        organization
      });

      toast.success('Signup successful! Please login.');
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.detail || 'Signup failed.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gradient-to-br dark:from-inherit- dark:to-purple-950 text-gray-800 dark:text-white rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center text-indigo-700 dark:text-white mb-6">
          Create an Account
        </h2>

        <form onSubmit={handleSignup} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-200 text-gray-900 dark:text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              placeholder="e.g. johndoe@example.com"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-200 text-gray-900 dark:text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              placeholder="Your full name"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg pr-10 bg-white dark:bg-gray-200 text-gray-900 dark:text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                placeholder="Create a strong password"
              />
              <span
                className="absolute right-3 top-2.5 text-xl text-gray-600 cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-200 text-gray-900 dark:text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              placeholder="Re-enter password"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">I am</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  className="accent-indigo-600"
                />
                Admin / Organization Owner
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="employee"
                  checked={role === 'employee'}
                  onChange={() => setRole('employee')}
                  className="accent-indigo-600"
                />
                Employee
              </label>
            </div>
          </div>

          {/* Organization Field */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {role === 'admin' ? 'Organization Name (New)' : 'Organization Name (Existing)'}
            </label>
            <input
              type="text"
              value={organization}
              onChange={e => setOrganization(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-200 text-gray-900 dark:text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              placeholder={role === 'admin' ? 'Enter your new organization name' : 'Enter your existing organization name'}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-300">
          Already have an account?{' '}
          <Link to="/" className="text-indigo-600 hover:underline font-medium dark:text-indigo-300">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
