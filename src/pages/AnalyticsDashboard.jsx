// src/pages/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { HiOutlineChartBar, HiOutlineDownload, HiOutlineFilter } from 'react-icons/hi';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ImSpinner8 } from 'react-icons/im';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function AnalyticsDashboard() {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState(new Date());
  const [viewType, setViewType] = useState('line'); // 'line' or 'bar'
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode using matchMedia
  useEffect(() => {
    const darkMatch = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkMatch.matches);
    const handler = (e) => setIsDarkMode(e.matches);
    darkMatch.addEventListener('change', handler);
    return () => darkMatch.removeEventListener('change', handler);
  }, []);

  const chartColors = isDarkMode
  ? {
      queries: '#6366F1', // Indigo-500 for dark mode
      uploads: '#10B981', // Emerald-500 for dark mode
    }
  : {
      queries: '#1F2937', // Gray-800 for light mode (dark shade)
      uploads: '#065F46', // Darker green for better visibility in light
    };


  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    setTimeout(() => {
      const days = [];
      const current = new Date(startDate);
      while (current <= endDate) {
        days.push({
          day: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          queries: Math.floor(Math.random() * 100) + 10,
          uploads: Math.floor(Math.random() * 20) + 1,
        });
        current.setDate(current.getDate() + 1);
      }
      setData(days);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  const exportCSV = () => {
    const header = 'Day,Queries,Uploads\n';
    const rows = data.map(d => `${d.day},${d.queries},${d.uploads}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'analytics.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white dark:bg-white/5 p-8 rounded-3xl shadow-lg mt-10">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
        <HiOutlineChartBar className="text-indigo-500" /> Analytics Dashboard
      </h1>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <HiOutlineFilter className="text-gray-600 dark:text-gray-300" />
          <div className="flex items-center gap-2">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-indigo-400"
            />
            <span className="-mt-1 text-gray-500 dark:text-gray-300">to</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewType(viewType === 'line' ? 'bar' : 'line')}
            className="flex items-center gap-1 px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition"
          >
            {viewType === 'line' ? 'Bar Chart' : 'Line Chart'}
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <HiOutlineDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-gray-50 dark:bg-white/10 rounded-2xl shadow-inner text-center">
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Total Queries</h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
            {data.reduce((sum, d) => sum + d.queries, 0)}
          </p>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-white/10 rounded-2xl shadow-inner text-center">
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Total Uploads</h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
            {data.reduce((sum, d) => sum + d.uploads, 0)}
          </p>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-white/10 rounded-2xl shadow-inner text-center">
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Avg Queries/Day</h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
            {Math.round(data.reduce((sum, d) => sum + d.queries, 0) / data.length)}
          </p>
        </div>
      </div>

      {/* Chart Section */}
<div className="w-full h-96 relative">
  <ResponsiveContainer>
    {viewType === 'line' ? (
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <XAxis
          dataKey="day"
          stroke={isDarkMode ? 'gray' : '#374151'}
          tick={{ fill: isDarkMode ? 'gray' : '#4B5563', fontSize: 14 }}
        />
        <YAxis
          stroke={isDarkMode ? 'gray' : '#374151'}
          tick={{ fill: isDarkMode ? 'gray' : '#4B5563', fontSize: 14 }}
        />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="queries" stroke={chartColors.queries} strokeWidth={2} />
        <Line type="monotone" dataKey="uploads" stroke={chartColors.uploads} strokeWidth={2} />
      </LineChart>
    ) : (
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <XAxis
          dataKey="day"
          stroke={isDarkMode ? 'gray' : 'black'}
          tick={{ fill: isDarkMode ? 'gray' : 'black', fontSize: 14 }}
        />
        <YAxis
          stroke={isDarkMode ? 'gray' : '#374151'}
          tick={{ fill: isDarkMode ? 'gray' : '#4B5563', fontSize: 14 }}
        />
        <Tooltip />
        <Legend />
        <Bar dataKey="queries" fill={chartColors.queries} />
        <Bar dataKey="uploads" fill={chartColors.uploads} />
      </BarChart>
    )}
  </ResponsiveContainer>

  {loading && (
    <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-black bg-opacity-50">
      <ImSpinner8 className="animate-spin text-indigo-500 text-4xl" />
    </div>
  )}
</div>

    </div>
  );
}
