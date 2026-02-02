// src/configs/ordersConfig.jsx
import React from 'react';
import { mockApi } from '../services/mockApi';
import StatusBadge from '../components/common/StatusBadge';

export const ordersConfig = {
  entityName: 'orders',
  title: 'Orders Management',
  searchPlaceholder: 'Search orders by ID, customer, or product...',

  columns: [
    {
      key: 'orderId',
      label: 'Order ID',
      render: (row) => (
        <span className="font-mono text-sm text-gray-600">#{row.orderId}</span>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-700">{row.customer}</span>
        </div>
      ),
    },
    {
      key: 'product',
      label: 'Product',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.productImage}
            alt={row.product}
            className="w-8 h-8 rounded object-cover"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0VFRUVFRSIvPgo8cGF0aCBkPSJNMTYgMTdDMTcuNjU2OSAxNyAxOSAxNS42NTY5IDE5IDE0QzE5IDEyLjM0MzEgMTcuNjU2OSAxMSAxNiAxMUMxNC4zNDMxIDExIDEzIDEyLjM0MzEgMTMgMTRDMTMgMTUuNjU2OSAxNC4zNDMxIDE3IDE2IDE3WiIgZmlsbD0iIzk5OTk5OSIvPgo8cGF0aCBkPSJNMTYgMTlDMTMuMjM4NiAxOSAxMSAyMS4yMzg2IDExIDI0QzExIDI0LjU1MjMgMTYuMDg1NCAyNC41NTIzIDIxIDI0QzIxIDIxLjIzODYgMTguNzYxNCAxOSAxNiAxOVoiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+';
            }}
          />
          <span className="text-gray-900">{row.product}</span>
        </div>
      ),
    },
    {
      key: 'quantity',
      label: 'Qty',
      render: (row) => (
        <span className="text-gray-600">{row.quantity}</span>
      ),
    },
    {
      key: 'price',
      label: 'Total',
      render: (row) => (
        <span className="font-medium text-green-700">${row.price}</span>
      ),
    },
    {
      key: 'orderDate',
      label: 'Order Date',
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
      onClick: (row) => alert(`View order details: #${row.orderId}`),
      tooltip: 'View Details',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: onEdit,
      tooltip: 'Edit Order',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: onDelete,
      tooltip: 'Cancel Order',
    },
  ],

  actions: [
    {
      label: 'Create Order',
      variant: 'primary',
      icon: '+',
    },
  ],

  formFields: [
    {
      name: 'customer',
      label: 'Customer Name',
      type: 'text',
      required: true,
    },
    {
      name: 'product',
      label: 'Product',
      type: 'text',
      required: true,
    },
    {
      name: 'quantity',
      label: 'Quantity',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'price',
      label: 'Total Price',
      type: 'number',
      required: true,
      step: 0.01,
    },
    {
      name: 'status',
      label: 'Order Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
      required: true,
    },
  ],

  api: {
    getAll: (params) => mockApi.getAll('orders', params),
    create: (data) => mockApi.create('orders', data),
    update: (data) => mockApi.update('orders', data.id, data),
    delete: (id) => mockApi.delete('orders', id),
  },
};