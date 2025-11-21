// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useTheme } from '../theme';

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
  const { getComponentClass } = useTheme();

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
      await axios.post('http://localhost:8000/api/signup', {
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
      <div className={`w-full max-w-md p-8 ${getComponentClass('card', 'contactGlass')} ${getComponentClass('text', 'primary')} rounded-2xl ${getComponentClass('shadows', 'lg')}`}>
        <h2 className={`text-3xl font-extrabold text-center ${getComponentClass('text', 'accent')} mb-6`}>
          Create an Account
        </h2>

        <form onSubmit={handleSignup} className="space-y-5">
          {/* Email */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${getComponentClass('text', 'primary')}`}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              className={`w-full px-4 py-2 border ${getComponentClass('border', 'primary')} rounded-lg ${getComponentClass('background', 'card')} ${getComponentClass('text', 'primary')} focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600`}
              required
              placeholder="e.g. johndoe@example.com"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${getComponentClass('text', 'primary')}`}>Full Name</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className={`w-full px-4 py-2 border ${getComponentClass('border', 'primary')} rounded-lg ${getComponentClass('background', 'card')} ${getComponentClass('text', 'primary')} focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600`}
              required
              placeholder="Your full name"
            />
          </div>

          {/* Password */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${getComponentClass('text', 'primary')}`}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                className={`w-full px-4 py-2 border ${getComponentClass('border', 'primary')} rounded-lg pr-10 ${getComponentClass('background', 'card')} ${getComponentClass('text', 'primary')} focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600`}
                required
                placeholder="Create a strong password"
              />
              <span
                className={`absolute right-3 top-2.5 text-xl ${getComponentClass('text', 'secondary')} cursor-pointer`}
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${getComponentClass('text', 'primary')}`}>Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className={`w-full px-4 py-2 border ${getComponentClass('border', 'primary')} rounded-lg ${getComponentClass('background', 'card')} ${getComponentClass('text', 'primary')} focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600`}
              required
              placeholder="Re-enter password"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${getComponentClass('text', 'primary')}`}>I am</label>
            <div className="flex gap-4">
              <label className={`flex items-center gap-2 cursor-pointer ${getComponentClass('text', 'primary')}`}>
                <input
                  type="radio"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  className="accent-blue-600"
                />
                Admin / Organization Owner
              </label>
              <label className={`flex items-center gap-2 cursor-pointer ${getComponentClass('text', 'primary')}`}>
                <input
                  type="radio"
                  value="employee"
                  checked={role === 'employee'}
                  onChange={() => setRole('employee')}
                  className="accent-blue-600"
                />
                Employee
              </label>
            </div>
          </div>

          {/* Organization Field */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${getComponentClass('text', 'primary')}`}>
              {role === 'admin' ? 'Organization Name (New)' : 'Organization Name (Existing)'}
            </label>
            <input
              type="text"
              value={organization}
              onChange={e => setOrganization(e.target.value)}
              className={`w-full px-4 py-2 border ${getComponentClass('border', 'primary')} rounded-lg ${getComponentClass('background', 'card')} ${getComponentClass('text', 'primary')} focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600`}
              required
              placeholder={role === 'admin' ? 'Enter your new organization name' : 'Enter your existing organization name'}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className={`mt-4 text-sm text-center ${getComponentClass('text', 'secondary')}`}>
          Already have an account?{' '}
          <Link to="/" className={`${getComponentClass('text', 'accent')} hover:underline font-medium`}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
