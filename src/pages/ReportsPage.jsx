// src/pages/ReportsPage.jsx
import React from 'react';
import GenericManagementPage from '../components/GenericManagementPage';
import { reportsConfig } from '../configs/reportsConfig';

const ReportsPage = () => {
  return <GenericManagementPage config={reportsConfig} />;
};

export default ReportsPage;