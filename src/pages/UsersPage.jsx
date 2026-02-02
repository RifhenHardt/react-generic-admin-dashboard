// src/pages/UsersPage.jsx
import React from 'react';
import GenericManagementPage from '../components/GenericManagementPage';
import { usersConfig } from '../configs/usersConfig';

const UsersPage = () => {
  return <GenericManagementPage config={usersConfig} />;
};

export default UsersPage;