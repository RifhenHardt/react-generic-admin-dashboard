import React from 'react';
import StatusBadge from '../components/common/StatusBadge';

export const usersConfig = {
  entityName: 'users',
  itemLabel: 'campus member',
  title: 'Students & Vendor Teams',
  searchPlaceholder: 'Search campus members, school emails, or teams...',
  columns: [
    {
      key: 'name',
      label: 'Campus member',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-800">
            {String(row.name || '?').split(' ').map((part) => part[0]).slice(0, 2).join('')}
          </span>
          <div className="min-w-0">
            <div className="font-medium text-gray-900">{row.name}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Account type',
      render: (row) => {
        const roleColor = row.role === 'moderator'
          ? 'bg-primary-100 text-primary-800'
          : row.role === 'organizer'
            ? 'bg-primary-50 text-primary-700'
            : row.role === 'vendor'
              ? 'bg-primary-200 text-primary-900'
              : 'bg-gray-100 text-gray-700';
        return <span className={`rounded px-2 py-1 text-xs font-medium ${roleColor}`}>{row.role}</span>;
      },
    },
    { key: 'teamName', label: 'Vendor / project team' },
    { key: 'joinedDate', label: 'Joined' },
    { key: 'lastActive', label: 'Last active' },
    { key: 'status', label: 'Verification / status', render: (row) => <StatusBadge status={row.status} /> },
  ],
  tableActions: ({ onEdit, onDelete }) => [
    { icon: <span aria-hidden="true">✎</span>, onClick: onEdit, tooltip: 'Edit member' },
    { icon: <span aria-hidden="true">×</span>, onClick: onDelete, tooltip: 'Remove member' },
  ],
  actions: [{ label: 'Add Member', variant: 'primary', icon: '+' }],
  formFields: [
    { name: 'name', label: 'Full name', type: 'text', required: true },
    { name: 'email', label: 'School email', type: 'email', required: true },
    {
      name: 'role',
      label: 'Account type',
      type: 'select',
      required: true,
      options: [
        { value: 'student', label: 'Student buyer' },
        { value: 'vendor', label: 'Student vendor' },
        { value: 'organizer', label: 'Event organizer' },
        { value: 'moderator', label: 'Marketplace moderator' },
      ],
    },
    { name: 'teamName', label: 'Vendor / project team', type: 'text' },
    { name: 'joinedDate', label: 'Joined date', type: 'date', required: true },
    {
      name: 'status',
      label: 'Verification / status',
      type: 'select',
      required: true,
      options: [
        { value: 'active', label: 'Verified and active' },
        { value: 'pending verification', label: 'Pending verification' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'suspended', label: 'Suspended' },
      ],
    },
  ],
};
