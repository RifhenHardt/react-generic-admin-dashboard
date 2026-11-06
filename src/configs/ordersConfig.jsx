import React from 'react';
import StatusBadge from '../components/common/StatusBadge';

export const ordersConfig = {
  entityName: 'orders',
  itemLabel: 'campus order',
  title: 'Campus Orders & Reservations',
  searchPlaceholder: 'Search order ID, buyer, vendor, product, or event...',
  columns: [
    { key: 'orderId', label: 'Order', render: (row) => <span className="font-mono text-sm text-gray-600">{row.orderId}</span> },
    { key: 'customer', label: 'Buyer' },
    {
      key: 'product',
      label: 'Product / Vendor',
      render: (row) => <div><span className="font-medium text-gray-900">{row.product}</span><p className="mt-1 text-xs text-gray-500">{row.sellerTeam}</p></div>,
    },
    { key: 'event', label: 'Event' },
    { key: 'quantity', label: 'Qty' },
    { key: 'price', label: 'Total', render: (row) => <span className="font-medium text-primary-800">₱{Number(row.price || 0).toFixed(2)}</span> },
    { key: 'orderDate', label: 'Requested' },
    { key: 'status', label: 'Pickup status', render: (row) => <StatusBadge status={row.status} /> },
  ],
  tableActions: ({ onEdit, onDelete }) => [
    { icon: <span aria-hidden="true">✎</span>, onClick: onEdit, tooltip: 'Update order' },
    { icon: <span aria-hidden="true">×</span>, onClick: onDelete, tooltip: 'Cancel order' },
  ],
  actions: [{ label: 'Add Reservation', variant: 'primary', icon: '+' }],
  formFields: [
    { name: 'customer', label: 'Buyer name', type: 'text', required: true },
    { name: 'product', label: 'Product', type: 'text', required: true },
    { name: 'sellerTeam', label: 'Seller or project team', type: 'text', required: true },
    { name: 'event', label: 'Event / pickup point', type: 'text', required: true },
    { name: 'quantity', label: 'Quantity', type: 'number', min: 1, step: 1, required: true },
    { name: 'price', label: 'Total (₱)', type: 'number', min: 0, step: 0.01, required: true },
    {
      name: 'status',
      label: 'Reservation status',
      type: 'select',
      required: true,
      options: [
        { value: 'requested', label: 'Requested' },
        { value: 'accepted', label: 'Accepted by seller' },
        { value: 'ready for pickup', label: 'Ready for pickup' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
  ],
};
