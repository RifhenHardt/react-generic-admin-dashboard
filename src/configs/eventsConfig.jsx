import React from 'react';
import StatusBadge from '../components/common/StatusBadge';

export const eventsConfig = {
  entityName: 'events',
  itemLabel: 'campus event',
  title: 'Campus Events',
  searchPlaceholder: 'Search events by name or location...',
  columns: [
    { key: 'name', label: 'Event', render: (row) => <span className="font-medium text-gray-900">{row.name}</span> },
    { key: 'date', label: 'Date' },
    { key: 'location', label: 'Location' },
    { key: 'description', label: 'About' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ],
  tableActions: ({ onEdit, onDelete }) => [
    { icon: <span aria-hidden="true">✎</span>, onClick: onEdit, tooltip: 'Edit event' },
    { icon: <span aria-hidden="true">×</span>, onClick: onDelete, tooltip: 'Remove event' },
  ],
  actions: [{ label: 'Add Event', variant: 'primary', icon: '+' }],
  formFields: [
    { name: 'name', label: 'Event name', type: 'text', required: true },
    { name: 'date', label: 'Event date', type: 'date', required: true },
    { name: 'location', label: 'Campus location', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'active', label: 'Open for vendors' },
        { value: 'completed', label: 'Completed' },
      ],
    },
  ],
};
