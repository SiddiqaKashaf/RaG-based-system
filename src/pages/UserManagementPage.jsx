// src/pages/UserManagementPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiOutlineUserGroup, HiOutlineTrash, HiOutlinePencilAlt, HiOutlineSearch, HiOutlineArrowLeft } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

/**
 * UserManagementPage allows Admin to view, search, paginate, edit roles, and delete users.
 */
export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const navigate = useNavigate();

  // Fetch user list from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data.users);
        setFilteredUsers(res.data.users);
      } catch (err) {
        toast.error('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users by search term (name or email)
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFilteredUsers(users);
      setPage(1);
      return;
    }
    const filtered = users.filter(u => {
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return name.includes(term) || email.includes(term);
    });
    setFilteredUsers(filtered);
    setPage(1);
  }, [searchTerm, users]);

  // Handle role edit
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
      toast.success('Role updated');
      setEditingId(null);
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  // Handle delete user
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
      toast.info('User deleted');
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const displayedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 rounded-3xl shadow-lg
      bg-white dark:bg-indigo-500/5 dark:backdrop-blur-lg dark:shadow-md dark:ring-1 dark:ring-white/20">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-indigo-600 dark:text-indigo-300 hover:underline"
        >
          <HiOutlineArrowLeft className="text-xl" /> Back
        </button>
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <HiOutlineUserGroup className="text-indigo-500 dark:text-indigo-500" /> User Management
        </h1>
        <div className="w-12" /> {/* spacing placeholder */}
      </div>

      {/* Search Input */}
      <div className="mb-4 flex items-center gap-2">
        <HiOutlineSearch className="text-gray-500 dark:text-gray-300" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 dark:bg-white/10 dark:text-white dark:placeholder-gray-300"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-600 dark:text-gray-300">Loading users...</p>
      ) : (
        <>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-700 dark:text-indigo-100">
                <th className="py-2 border-b">ID</th>
                <th className="py-2 border-b">Name</th>
                <th className="py-2 border-b">Email</th>
                <th className="py-2 border-b">Role</th>
                <th className="py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500 dark:text-gray-300">
                    No users found matching "{searchTerm}".
                  </td>
                </tr>
              ) : (
                displayedUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="py-2 border-b dark:text-gray-100">{u.id}</td>
                    <td className="py-2 border-b dark:text-gray-100">{u.name}</td>
                    <td className="py-2 border-b dark:text-gray-100">{u.email}</td>
                    <td className="py-2 border-b">
                      {editingId === u.id ? (
                        <select
                          value={newRole}
                          onChange={e => setNewRole(e.target.value)}
                          className="px-2 py-1 border rounded-lg focus:ring-2 focus:ring-indigo-400 
             bg-white text-gray-800 dark:bg-indigo-900/70 dark:text-indigo-100 
             dark:border-indigo-700"
                        >
                          <option
                            value="Admin"
                            className="bg-white text-black dark:bg-indigo-900/10 dark:text-white"
                          >
                            Admin
                          </option>
                          <option
                            value="Analyst"
                            className="bg-white text-black dark:bg-indigo-900/10 dark:text-white"
                          >
                            Analyst
                          </option>
                          <option
                            value="Guest"
                            className="bg-white text-black dark:bg-indigo-900/10 dark:text-white"
                          >
                            Guest
                          </option>
                        </select>

                      ) : (
                        <span className="dark:text-gray-100">{u.role}</span>
                      )}
                    </td>
                    <td className="py-2 border-b flex items-center gap-3">
                      {editingId === u.id ? (
                        <button
                          onClick={() => saveRole(u.id)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        >
                          Save
                        </button>
                      ) : (
                        <HiOutlinePencilAlt
                          className="cursor-pointer text-gray-600 hover:text-indigo-600 dark:text-indigo-300 dark:hover:text-indigo-100"
                          onClick={() => { setEditingId(u.id); setNewRole(u.role); }}
                        />
                      )}
                      <HiOutlineTrash
                        className="cursor-pointer text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => deleteUser(u.id)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="mt-6 flex justify-center items-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 dark:bg-white/10 dark:text-white rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-gray-700 dark:text-gray-200">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-200 dark:bg-white/10 dark:text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
