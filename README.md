

Here is a concise version of the README, removing unnecessary sections like `.gitignore` and boilerplate text while keeping the essential setup and usage instructions.

# Generic Admin Dashboard

A reusable admin dashboard template built with React, TailwindCSS, and React Query. Create fully functional CRUD management pages quickly through configuration objects.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.14-38bdf8.svg)
![React Query](https://img.shields.io/badge/React_Query-5.56.2-ff4154.svg)

## Features
- **Config-Driven:** Create management pages via simple configuration objects.
- **Full CRUD:** Built-in Create, Read, Update, and Delete functionality.
- **Generic Components:** Reusable DataTable, SearchBar, Pagination, and Modal.
- **Mock API:** LocalStorage-based backend for immediate development without a server.
- **Modern UI:** Responsive design using TailwindCSS 3.4 and efficient data fetching with React Query.

## Installation

```bash
git clone https://github.com/shadisbaih/react-generic-admin-dashboard.git
cd react-generic-admin-dashboard
npm install
npm start
```

## Quick Start

**1. Create Configuration File**
Define your page structure, API calls, and form fields.

```javascript
// src/configs/productsConfig.jsx
export const productsConfig = {
  entityName: 'products',
  title: 'Products Management',
  api: {
    getAll: (params) => mockApi.getAll('products', params),
    create: (data) => mockApi.create('products', data),
    update: (data) => mockApi.update('products', data.id, data),
    delete: (id) => mockApi.delete('products', id)
  },
  columns: [
    { key: 'name', label: 'Product Name' },
    { key: 'price', label: 'Price' },
    { key: 'category', label: 'Category' }
  ],
  formFields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'price', label: 'Price', type: 'number', required: true },
    { name: 'category', label: 'Category', type: 'select', options: ['Electronics', 'Clothing'] }
  ]
};
```

**2. Create Page Component**
Import the generic component and pass the config.

```javascript
// src/pages/ProductsPage.jsx
import GenericManagementPage from '../components/GenericManagementPage';
import { productsConfig } from '../configs/productsConfig';

const ProductsPage = () => {
  return <GenericManagementPage config={productsConfig} />;
};

export default ProductsPage;
```

**3. Add Route**
Add the page to your router.

```javascript
// src/App.jsx
<Route path="/products" element={<ProductsPage />} />
```

## Project Structure
```
src/
├── components/
│   ├── common/              # DataTable, Modal, SearchBar, etc.
│   ├── GenericManagementPage.jsx
│   └── Layout.jsx
├── configs/                 # Page configurations (productsConfig, etc.)
├── data/
│   └── mockData.json
├── pages/                   # Route components
├── services/
│   └── mockApi.js           # Mock API service
└── App.jsx
```

## Customization

### Backend Integration
Replace `mockApi.js` with a real API service (e.g., Axios) to connect to a backend.

```javascript
import axios from 'axios';

const api = axios.create({ baseURL: 'https://your-api.com/api' });

export const apiService = {
  getAll: (endpoint, params) => api.get(endpoint, { params }),
  create: (endpoint, data) => api.post(endpoint, data),
  update: (endpoint, id, data) => api.put(`${endpoint}/${id}`, data),
  delete: (endpoint, id) => api.delete(`${endpoint}/${id}`)
};
```

Update your configuration files to use `apiService` instead of `mockApi`.

## License
This project is licensed under the MIT License.
