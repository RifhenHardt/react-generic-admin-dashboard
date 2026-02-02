// src/pages/OrdersPage.jsx
import React from 'react';
import GenericManagementPage from '../components/GenericManagementPage';
import { ordersConfig } from '../configs/ordersConfig';

const OrdersPage = () => {
  return <GenericManagementPage config={ordersConfig} />;
};

export default OrdersPage;