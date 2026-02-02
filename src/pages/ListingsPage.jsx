// src/pages/ListingsPage.jsx
import React from 'react';
import GenericManagementPage from '../components/GenericManagementPage';
import { listingsConfig } from '../configs/listingsConfig';

const ListingsPage = () => {
  return <GenericManagementPage config={listingsConfig} />;
};

export default ListingsPage;