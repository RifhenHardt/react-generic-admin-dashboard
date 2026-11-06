import React from 'react';

const palette = {
  pending: ['bg-yellow-50', 'text-yellow-800', 'ring-yellow-600/20', 'Pending review'],
  requested: ['bg-yellow-50', 'text-yellow-800', 'ring-yellow-600/20', 'Requested'],
  unread: ['bg-yellow-50', 'text-yellow-800', 'ring-yellow-600/20', 'Awaiting reply'],
  replied: ['bg-primary-50', 'text-primary-700', 'ring-primary-600/20', 'Replied'],
  'pending verification': ['bg-yellow-50', 'text-yellow-800', 'ring-yellow-600/20', 'Pending verification'],
  active: ['bg-primary-50', 'text-primary-700', 'ring-primary-600/20', 'Active'],
  upcoming: ['bg-primary-100', 'text-primary-800', 'ring-primary-700/10', 'Upcoming'],
  accepted: ['bg-primary-100', 'text-primary-800', 'ring-primary-700/10', 'Accepted'],
  'ready for pickup': ['bg-primary-200', 'text-primary-900', 'ring-primary-700/10', 'Ready for pickup'],
  completed: ['bg-primary-100', 'text-primary-800', 'ring-primary-700/10', 'Completed'],
  sold: ['bg-primary-100', 'text-primary-800', 'ring-primary-700/10', 'Sold'],
  'sold out': ['bg-primary-100', 'text-primary-800', 'ring-primary-700/10', 'Sold out'],
  rejected: ['bg-red-50', 'text-red-700', 'ring-red-600/10', 'Rejected'],
  cancelled: ['bg-red-50', 'text-red-700', 'ring-red-600/10', 'Cancelled'],
  hidden: ['bg-gray-50', 'text-gray-600', 'ring-gray-500/10', 'Hidden'],
  inactive: ['bg-gray-50', 'text-gray-600', 'ring-gray-500/10', 'Inactive'],
};

const StatusBadge = ({ status }) => {
  const normalizedStatus = String(status || 'unknown').toLowerCase();
  const [bg, text, ring, label] = palette[normalizedStatus] || [
    'bg-gray-50', 'text-gray-600', 'ring-gray-500/10', String(status || 'Unknown'),
  ];

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${bg} ${text} ${ring}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
