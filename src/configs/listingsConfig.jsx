import React from 'react';
import StatusBadge from '../components/common/StatusBadge';

const categories = [
  'Food & Drinks',
  'Clothing',
  'Wearable Accessories',
  'Souvenirs',
  'Arts & Crafts',
  'Project Products',
];

export const listingsConfig = {
  entityName: 'listings',
  itemLabel: 'product listing',
  title: 'Product Listings',
  searchPlaceholder: 'Search products, vendor teams, categories, or events...',
  columns: [
    {
      key: 'title',
      label: 'Product',
      render: (row) => (
        <div className="min-w-40">
          <span className="font-medium text-gray-900">{row.title}</span>
          <p className="mt-1 text-xs text-gray-500">{row.category}</p>
        </div>
      ),
    },
    {
      key: 'sellerTeam',
      label: 'Seller / Team',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div><span className="font-medium text-gray-900">{row.sellerName || row.sellerTeam}</span><p className="mt-1 text-xs text-gray-500">{row.sellerTeam}</p></div>
          {row.sellerVerified && <span className="text-primary-600" title="Verified campus seller">✓</span>}
        </div>
      ),
    },
    {
      key: 'event',
      label: 'Event / Booth',
      render: (row) => <span className="text-gray-700">{row.event} · {row.booth}</span>,
    },
    {
      key: 'price',
      label: 'Price / Stock',
      render: (row) => (
        <div>
          <span className="font-medium text-gray-900">₱{Number(row.price || 0).toFixed(2)}</span>
          <p className="mt-1 text-xs text-gray-500">{row.stock} in stock</p>
        </div>
      ),
    },
    { key: 'submissionDate', label: 'Submitted' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ],
  tableActions: ({ onEdit, onDelete }) => [
    {
      icon: <span aria-hidden="true">✎</span>,
      onClick: onEdit,
      tooltip: 'Edit listing',
    },
    {
      icon: <span aria-hidden="true">×</span>,
      onClick: onDelete,
      tooltip: 'Remove listing',
    },
  ],
  actions: [{ label: 'Add Product', variant: 'primary', icon: '+' }],
  formFields: [
    { name: 'title', label: 'Product name', type: 'text', required: true },
    { name: 'sellerName', label: 'Seller name', type: 'text', required: true },
    { name: 'sellerTeam', label: 'Seller or project team', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'select', required: true, options: categories.map((value) => ({ value, label: value })) },
    { name: 'event', label: 'Event', type: 'text', required: true, placeholder: 'e.g. Campus Makers Fair' },
    { name: 'booth', label: 'Booth / pickup location', type: 'text', required: true },
    { name: 'price', label: 'Price (₱)', type: 'number', min: 0, step: 0.01, required: true },
    { name: 'stock', label: 'Available quantity', type: 'number', min: 0, step: 1, required: true },
    { name: 'description', label: 'Description and ingredients/materials', type: 'textarea', required: true },
    {
      name: 'status',
      label: 'Listing status',
      type: 'select',
      required: true,
      options: [
        { value: 'pending', label: 'Pending review' },
        { value: 'active', label: 'Approved / on sale' },
        { value: 'sold out', label: 'Sold out' },
        { value: 'rejected', label: 'Rejected' },
      ],
    },
    { name: 'sellerVerified', label: 'Seller verification', type: 'checkbox', checkboxLabel: 'Verified campus vendor' },
  ],
};
