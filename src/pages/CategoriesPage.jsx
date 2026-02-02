// src/pages/CategoriesPage.jsx
import React from 'react';
import GenericManagementPage from '../components/GenericManagementPage';
import { categoriesConfig } from '../configs/categoriesConfig';

const CategoriesPage = () => {
  return <GenericManagementPage config={categoriesConfig} />;
};

export default CategoriesPage;