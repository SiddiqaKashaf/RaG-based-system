// src/pages/UserManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { HiOutlineUserGroup } from 'react-icons/hi';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // simulate fetching user list
    setUsers([
      { id: 1, name: 'Alice Johnson', role: 'Admin' },
      { id: 2, name: 'Bob Smith', role: 'Analyst' },
      { id: 3, name: 'Charlie Lee', role: 'Guest' },
    ]);
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <HiOutlineUserGroup className="text-indigo-500" /> User Management
      </h1>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="pb-2 border-b">ID</th>
            <th className="pb-2 border-b">Name</th>
            <th className="pb-2 border-b">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="py-2 border-b">{u.id}</td>
              <td className="py-2 border-b">{u.name}</td>
              <td className="py-2 border-b">{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
