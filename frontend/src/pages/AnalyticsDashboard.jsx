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
  HiOutlineChartPie,
  HiOutlineUpload
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
// DatePicker removed - not needed anymore
import axios from 'axios';
import { toast } from 'react-toastify';

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

// Extended color palette for charts
const CHART_COLORS = [
  '#6366F1', // indigo-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
  '#14B8A6', // teal-500
  '#A855F7', // purple-500
  '#3B82F6', // blue-500
];

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
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [role, setRole] = useState(initialRole || 'employee');
  const [activeTab, setActiveTab] = useState('analytics');
  const [uploadedFileData, setUploadedFileData] = useState(null);
  const [uploadedChartType, setUploadedChartType] = useState('line');
  const [selectedXColumn, setSelectedXColumn] = useState(null);
  const [selectedYColumn, setSelectedYColumn] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [summary, setSummary] = useState(null);
  const [processedChartData, setProcessedChartData] = useState(null);

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

  // Real personal activity for employee
  const [personalActivity, setPersonalActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Fetch user activity
  const fetchUserActivity = async () => {
    setLoadingActivity(true);
    try {
      const response = await axios.get('http://localhost:8000/api/chat/activities/recent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const activities = response.data.map(activity => ({
        type: activity.type || activity.action || 'Activity',
        detail: activity.target || activity.action || 'No details',
        time: new Date(activity.created_at).toLocaleString(),
        responseTime: activity.response_time || null
      }));
      setPersonalActivity(activities);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      setPersonalActivity([]);
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'activity') {
      fetchUserActivity();
    }
  }, [activeTab]);

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

  // Process chart data - aggregate by category
  const processChartData = (rawData, xColumn, yColumn, chartType) => {
    if (!rawData || !xColumn || !yColumn) return null;

    // For pie chart, aggregate by category and calculate percentages
    if (chartType === 'pie') {
      const aggregated = {};
      rawData.forEach(row => {
        const category = row[xColumn];
        const value = parseFloat(row[yColumn]) || 0;
        if (category !== undefined && category !== null) {
          if (!aggregated[category]) {
            aggregated[category] = { name: category, value: 0, count: 0 };
          }
          aggregated[category].value += value;
          aggregated[category].count += 1;
        }
      });

      // Convert to array and calculate percentages
      const total = Object.values(aggregated).reduce((sum, item) => sum + item.value, 0);
      return Object.values(aggregated).map(item => ({
        name: item.name,
        value: item.value,
        count: item.count,
        percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
      }));
    }

    // For bar, line, and area charts - aggregate by category
    const aggregated = {};
    rawData.forEach(row => {
      const category = row[xColumn];
      const value = parseFloat(row[yColumn]) || 0;
      if (category !== undefined && category !== null) {
        if (!aggregated[category]) {
          aggregated[category] = { [xColumn]: category, [yColumn]: 0, count: 0 };
        }
        aggregated[category][yColumn] += value;
        aggregated[category].count += 1;
      }
    });

    // Convert to array and sort
    return Object.values(aggregated).sort((a, b) => b[yColumn] - a[yColumn]);
  };

  // Load saved document on login
  const loadSavedDocument = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get('http://localhost:8000/api/analytics/saved-document', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.document) {
        setUploadedFileData(response.data.document);
        const xCol = response.data.document.label_column || (response.data.document.text_columns && response.data.document.text_columns.length > 0 ? response.data.document.text_columns[0] : null);
        setSelectedXColumn(xCol);
        const yCol = response.data.document.numeric_columns && response.data.document.numeric_columns.length > 0 ? response.data.document.numeric_columns[0] : null;
        setSelectedYColumn(yCol);
      }
    } catch (error) {
      // No saved document - that's okay
      console.log('No saved document found');
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/api/analytics/upload-data', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setUploadedFileData(response.data);
        // Set X column (category/label)
        const xCol = response.data.label_column || (response.data.text_columns && response.data.text_columns.length > 0 ? response.data.text_columns[0] : null);
        setSelectedXColumn(xCol);
        // Set Y column (numeric value) - check if numeric_columns exists and has items
        const yCol = response.data.numeric_columns && response.data.numeric_columns.length > 0 ? response.data.numeric_columns[0] : null;
        setSelectedYColumn(yCol);
        toast.success(`File "${response.data.filename}" uploaded and saved successfully!`);
        
        // Debug log to help identify issues
        if (!yCol) {
          console.warn('No numeric columns found in uploaded file. Available columns:', response.data.columns);
          console.warn('Numeric columns detected:', response.data.numeric_columns);
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload file');
    } finally {
      setLoading(false);
      e.target.value = ''; // Reset file input
    }
  };

  // Update processed data when columns or chart type changes
  useEffect(() => {
    if (uploadedFileData && uploadedFileData.data && selectedXColumn && selectedYColumn) {
      const processed = processChartData(uploadedFileData.data, selectedXColumn, selectedYColumn, uploadedChartType);
      setProcessedChartData(processed);
    } else {
      setProcessedChartData(null);
    }
  }, [uploadedFileData, selectedXColumn, selectedYColumn, uploadedChartType]);

  // Removed fetchAnalytics - not needed anymore

  // Load saved document on component mount
  useEffect(() => {
    loadSavedDocument();
  }, []);

  // Export functions removed - not needed anymore

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
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
        <HiOutlineChartBar className="text-indigo-500" /> Analytics Dashboard
      </h1>
            <div className="flex gap-4">
              <label className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer">
                <HiOutlineUpload /> Upload Data
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
            />
              </label>
              {/* Export buttons removed - not needed anymore */}
          </div>
        </div>

          {/* KPI Cards - Show document stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-3 bg-gray-50 dark:bg-white/10 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm text-center hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Column Count</h3>
                <HiOutlineDocumentText className={`text-lg ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
              </div>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                {uploadedFileData ? uploadedFileData.numeric_columns?.length || 0 : 0}
              </p>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                Numeric columns
              </p>
        </div>
            <div className="p-3 bg-gray-50 dark:bg-white/10 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm text-center hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Row Count</h3>
                <HiOutlineTrendingUp className={`text-lg ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
      </div>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                {uploadedFileData ? uploadedFileData.row_count || 0 : 0}
              </p>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                Total rows
          </p>
        </div>
      </div>

          {/* Uploaded Document Chart Section - Single Chart Display */}
          {uploadedFileData && uploadedFileData.data ? (
            <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Uploaded Data: {uploadedFileData.filename}
                </h3>
                <button
                  onClick={() => {
                    setUploadedFileData(null);
                    setSelectedXColumn(null);
                    setSelectedYColumn(null);
                    setProcessedChartData(null);
                  }}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Clear
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    X-Axis (Category)
                  </label>
                  <select
                    value={selectedXColumn || ''}
                    onChange={(e) => setSelectedXColumn(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-gray-800 dark:text-white dark:bg-gray-800"
                  >
                    <option value="">Select column...</option>
                    {uploadedFileData.text_columns?.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Y-Axis (Value)
                  </label>
                  <select
                    value={selectedYColumn || ''}
                    onChange={(e) => setSelectedYColumn(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-gray-800 dark:text-white dark:bg-gray-800"
                  >
                    <option value="">Select column...</option>
                    {uploadedFileData.numeric_columns && uploadedFileData.numeric_columns.length > 0 ? (
                      uploadedFileData.numeric_columns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))
                    ) : (
                      <option value="" disabled>No numeric columns available</option>
                    )}
                  </select>
                </div>
              </div>
              {selectedXColumn && selectedYColumn && processedChartData && processedChartData.length > 0 && (
                <div className="w-full h-[600px] min-h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {uploadedChartType === 'pie' ? (
                      <PieChart>
                        <Pie
                          data={processedChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={140}
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                          labelLine={false}
                        >
                          {processedChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                                  <p className="text-sm font-semibold text-gray-800 dark:text-white mb-2">{data.name}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Value: <span className="font-semibold">{data.value.toFixed(2)}</span>
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Percentage: <span className="font-semibold">{data.percentage}%</span>
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Count: <span className="font-semibold">{data.count}</span>
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                  <Legend 
                          formatter={(value, entry) => {
                            const data = processedChartData.find(d => d.name === value);
                            return data ? `${value} (${data.percentage}%)` : value;
                          }}
                        />
                      </PieChart>
                    ) : uploadedChartType === 'bar' ? (
                      <BarChart 
                        data={processedChartData} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <XAxis 
                          dataKey={selectedXColumn}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          stroke={chartStyles.axis.stroke}
                          tick={{ fill: chartStyles.axis.tick.fill, fontSize: 12 }}
                        />
                        <YAxis 
                          stroke={chartStyles.axis.stroke}
                          tick={{ fill: chartStyles.axis.tick.fill, fontSize: 12 }}
                    />
                        <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                        <Legend />
                    <Bar 
                          dataKey={selectedYColumn} 
                          fill={chartColors.queries}
                          radius={[8, 8, 0, 0]}
                        >
                          {processedChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
      </BarChart>
                    ) : uploadedChartType === 'area' ? (
                      <AreaChart 
                        data={processedChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                  <XAxis
                          dataKey={selectedXColumn}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                    stroke={chartStyles.axis.stroke}
                          tick={{ fill: chartStyles.axis.tick.fill, fontSize: 12 }}
                  />
                  <YAxis
                    stroke={chartStyles.axis.stroke}
                          tick={{ fill: chartStyles.axis.tick.fill, fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                        <Legend />
                        <defs>
                          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColors.queries} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={chartColors.queries} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                    <Area
                      type="monotone"
                          dataKey={selectedYColumn} 
                      stroke={chartColors.queries}
                          fill="url(#areaGradient)"
                          strokeWidth={3}
                    />
                      </AreaChart>
                    ) : (
                      <LineChart 
                        data={processedChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <XAxis 
                          dataKey={selectedXColumn}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          stroke={chartStyles.axis.stroke}
                          tick={{ fill: chartStyles.axis.tick.fill, fontSize: 12 }}
                        />
                        <YAxis 
                          stroke={chartStyles.axis.stroke}
                          tick={{ fill: chartStyles.axis.tick.fill, fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                        <Legend />
                        <Line 
                      type="monotone"
                          dataKey={selectedYColumn} 
                          stroke={chartColors.queries} 
                          strokeWidth={3}
                          dot={{ r: 6, fill: chartColors.queries, strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 8, fill: chartColors.queries, strokeWidth: 2, stroke: '#fff' }}
                    />
                      </LineChart>
              )}
  </ResponsiveContainer>
    </div>
  )}
              {selectedXColumn && selectedYColumn && (!processedChartData || processedChartData.length === 0) && (
                <div className="w-full h-[600px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <p>No data available to display. Please check your column selections.</p>
</div>
              )}
              <div className="flex gap-2 mt-4">
                {['line', 'bar', 'area', 'pie'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setUploadedChartType(type)}
                    className={`px-3 py-1 rounded text-sm ${
                      uploadedChartType === type
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full h-[600px] min-h-[500px] flex items-center justify-center bg-gray-50 dark:bg-white/10 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <HiOutlineUpload className="mx-auto text-4xl text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No Document Uploaded</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Upload a CSV or Excel file to visualize data</p>
              </div>
            </div>
          )}

          {/* Main Chart Section Removed - Only uploaded document charts are shown */}
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Activity</h2>
            <button
              onClick={fetchUserActivity}
              disabled={loadingActivity}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loadingActivity ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          {/* Recent Activity */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Recent Actions</h3>
            {loadingActivity ? (
              <div className="flex justify-center items-center py-8">
                <ImSpinner8 className="animate-spin text-indigo-500 text-2xl" />
              </div>
            ) : personalActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No recent activity found
              </div>
            ) : (
              <div className="space-y-3">
              {personalActivity.map((item, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 dark:bg-white/10 rounded-lg border border-gray-200 dark:border-white/10 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs font-semibold">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-200">{item.detail}</p>
                        {item.responseTime && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Response time: {item.responseTime}ms
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-4">{item.time}</span>
                    </div>
                  </div>
                ))}
          </div>
            )}
          </div>
          {/* Performance Summary */}
          {personalActivity.length > 0 && (
            <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Performance Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Activities</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">{personalActivity.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                    {personalActivity.filter(a => a.responseTime).length > 0
                      ? Math.round(personalActivity.filter(a => a.responseTime).reduce((sum, a) => sum + a.responseTime, 0) / personalActivity.filter(a => a.responseTime).length)
                      : 'N/A'}ms
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Help/Support */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Need Help?</h3>
            <a href="/help" className="text-indigo-600 dark:text-indigo-300 underline">Visit Documentation & Support</a>
          </div>
        </div>
      )}
    </div>
  );
}