// src/pages/AnalyticsDashboard.jsx
import React, { useEffect, useState } from 'react';
import { HiOutlineChartBar } from 'react-icons/hi';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export default function AnalyticsDashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // simulate fetching analytics data
    setData([
      { day: 'Mon', queries: 30 },
      { day: 'Tue', queries: 45 },
      { day: 'Wed', queries: 28 },
      { day: 'Thu', queries: 60 },
      { day: 'Fri', queries: 50 },
    ]);
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <HiOutlineChartBar className="text-indigo-500" /> Analytics Dashboard
      </h1>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="queries" stroke="#6366F1" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
