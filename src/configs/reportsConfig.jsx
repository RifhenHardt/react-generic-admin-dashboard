import React from 'react';

const reasonStyles = {
  'food safety concern': 'bg-yellow-100 text-yellow-800',
  'misleading listing': 'bg-orange-100 text-orange-800',
  'prohibited item': 'bg-red-100 text-red-800',
  'seller conduct': 'bg-purple-100 text-purple-800',
};

const ReportReasonBadge = ({ reason }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-medium ${reasonStyles[reason] || 'bg-gray-100 text-gray-800'}`}>
    {reason}
  </span>
);

export const reportsConfig = {
  entityName: 'reports',
  itemLabel: 'product report',
  title: 'Product Reports',
  searchPlaceholder: 'Search reports by product, vendor team, or reason...',
  columns: [
    { key: 'reportId', label: 'Report ID', render: (row) => <span className="font-mono text-sm text-gray-700">{row.reportId}</span> },
    { key: 'product', label: 'Product', render: (row) => <span className="font-medium text-gray-900">{row.product}</span> },
    {
      key: 'sellerTeam',
      label: 'Seller / Team',
      render: (row) => <span className="text-gray-700">{row.sellerTeam}{row.sellerWarning ? ' · Prior warning' : ''}</span>,
    },
    { key: 'reason', label: 'Reason', render: (row) => <ReportReasonBadge reason={row.reason} /> },
    { key: 'submissionDate', label: 'Reported' },
  ],
  tableActions: ({ onEdit, onDelete }) => [
    { icon: <span aria-hidden="true">✎</span>, onClick: onEdit, tooltip: 'Review report' },
    { icon: <span aria-hidden="true">×</span>, onClick: onDelete, tooltip: 'Remove report' },
  ],
  actions: [{ label: 'Add Report', variant: 'primary', icon: '+' }],
  formFields: [
    { name: 'reportId', label: 'Report ID', type: 'text', required: true },
    { name: 'product', label: 'Product', type: 'text', required: true },
    { name: 'sellerTeam', label: 'Seller or project team', type: 'text', required: true },
    {
      name: 'reason',
      label: 'Reason',
      type: 'select',
      required: true,
      options: [
        { value: 'food safety concern', label: 'Food safety concern' },
        { value: 'misleading listing', label: 'Misleading listing' },
        { value: 'prohibited item', label: 'Prohibited item' },
        { value: 'seller conduct', label: 'Seller conduct' },
      ],
    },
    { name: 'submissionDate', label: 'Reported date', type: 'date', required: true },
  ],
};
