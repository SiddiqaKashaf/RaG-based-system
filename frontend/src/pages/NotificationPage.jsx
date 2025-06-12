import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'System', message: '🔔 Document "HR_Policies.pdf" was updated', read: false },
    { id: 2, type: 'User', message: '🔔 New user "Ahmed Raza" signed up', read: false },
    { id: 3, type: 'System', message: '🔔 System maintenance scheduled for Sunday', read: false },
  ]);

  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
    toast.info('Notification marked as read');
  };

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    toast.success('Notification deleted');
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    toast.info('All notifications marked as read');
  };

  const filtered = notifications.filter(
    (n) =>
      (activeTab === 'All' || n.type === activeTab) &&
      n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 rounded-3xl shadow-lg
      bg-white dark:bg-indigo-500/5 dark:backdrop-blur-lg dark:shadow-md dark:ring-1 dark:ring-white/20">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 dark:text-indigo-300 hover:underline"
        >
          <HiOutlineArrowLeft className="text-xl" /> Back
        </button>
        <h2 className="text-3xl font-semibold text-indigo-700 dark:text-indigo-100 relative">
          Notifications
          <span className="ml-2 text-sm bg-red-500 text-white px-2 py-0.5 rounded-full">
            {notifications.filter((n) => !n.read).length} Unread
          </span>
        </h2>
        <div className="w-12" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="bg-indigo-100 dark:bg-indigo-400/20 rounded-xl">
          {['All', 'System', 'User'].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="px-4 py-1">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Input
        type="text"
        placeholder="Search notifications..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 dark:bg-indigo-500/10 dark:border-indigo-300 dark:text-indigo-100"
      />

      <ul className="space-y-4">
        {filtered.length === 0 ? (
          <p className="text-gray-600 dark:text-indigo-200">No notifications found.</p>
        ) : (
          filtered.map((notif) => (
            <li
              key={notif.id}
              className={`flex justify-between items-center p-4 rounded-xl border shadow-sm
                ${notif.read ? 'bg-gray-100 dark:bg-indigo-500/10' : 'bg-indigo-50 dark:bg-indigo-600/20'}`}
            >
              <p className="text-gray-800 dark:text-indigo-100">{notif.message}</p>
              <div className="flex gap-2">
                {!notif.read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="text-sm px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="text-sm px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      <button
        onClick={handleMarkAllRead}
        className="w-full mt-8 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
      >
        Mark All as Read
      </button>
    </div>
  );
}
