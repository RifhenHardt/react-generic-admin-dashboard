// src/configs/categoriesConfig.jsx
import React from 'react';

export const categoriesConfig = {
  entityName: 'categories',
  title: 'Categories Management',
  searchPlaceholder: 'Search categories by name...',

  columns: [
    {
      key: 'icon',
      label: 'Icon',
      render: (row) => (
        <span className="text-2xl">{row.icon}</span>
      ),
    },
    {
      key: 'name',
      label: 'Category Name',
      render: (row) => (
        <span className="font-medium text-gray-900">{row.name}</span>
      ),
    },
    {
      key: 'attributesCount',
      label: 'Attributes',
      render: (row) => (
        <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-sm">
          {row.attributesCount} Attributes
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={row.isActive}
            onChange={() => {}}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      ),
    },
  ],

  tableActions: ({ onEdit, onDelete }) => [
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
      label: 'Add Category',
      variant: 'primary',
      icon: '+',
    },
  ],

  formFields: [
    {
      name: 'name',
      label: 'Category Name',
      type: 'text',
      required: true,
    },
    {
      name: 'icon',
      label: 'Icon (Emoji)',
      type: 'text',
      required: true,
    },
    {
      name: 'attributesCount',
      label: 'Number of Attributes',
      type: 'text',
      required: true,
    },
    {
      name: 'isActive',
      label: 'Status',
      type: 'checkbox',
      checkboxLabel: 'Active',
    },
  ],
};
