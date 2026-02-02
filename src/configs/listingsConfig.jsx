// src/configs/listingsConfig.jsx
import React from 'react';
import StatusBadge from '../components/common/StatusBadge';

export const listingsConfig = {
  entityName: 'listings',
  title: 'Listings Management',
  searchPlaceholder: 'Search listings by title or seller...',

  columns: [
    {
      key: 'title',
      label: 'Listing Title',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image}
            alt={row.title}
            className="w-10 h-10 rounded object-cover"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iNCIgZmlsbD0iI0VFRUVFRSIvPgo8cGF0aCBkPSJNMTYgMTdDMTcuNjU2OSAxNyAxOSAxNS42NTY5IDE5IDE0QzE5IDEyLjM0MzEgMTcuNjU2OSAxMSAxNiAxMUMxNC4zNDMxIDExIDEzIDEyLjM0MzEgMTMgMTRDMTMgMTUuNjU2OSAxNC4zNDMxIDE3IDE2IDE3WiIgZmlsbD0iIzk5OTk5OSIvPgo8cGF0aCBkPSJNMTYgMTlDMTMuMjM4NiAxOSAxMSAyMS4yMzg2IDExIDI0QzExIDI0LjU1MjMgMTYuMDg1NCAyNC41NTIzIDIxIDI0QzIxIDIxLjIzODYgMTguNzYxNCAxOSAxNiAxOVoiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+';
            }}
          />
          <span className="font-medium text-gray-900">{row.title}</span>
        </div>
      ),
    },
    {
      key: 'seller',
      label: 'Seller',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-700">{row.seller}</span>
          {row.sellerVerified && (
            <span className="text-green-500" title="Verified">✓</span>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
          {row.category}
        </span>
      ),
    },
    {
      key: 'submissionDate',
      label: 'Submission Date',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
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
      onClick: (row) => alert(`View details for: ${row.title}`),
      tooltip: 'View',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: onEdit,
      tooltip: 'Edit',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: onDelete,
      tooltip: 'Delete',
    },
  ],

  actions: [
    {
      label: 'Add Listing',
      variant: 'primary',
      icon: '+',
    },
  ],

  formFields: [
    {
      name: 'title',
      label: 'Title',
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
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { value: 'Phone', label: 'Phone' },
        { value: 'Laptops', label: 'Laptops' },
        { value: 'Audio', label: 'Audio' },
        { value: 'Gaming', label: 'Gaming' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'active', label: 'Active' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'sold', label: 'Sold' },
      ],
    },
    {
      name: 'submissionDate',
      label: 'Submission Date',
      type: 'text',
      required: true,
    },
    {
      name: 'sellerVerified',
      label: 'Seller Status',
      type: 'checkbox',
      checkboxLabel: 'Verified Seller',
    },
  ],
};