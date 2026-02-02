// src/configs/reportsConfig.jsx
import React from 'react';

const ReportReasonBadge = ({ reason }) => {
  const reasonStyles = {
    scam: 'bg-red-100 text-red-800',
    'suspicious behavior': 'bg-yellow-100 text-yellow-800',
    'prohibited item': 'bg-orange-100 text-orange-800',
    'inappropriate content': 'bg-purple-100 text-purple-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${reasonStyles[reason] || 'bg-gray-100 text-gray-800'}`}>
      {reason}
    </span>
  );
};

export const reportsConfig = {
  entityName: 'reports',
  title: 'Report Management',
  searchPlaceholder: 'Search reports by listing or user...',

  columns: [
    {
      key: 'reportId',
      label: 'Report ID',
      render: (row) => (
        <span className="font-mono text-sm text-gray-700">{row.reportId}</span>
      ),
    },
    {
      key: 'listingTitle',
      label: 'Listing Title',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.listingImage}
            alt={row.listingTitle}
            className="w-10 h-10 rounded object-cover"
          />
          <span className="font-medium text-gray-900">{row.listingTitle}</span>
        </div>
      ),
    },
    {
      key: 'seller',
      label: 'Seller',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-700">{row.seller}</span>
          {row.sellerWarning && (
            <span className="text-yellow-500" title="Warning">⚠️</span>
          )}
        </div>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (row) => <ReportReasonBadge reason={row.reason} />,
    },
    {
      key: 'submissionDate',
      label: 'Submission Date',
    },
  ],

  tableActions: ({ onEdit, onDelete }) => [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      onClick: (row) => alert(`View report: ${row.reportId}`),
      tooltip: 'View',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      onClick: (row) => alert(`Approve report: ${row.reportId}`),
      tooltip: 'Approve',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      onClick: onDelete,
      tooltip: 'Reject',
    },
  ],

  actions: [],

  formFields: [
    {
      name: 'reportId',
      label: 'Report ID',
      type: 'text',
      required: true,
    },
    {
      name: 'listingTitle',
      label: 'Listing Title',
      type: 'text',
      required: true,
    },
    {
      name: 'seller',
      label: 'Seller',
      type: 'text',
      required: true,
    },
    {
      name: 'reason',
      label: 'Reason',
      type: 'select',
      required: true,
      options: [
        { value: 'scam', label: 'Scam' },
        { value: 'suspicious behavior', label: 'Suspicious Behavior' },
        { value: 'prohibited item', label: 'Prohibited Item' },
        { value: 'inappropriate content', label: 'Inappropriate Content' },
      ],
    },
    {
      name: 'submissionDate',
      label: 'Submission Date',
      type: 'text',
      required: true,
    },
  ],
};