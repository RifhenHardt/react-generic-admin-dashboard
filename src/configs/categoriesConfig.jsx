// src/configs/categoriesConfig.jsx
import React from 'react';

export const categoriesConfig = {
  entityName: 'categories',
  itemLabel: 'product category',
  title: 'Product Categories',
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
      key: 'productTypes',
      label: 'Product types',
      render: (row) => (
        <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-sm">
          {row.productTypes} product types
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${row.isActive ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
          {row.isActive ? 'Active' : 'Hidden'}
        </span>
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
      label: 'Category name',
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
      name: 'productTypes',
      label: 'Product types in this category',
      type: 'number',
      min: 0,
      step: 1,
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
