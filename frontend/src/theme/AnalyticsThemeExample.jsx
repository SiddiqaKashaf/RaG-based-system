import React, { useState } from 'react';
import { 
  HiOutlineChartBar, 
  HiOutlineTrendingUp,
  HiOutlineUserGroup,
  HiOutlineDocumentText
} from 'react-icons/hi';
import { 
  analyticsTheme, 
  analyticsThemeUtils,
  getChartColors,
  getKpiStyles,
  getControlStyles,
  getTabStyles,
  getContainerStyles
} from './index';

const AnalyticsThemeExample = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');
  const [selectedMetrics, setSelectedMetrics] = useState(['queries', 'uploads']);

  const chartColors = getChartColors(isDarkMode);
  const kpiStyles = getKpiStyles(isDarkMode);
  const containerStyles = getContainerStyles(isDarkMode);

  const tabs = [
    { key: 'analytics', label: 'Analytics' },
    { key: 'admin', label: 'Admin Panel' },
    { key: 'activity', label: 'My Activity' },
  ];

  const metrics = [
    { key: 'queries', label: 'Queries', icon: HiOutlineDocumentText },
    { key: 'uploads', label: 'Uploads', icon: HiOutlineTrendingUp },
    { key: 'users', label: 'Users', icon: HiOutlineUserGroup },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Theme Toggle */}
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: chartColors.text }}>
          Analytics Theme Example
        </h1>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: getControlStyles(!isDarkMode, isDarkMode).background,
            color: getControlStyles(!isDarkMode, isDarkMode).text,
          }}
        >
          {isDarkMode ? '☀️ Light' : '🌙 Dark'} Mode
        </button>
      </div>

      {/* Container with Analytics Theme */}
      <div 
        className="rounded-3xl shadow-lg backdrop-blur-lg border"
        style={{
          backgroundColor: containerStyles.background,
          borderColor: containerStyles.border,
        }}
      >
        {/* Tabs */}
        <div className="flex gap-2 border-b p-6" style={{ borderColor: chartColors.grid }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-6 py-2 font-semibold rounded-t-lg focus:outline-none transition-colors duration-200"
              style={{
                backgroundColor: getTabStyles(activeTab === tab.key, isDarkMode).background,
                color: getTabStyles(activeTab === tab.key, isDarkMode).text,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'analytics' && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div 
                  className="p-6 rounded-xl border shadow-sm"
                  style={{
                    backgroundColor: kpiStyles.background,
                    borderColor: kpiStyles.border,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold" style={{ color: kpiStyles.label }}>
                      Total Queries
                    </h3>
                    <HiOutlineDocumentText 
                      className="text-lg" 
                      style={{ color: kpiStyles.icon }}
                    />
                  </div>
                  <p className="text-2xl font-bold" style={{ color: kpiStyles.value }}>
                    1,234
                  </p>
                  <p className="text-xs font-medium mt-1" style={{ color: kpiStyles.subtitle }}>
                    123 queries/day
                  </p>
                </div>

                <div 
                  className="p-6 rounded-xl border shadow-sm"
                  style={{
                    backgroundColor: kpiStyles.background,
                    borderColor: kpiStyles.border,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold" style={{ color: kpiStyles.label }}>
                      Total Uploads
                    </h3>
                    <HiOutlineTrendingUp 
                      className="text-lg" 
                      style={{ color: kpiStyles.icon }}
                    />
                  </div>
                  <p className="text-2xl font-bold" style={{ color: kpiStyles.value }}>
                    567
                  </p>
                  <p className="text-xs font-medium mt-1" style={{ color: kpiStyles.subtitle }}>
                    56 uploads/day
                  </p>
                </div>

                <div 
                  className="p-6 rounded-xl border shadow-sm"
                  style={{
                    backgroundColor: kpiStyles.background,
                    borderColor: kpiStyles.border,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold" style={{ color: kpiStyles.label }}>
                      Active Users
                    </h3>
                    <HiOutlineUserGroup 
                      className="text-lg" 
                      style={{ color: kpiStyles.icon }}
                    />
                  </div>
                  <p className="text-2xl font-bold" style={{ color: kpiStyles.value }}>
                    89
                  </p>
                  <p className="text-xs font-medium mt-1" style={{ color: kpiStyles.subtitle }}>
                    8 users/day
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  {['Line Chart', 'Bar Chart', 'Area Chart'].map((type, index) => (
                    <button
                      key={type}
                      className="px-4 py-2 rounded-lg transition-all duration-200"
                      style={{
                        backgroundColor: getControlStyles(index === 0, isDarkMode).background,
                        color: getControlStyles(index === 0, isDarkMode).text,
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 ml-auto flex-wrap">
                  {metrics.map((metric) => (
                    <label
                      key={metric.key}
                      className="flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-colors duration-200 text-sm"
                      style={{
                        backgroundColor: selectedMetrics.includes(metric.key) 
                          ? 'rgba(79, 70, 229, 0.1)' 
                          : 'rgba(156, 163, 175, 0.1)',
                        color: selectedMetrics.includes(metric.key) 
                          ? chartColors.queries 
                          : chartColors.textSecondary,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMetrics.includes(metric.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMetrics([...selectedMetrics, metric.key]);
                          } else {
                            setSelectedMetrics(selectedMetrics.filter((m) => m !== metric.key));
                          }
                        }}
                        className="rounded"
                        style={{ 
                          accentColor: chartColors.queries 
                        }}
                      />
                      <span className="capitalize">{metric.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Chart Placeholder */}
              <div 
                className="w-full h-64 rounded-2xl border flex items-center justify-center"
                style={{
                  backgroundColor: chartColors.background,
                  borderColor: chartColors.grid,
                }}
              >
                <div className="text-center">
                  <HiOutlineChartBar 
                    className="text-6xl mx-auto mb-4" 
                    style={{ color: chartColors.icon }}
                  />
                  <p style={{ color: chartColors.textSecondary }}>
                    Chart would be rendered here using the theme colors
                  </p>
                  <div className="flex gap-4 mt-4 justify-center">
                    {selectedMetrics.map(metric => (
                      <div 
                        key={metric}
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: chartColors[metric] }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'admin' && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: chartColors.text }}>
                Admin Panel
              </h2>
              <p style={{ color: chartColors.textSecondary }}>
                Admin panel content would go here...
              </p>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: chartColors.text }}>
                My Activity
              </h2>
              <p style={{ color: chartColors.textSecondary }}>
                Activity content would go here...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Theme Information */}
      <div className="mt-8 p-6 rounded-xl border" style={{
        backgroundColor: kpiStyles.background,
        borderColor: kpiStyles.border,
      }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: chartColors.text }}>
          Theme Colors Used
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <h4 className="font-medium mb-2" style={{ color: chartColors.text }}>Primary</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: chartColors.queries }}
                />
                <span className="text-sm" style={{ color: chartColors.textSecondary }}>
                  Queries: {chartColors.queries}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: chartColors.uploads }}
                />
                <span className="text-sm" style={{ color: chartColors.textSecondary }}>
                  Uploads: {chartColors.uploads}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: chartColors.users }}
                />
                <span className="text-sm" style={{ color: chartColors.textSecondary }}>
                  Users: {chartColors.users}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsThemeExample; 