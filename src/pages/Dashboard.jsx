// src/pages/Dashboard.jsx
import React from 'react';

const Dashboard = () => {
  const stats = [
    { label: 'Total Listings', value: '156', icon: '📝', color: 'bg-primary-700' },
    { label: 'Active Reports', value: '23', icon: '⚠️', color: 'bg-primary-500' },
    { label: 'Categories', value: '12', icon: '📂', color: 'bg-primary-300' },
    { label: 'Users', value: '1,234', icon: '👥', color: 'bg-primary-600' },
  ];

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="min-w-0 rounded-lg bg-white p-4 shadow sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Welcome to ElectroLink Admin</h2>
        <p className="text-gray-600">
          This is a demo admin dashboard built with React, TailwindCSS, and React Query.
          Navigate through the sidebar to manage listings, reports, and categories.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
