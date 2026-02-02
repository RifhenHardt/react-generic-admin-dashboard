// src/components/common/StatusBadge.jsx
import React from 'react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      ring: 'ring-yellow-600/20',
      label: 'Pending'
    },
    active: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      ring: 'ring-green-600/20',
      label: 'Active'
    },
    rejected: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      ring: 'ring-red-600/10',
      label: 'Rejected'
    },
    sold: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      ring: 'ring-blue-700/10',
      label: 'Sold'
    },
    hidden: {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      ring: 'ring-gray-500/10',
      label: 'Hidden'
    },
  };

  const config = statusConfig[status.toLowerCase()] || {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    ring: 'ring-gray-500/10',
    label: status
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${config.bg} ${config.text} ${config.ring}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;