// src/pages/AnalyticsDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  HiOutlineChartBar, 
  HiOutlineDownload, 
  HiOutlineFilter,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineChartPie
} from 'react-icons/hi';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { ImSpinner8 } from 'react-icons/im';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const COLORS = {
  primary: {
    light: '#6366F1',
    dark: '#818CF8'
  },
  secondary: {
    light: '#10B981',
    dark: '#34D399'
  },
  accent: {
    light: '#F59E0B',
    dark: '#FBBF24'
  },
  background: {
    light: '#FFFFFF',
    dark: '#1F2937'
  }
};

// Custom tooltip component for better visibility
const CustomTooltip = ({ active, payload, label, isDarkMode }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-800 dark:text-white mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const TABS = {
  admin: [
    { key: 'analytics', label: 'Analytics' },
    { key: 'admin', label: 'Admin Panel' },
    { key: 'activity', label: 'My Activity' },
  ],
  employee: [
    { key: 'analytics', label: 'Analytics' },
    { key: 'activity', label: 'My Activity' },
  ],
};

export default function AnalyticsDashboard({ role: initialRole }) {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [viewType, setViewType] = useState('line');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState(['queries', 'uploads', 'users']);
  const [timeRange, setTimeRange] = useState('30d');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [previousPeriodData, setPreviousPeriodData] = useState([]);
  const [role, setRole] = useState(initialRole || 'employee');
  const [activeTab, setActiveTab] = useState('analytics');

  // Simulated user management and system health data for admin
  const userStats = useMemo(() => ({
    totalUsers: 42,
    activeUsers: 37,
    inactiveUsers: 5,
    newUsersThisMonth: 3,
  }), []);
  const systemHealth = useMemo(() => ({
    uptime: '99.98%',
    errorsToday: 2,
    lastDowntime: '2024-06-01 14:23',
  }), []);
  const auditLogs = useMemo(() => ([
    { action: 'User login', user: 'alice', time: '2024-06-14 09:12' },
    { action: 'Exported analytics', user: 'admin', time: '2024-06-13 17:45' },
    { action: 'Password reset', user: 'bob', time: '2024-06-13 10:30' },
  ]), []);

  // Simulated personal activity for employee
  const personalActivity = useMemo(() => ([
    { type: 'Query', detail: 'Searched for "Q2 report"', time: '2024-06-14 10:05' },
    { type: 'Upload', detail: 'Uploaded "sales.xlsx"', time: '2024-06-13 16:22' },
    { type: 'Query', detail: 'Searched for "client list"', time: '2024-06-13 09:50' },
  ]), []);

  // Detect dark mode
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
        users: '#F59E0B', // Amber-500 for dark mode
        icon: '#818CF8', // Indigo-400 for dark mode icons
      }
    : {
        queries: '#4F46E5', // Indigo-600 for better visibility
        uploads: '#059669', // Emerald-600 for better visibility
        users: '#D97706', // Amber-600 for better visibility
        icon: '#6366F1', // Indigo-500 for light mode icons
    };

  // Add custom styles for the chart
  const chartStyles = {
    axis: {
      stroke: isDarkMode ? '#E5E7EB' : '#000000',
      tick: {
        fill: isDarkMode ? '#E5E7EB' : '#000000',
        fontSize: 12,
        fontWeight: 500,
      },
      line: {
        stroke: isDarkMode ? '#4B5563' : '#000000',
      }
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Simulated API call
    setTimeout(() => {
      const days = [];
      const current = new Date(startDate);
      while (current <= endDate) {
        days.push({
          day: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          queries: Math.floor(Math.random() * 100) + 10,
          uploads: Math.floor(Math.random() * 20) + 1,
            users: Math.floor(Math.random() * 50) + 5,
            successRate: Math.floor(Math.random() * 30) + 70,
            responseTime: Math.floor(Math.random() * 200) + 100,
        });
        current.setDate(current.getDate() + 1);
      }
      setData(days);
      setLoading(false);
    }, 1000);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate, timeRange]);

  const exportData = (format) => {
    const header = 'Day,Queries,Uploads,Users,Success Rate,Response Time\n';
    const rows = data.map(d => 
      `${d.day},${d.queries},${d.uploads},${d.users},${d.successRate},${d.responseTime}`
    ).join('\n');
    
    if (format === 'csv') {
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'analytics.csv';
    link.click();
    URL.revokeObjectURL(url);
    } else if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'analytics.json';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const calculateMetrics = () => {
    const totalQueries = data.reduce((sum, d) => sum + d.queries, 0);
    const totalUploads = data.reduce((sum, d) => sum + d.uploads, 0);
    const totalUsers = data.reduce((sum, d) => sum + d.users, 0);
    const avgSuccessRate = data.reduce((sum, d) => sum + d.successRate, 0) / data.length;
    const avgResponseTime = data.reduce((sum, d) => sum + d.responseTime, 0) / data.length;

    return {
      totalQueries,
      totalUploads,
      totalUsers,
      avgSuccessRate,
      avgResponseTime,
      queriesPerDay: Math.round(totalQueries / data.length),
      uploadsPerDay: Math.round(totalUploads / data.length),
      usersPerDay: Math.round(totalUsers / data.length),
    };
  };

  const metrics = calculateMetrics();

  const tabs = TABS[role];

  return (
    <div className="max-w-7xl mx-auto bg-white dark:bg-indigo-500/5 dark:backdrop-blur-lg dark:shadow-md dark:ring-1 dark:ring-white/20 p-8 rounded-3xl shadow-lg mt-10">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-8">
        {tabs.map(tab => (
          (tab.key !== 'admin' || role === 'admin') && (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2 font-semibold rounded-t-lg focus:outline-none transition-colors duration-200
                ${activeTab === tab.key
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'}
              `}
            >
              {tab.label}
            </button>
          )
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'analytics' && (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <HiOutlineChartBar className="text-indigo-500" /> Analytics Dashboard
      </h1>
            <div className="flex gap-4">
              <button
                onClick={() => exportData('csv')}
                className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <HiOutlineDownload /> Export CSV
              </button>
              <button
                onClick={() => exportData('json')}
                className="flex items-center gap-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <HiOutlineDownload /> Export JSON
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg transition ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {range}
              </button>
            ))}
            <div className="flex items-center gap-2 ml-auto">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
                className="px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-400"
            />
              <span className="text-gray-500 dark:text-gray-300">to</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
                className="px-3 py-2 border rounded-lg text-black dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-3 bg-gray-50 dark:bg-white/10 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm text-center hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Total Queries</h3>
                <HiOutlineDocumentText className={`text-lg ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
              </div>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">{metrics.totalQueries}</p>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                {metrics.queriesPerDay} queries/day
              </p>
        </div>
            <div className="p-3 bg-gray-50 dark:bg-white/10 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm text-center hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Total Uploads</h3>
                <HiOutlineTrendingUp className={`text-lg ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
      </div>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">{metrics.totalUploads}</p>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                {metrics.uploadsPerDay} uploads/day
          </p>
        </div>
            <div className="p-3 bg-gray-50 dark:bg-white/10 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm text-center hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Active Users</h3>
                <HiOutlineUserGroup className={`text-lg ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
              </div>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">{metrics.totalUsers}</p>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                {metrics.usersPerDay} users/day
          </p>
        </div>
            <div className="p-3 bg-gray-50 dark:bg-white/10 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm text-center hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Success Rate</h3>
                <HiOutlineChartPie className={`text-lg ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
              </div>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">{metrics.avgSuccessRate.toFixed(1)}%</p>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                Avg. Response Time: {metrics.avgResponseTime}ms
          </p>
        </div>
      </div>

          {/* Chart Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewType('line')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  viewType === 'line'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-50 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/20'
                }`}
              >
                Line Chart
              </button>
              <button
                onClick={() => setViewType('bar')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  viewType === 'bar'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-50 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/20'
                }`}
              >
                Bar Chart
              </button>
              <button
                onClick={() => setViewType('area')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  viewType === 'area'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-50 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/20'
                }`}
              >
                Area Chart
              </button>
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={comparisonMode}
                  onChange={(e) => setComparisonMode(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Compare with Previous Period
              </label>
              {/* Metric selection checkboxes inline */}
              {['queries', 'uploads', 'users'].map((metric) => (
                <label
                  key={metric}
                  className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-white/5 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMetrics([...selectedMetrics, metric]);
                      } else {
                        setSelectedMetrics(selectedMetrics.filter((m) => m !== metric));
                      }
                    }}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300 capitalize">{metric}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Main Chart */}
          <div className="w-full h-[500px] relative bg-gray-50 dark:bg-white/10 rounded-2xl shadow-inner p-4 hover:shadow-md transition-shadow duration-300">
  <ResponsiveContainer>
              {viewType === 'line' && (
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <XAxis
          dataKey="day"
                    stroke={chartStyles.axis.stroke}
                    tick={{ 
                      ...chartStyles.axis.tick,
                      dy: 8
                    }}
                    axisLine={{ stroke: chartStyles.axis.line.stroke }}
                    tickLine={{ stroke: chartStyles.axis.line.stroke }}
        />
        <YAxis
                    stroke={chartStyles.axis.stroke}
                    tick={{ 
                      ...chartStyles.axis.tick,
                      dx: -8
                    }}
                    axisLine={{ stroke: chartStyles.axis.line.stroke }}
                    tickLine={{ stroke: chartStyles.axis.line.stroke }}
                  />
                  <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    wrapperStyle={{
                      paddingBottom: '20px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: chartStyles.axis.stroke
                    }}
                  />
                  {selectedMetrics.includes('queries') && (
                    <Line
                      type="monotone"
                      dataKey="queries"
                      stroke={chartColors.queries}
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                  )}
                  {selectedMetrics.includes('uploads') && (
                    <Line
                      type="monotone"
                      dataKey="uploads"
                      stroke={chartColors.uploads}
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                  )}
                  {selectedMetrics.includes('users') && (
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke={chartColors.users}
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                  )}
      </LineChart>
              )}
              {viewType === 'bar' && (
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <XAxis
          dataKey="day"
                    stroke={chartStyles.axis.stroke}
                    tick={{ 
                      ...chartStyles.axis.tick,
                      dy: 8
                    }}
                    axisLine={{ stroke: chartStyles.axis.line.stroke }}
                    tickLine={{ stroke: chartStyles.axis.line.stroke }}
        />
        <YAxis
                    stroke={chartStyles.axis.stroke}
                    tick={{ 
                      ...chartStyles.axis.tick,
                      dx: -8
                    }}
                    axisLine={{ stroke: chartStyles.axis.line.stroke }}
                    tickLine={{ stroke: chartStyles.axis.line.stroke }}
                  />
                  <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    wrapperStyle={{
                      paddingBottom: '20px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: chartStyles.axis.stroke
                    }}
                  />
                  {selectedMetrics.includes('queries') && (
                    <Bar 
                      dataKey="queries" 
                      fill={chartColors.queries}
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                  {selectedMetrics.includes('uploads') && (
                    <Bar 
                      dataKey="uploads" 
                      fill={chartColors.uploads}
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                  {selectedMetrics.includes('users') && (
                    <Bar 
                      dataKey="users" 
                      fill={chartColors.users}
                      radius={[4, 4, 0, 0]}
                    />
                  )}
      </BarChart>
    )}
              {viewType === 'area' && (
                <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis
                    dataKey="day"
                    stroke={chartStyles.axis.stroke}
                    tick={{ 
                      ...chartStyles.axis.tick,
                      dy: 8
                    }}
                    axisLine={{ stroke: chartStyles.axis.line.stroke }}
                    tickLine={{ stroke: chartStyles.axis.line.stroke }}
                  />
                  <YAxis
                    stroke={chartStyles.axis.stroke}
                    tick={{ 
                      ...chartStyles.axis.tick,
                      dx: -8
                    }}
                    axisLine={{ stroke: chartStyles.axis.line.stroke }}
                    tickLine={{ stroke: chartStyles.axis.line.stroke }}
                  />
                  <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    wrapperStyle={{
                      paddingBottom: '20px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: chartStyles.axis.stroke
                    }}
                  />
                  {selectedMetrics.includes('queries') && (
                    <Area
                      type="monotone"
                      dataKey="queries"
                      stroke={chartColors.queries}
                      fill={chartColors.queries}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  )}
                  {selectedMetrics.includes('uploads') && (
                    <Area
                      type="monotone"
                      dataKey="uploads"
                      stroke={chartColors.uploads}
                      fill={chartColors.uploads}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  )}
                  {selectedMetrics.includes('users') && (
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke={chartColors.users}
                      fill={chartColors.users}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  )}
                </AreaChart>
              )}
  </ResponsiveContainer>

  {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <ImSpinner8 className="animate-spin text-indigo-500 text-4xl" />
    </div>
  )}
</div>
        </>
      )}
      {activeTab === 'admin' && role === 'admin' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Admin Panel</h2>
          {/* User Management Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="p-4 bg-gray-50 dark:bg-white/10 rounded-xl text-center">
              <div className="text-lg font-semibold">Total Users</div>
              <div className="text-2xl font-bold">{userStats.totalUsers}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-white/10 rounded-xl text-center">
              <div className="text-lg font-semibold">Active</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-300">{userStats.activeUsers}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-white/10 rounded-xl text-center">
              <div className="text-lg font-semibold">Inactive</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-300">{userStats.inactiveUsers}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-white/10 rounded-xl text-center">
              <div className="text-lg font-semibold">New This Month</div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">{userStats.newUsersThisMonth}</div>
            </div>
          </div>
          {/* System Health */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">System Health</h3>
            <div className="flex flex-wrap gap-6">
              <div className="p-4 bg-gray-50 dark:bg-white/10 rounded-xl">
                <div>Uptime</div>
                <div className="font-bold">{systemHealth.uptime}</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/10 rounded-xl">
                <div>Errors Today</div>
                <div className="font-bold text-red-600 dark:text-red-300">{systemHealth.errorsToday}</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/10 rounded-xl">
                <div>Last Downtime</div>
                <div className="font-bold">{systemHealth.lastDowntime}</div>
              </div>
            </div>
          </div>
          {/* Audit Logs */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Recent Audit Logs</h3>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {auditLogs.map((log, idx) => (
                <li key={idx} className="py-2 flex justify-between text-sm">
                  <span>{log.action} <span className="text-gray-500">({log.user})</span></span>
                  <span className="text-gray-400">{log.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {activeTab === 'activity' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">My Activity</h2>
          {/* Recent Activity */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Recent Actions</h3>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {personalActivity.map((item, idx) => (
                <li key={idx} className="py-2 flex justify-between text-sm">
                  <span>{item.type}: <span className="text-gray-500">{item.detail}</span></span>
                  <span className="text-gray-400">{item.time}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Help/Support */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
            <a href="/help" className="text-indigo-600 dark:text-indigo-300 underline">Visit Documentation & Support</a>
          </div>
        </div>
      )}
    </div>
  );
}