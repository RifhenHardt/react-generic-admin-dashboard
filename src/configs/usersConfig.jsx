// src/configs/usersConfig.jsx
import React from 'react';
import { mockApi } from '../services/mockApi';
import StatusBadge from '../components/common/StatusBadge';

export const usersConfig = {
  entityName: 'users',
  title: 'Users Management',
  searchPlaceholder: 'Search users by name or email...',

  columns: [
    {
      key: 'name',
      label: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar}
            alt={row.name}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFRUVFRUUiLz4KPHBhdGggZD0iTTIwIDIxQzIyLjc2MTQgMjEgMjUgMTguNzYxNCAyNSAxNkMyNSAxMy4yMzg2IDIyLjc2MTQgMTEgMjAgMTFDMTcuMjM4NiAxMSAxNSAxMy4yMzg2IDE1IDE2QzE1IDE4Ljc2MTQgMTcuMjM4NiAyMSAyMCAyMVoiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTI4IDI5QzI4IDI1LjEzMzMgMjQuNDE4MyAyMiAyMCAyMkMxNS41ODE3IDIyIDEyIDI1LjEzMzMgMTIgMjlDMTIgMzAuMTA0NiAxOS4wODU0IDMwLjEwNDYgMjggMzBDMjggMjkuNjY2NyAyOCAyOS4zMzMzIDI4IDI5WiIgZmlsbD0iIzk5OTk5OSIvPgo8L3N2Zz4K';
            }}
          />
          <div>
            <div className="font-medium text-gray-900">{row.name}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.role === 'admin' ? 'bg-purple-100 text-purple-800' :
          row.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {row.role}
        </span>
      ),
    },
    {
      key: 'joinedDate',
      label: 'Joined Date',
    },
    {
      key: 'lastActive',
      label: 'Last Active',
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
      onClick: (row) => alert(`View profile for: ${row.name}`),
      tooltip: 'View Profile',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: onEdit,
      tooltip: 'Edit User',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: onDelete,
      tooltip: 'Delete User',
    },
  ],

  actions: [
    {
      label: 'Add User',
      variant: 'primary',
      icon: '+',
    },
  ],

  formFields: [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'user', label: 'User' },
        { value: 'moderator', label: 'Moderator' },
        { value: 'admin', label: 'Administrator' },
      ],
      required: true,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'suspended', label: 'Suspended' },
      ],
      required: true,
    },
  ],

  api: {
    getAll: (params) => mockApi.getAll('users', params),
    create: (data) => mockApi.create('users', data),
    update: (data) => mockApi.update('users', data.id, data),
    delete: (id) => mockApi.delete('users', id),
  },
};