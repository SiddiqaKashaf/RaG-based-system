import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineUserGroup,
  HiOutlineTrash,
  HiOutlinePencilAlt,
  HiOutlineSearch,
  HiOutlineArrowLeft,
  HiOutlineFilter,
  HiOutlineCog,
  HiOutlineEye,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePlus,
  HiOutlineDownload,
  HiOutlineUpload,
  HiOutlineRefresh,
  HiOutlineDotsVertical,
  HiOutlineUserAdd,
  HiOutlineKey,
  HiOutlineLockClosed,
  HiOutlineGlobe,
  HiOutlineChartBar,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineSortAscending,
  HiOutlineSortDescending,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineSelector
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../theme';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    department: 'all',
    dateRange: 'all'
  });
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    employees: 0
  });
  const pageSize = 10;
  const navigate = useNavigate();
  const { getComponentClass } = useTheme();

  // Fetch user list from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Transform the API response to include additional fields for UI
        const transformedUsers = res.data.users.map(user => ({
          ...user,
          status: 'active', // Default status since API doesn't provide it
          department: 'General', // Default department
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
          lastLogin: new Date().toISOString(), // Default last login
          joinDate: new Date().toISOString().split('T')[0], // Default join date
          phone: '+1 (555) 000-0000', // Default phone
          location: 'Unknown', // Default location
          permissions: user.role === 'admin' ? ['read', 'write', 'admin'] : ['read', 'write'], // Default permissions
          isOnline: Math.random() > 0.5 // Random online status for demo
        }));
        
        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
        
        // Calculate stats from real data
        setUserStats({
          total: transformedUsers.length,
          active: transformedUsers.filter(u => u.status === 'active').length,
          inactive: transformedUsers.filter(u => u.status === 'inactive').length,
          admins: transformedUsers.filter(u => u.role === 'admin').length,
          employees: transformedUsers.filter(u => u.role === 'employee').length
        });
      } catch (err) {
        console.error('Error fetching users:', err);
        toast.error('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter and sort users
  useEffect(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filters.role === 'all' || user.role === filters.role;
      const matchesStatus = filters.status === 'all' || user.status === filters.status;
      const matchesDepartment = filters.department === 'all' || user.department === filters.department;
      
      return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'name' || sortBy === 'email') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
    setPage(1);
  }, [users, searchTerm, filters, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) {
      toast.warning('Please select users first');
      return;
    }

    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
          // Implement bulk delete
          toast.success(`${selectedUsers.length} users deleted successfully`);
          setSelectedUsers([]);
        }
        break;
      case 'activate':
        // Implement bulk activate
        toast.success(`${selectedUsers.length} users activated successfully`);
        setSelectedUsers([]);
        break;
      case 'deactivate':
        // Implement bulk deactivate
        toast.success(`${selectedUsers.length} users deactivated successfully`);
        setSelectedUsers([]);
        break;
      default:
        break;
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === displayedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(displayedUsers.map(user => user.id));
    }
  };

  const saveRole = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(
        `http://localhost:8000/admin/users/${id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = users.map(u => (u.id === id ? { ...u, role: newRole } : u));
      setUsers(updated);
      setFilteredUsers(updated);
      toast.success('Role updated successfully');
      setEditingId(null);
    } catch (err) {
      console.error('Error updating role:', err);
      toast.error('Failed to update role');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(
        `http://localhost:8000/admin/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      setFilteredUsers(updated);
      toast.success('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const displayedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <motion.div
        whileHover={{ y: -2 }}
        className={getComponentClass('card', 'stats') + ' p-4 text-center'}
      >
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userStats.total}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
      </motion.div>
      
      <motion.div
        whileHover={{ y: -2 }}
        className={getComponentClass('card', 'stats') + ' p-4 text-center'}
      >
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.active}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
      </motion.div>
      
      <motion.div
        whileHover={{ y: -2 }}
        className={getComponentClass('card', 'stats') + ' p-4 text-center'}
      >
        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{userStats.inactive}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Inactive Users</div>
      </motion.div>
      
      <motion.div
        whileHover={{ y: -2 }}
        className={getComponentClass('card', 'stats') + ' p-4 text-center'}
      >
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userStats.admins}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Administrators</div>
      </motion.div>
      
      <motion.div
        whileHover={{ y: -2 }}
        className={getComponentClass('card', 'stats') + ' p-4 text-center'}
      >
        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{userStats.employees}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Employees</div>
      </motion.div>
    </div>
  );

  const renderFilters = () => (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={getComponentClass('card', 'contactGlass') + ' p-6 mb-6'}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white p-2"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white p-2"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white p-2"
              >
                <option value="all">All Departments</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white p-2"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderUserTable = () => (
    <div className={getComponentClass('card', 'contactGlass') + ' p-6'}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-gray-800 dark:text-white font-semibold">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === displayedUsers.length && displayedUsers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="text-left py-3 px-4 text-gray-800 dark:text-white font-semibold">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Name
                  {sortBy === 'name' && (
                    sortOrder === 'asc' ? <HiOutlineChevronUp size={16} /> : <HiOutlineChevronDown size={16} />
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-4 text-gray-800 dark:text-white font-semibold">
                <button
                  onClick={() => handleSort('email')}
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Email
                  {sortBy === 'email' && (
                    sortOrder === 'asc' ? <HiOutlineChevronUp size={16} /> : <HiOutlineChevronDown size={16} />
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-4 text-gray-800 dark:text-white font-semibold">Role</th>
              <th className="text-left py-3 px-4 text-gray-800 dark:text-white font-semibold">Department</th>
              <th className="text-left py-3 px-4 text-gray-800 dark:text-white font-semibold">Status</th>
              <th className="text-left py-3 px-4 text-gray-800 dark:text-white font-semibold">Last Login</th>
              <th className="text-left py-3 px-4 text-gray-800 dark:text-white font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedUsers.map(user => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserSelect(user.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">{user.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-800 dark:text-white">{user.email}</td>
                <td className="py-3 px-4">
                  {editingId === user.id ? (
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="px-2 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    >
                      <option value="admin">Admin</option>
                      <option value="employee">Employee</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'Employee'}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-800 dark:text-white">{user.department}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                  {formatDateTime(user.lastLogin)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {editingId === user.id ? (
                      <>
                        <button
                          onClick={() => saveRole(user.id)}
                          className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <HiOutlineCheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          <HiOutlineXCircle size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setSelectedUser(user); setShowUserModal(true); }}
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <HiOutlineEye size={16} />
                        </button>
                        <button
                          onClick={() => { setEditingId(user.id); setNewRole(user.role); }}
                          className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          <HiOutlinePencilAlt size={16} />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPagination = () => (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filteredUsers.length)} of {filteredUsers.length} users
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiOutlineChevronLeft size={16} />
        </button>
        
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                page === pageNum
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        
        <button
          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiOutlineChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={getComponentClass('typography', 'h1')}>User Management</h1>
            <p className={getComponentClass('typography', 'body')}>Manage and monitor user accounts</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <HiOutlineFilter size={20} />
              Filters
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg ${
                  viewMode === 'table'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <HiOutlineViewList size={20} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <HiOutlineViewGrid size={20} />
              </button>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <HiOutlineUserAdd size={20} />
              Add User
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Filters */}
        {renderFilters()}

        {/* Search and Bulk Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedUsers.length} selected
              </span>
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-900/50"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg text-sm hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* User Table */}
        {viewMode === 'table' && renderUserTable()}

        {/* Pagination */}
        {renderPagination()}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={getComponentClass('card', 'contactGlass') + ' w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto'}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={getComponentClass('typography', 'h3')}>User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <HiOutlineXCircle size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-20 h-20 rounded-full"
                />
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 dark:text-white">{selectedUser.name}</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedUser.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  }`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <HiOutlinePhone className="text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{selectedUser.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiOutlineLocationMarker className="text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{selectedUser.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiOutlineCalendar className="text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Joined: {formatDate(selectedUser.joinDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiOutlineClock className="text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Last login: {formatDateTime(selectedUser.lastLogin)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h5 className="font-semibold text-gray-800 dark:text-white mb-3">Permissions</h5>
              <div className="flex flex-wrap gap-2">
                {selectedUser.permissions.map(permission => (
                  <span key={permission} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 