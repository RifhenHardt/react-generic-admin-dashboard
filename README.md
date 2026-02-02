# Generic Admin Dashboard

A reusable admin dashboard template built with React, TailwindCSS 3.4, and React Query. Create fully functional CRUD management pages quickly through configuration objects.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.14-38bdf8.svg)
![React Query](https://img.shields.io/badge/React_Query-5.56.2-ff4154.svg)

## Features

- Generic & Reusable Components - DataTable, SearchBar, Pagination, Modal
- Configuration-Based Pages - Create management pages with config files
- Full CRUD Operations - Create, Read, Update, Delete functionality
- Mock API with LocalStorage - Development without backend requirements
- Search & Pagination - Built-in filtering and pagination
- Modern UI with TailwindCSS 3.4 - Responsive and accessible design
- React Query Integration - Efficient data fetching and caching
- Modal Forms - Dynamic form generation
- Responsive Design - Cross-device compatibility
- Easy to Extend - Add new pages quickly

## Tech Stack

- React 18.3.1
- React Router DOM 6.26.2
- TailwindCSS 3.4.14
- React Query (@tanstack/react-query) 5.56.2
- Zustand 4.5.5 (optional, for global state)
- LocalStorage (Mock API)

## Installation

### Prerequisites
- Node.js >= 14.0.0
- npm or yarn

### Setup
```bash
git clone https://github.com/shadisbaih/react-generic-admin-dashboard.git
cd react-generic-admin-dashboard
npm install
npm start
```

The application will be available at `http://localhost:3000`

## Quick Start

### Create a New Management Page

1. **Create Configuration File**
```javascript
// src/configs/productsConfig.jsx
export const productsConfig = {
  entityName: 'products',
  title: 'Products Management',
  searchPlaceholder: 'Search products...',
  
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

  tableActions: ({ onEdit, onDelete }) => [
    { icon: 'View', onClick: (row) => console.log(row), tooltip: 'View' },
    { icon: 'Edit', onClick: onEdit, tooltip: 'Edit' },
    { icon: 'Delete', onClick: onDelete, tooltip: 'Delete' }
  ],

  formFields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'price', label: 'Price', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'select', options: [...] }
  ]
};
```

2. **Create Page Component**
```javascript
// src/pages/ProductsPage.jsx
import GenericManagementPage from '../components/GenericManagementPage';
import { productsConfig } from '../configs/productsConfig';

const ProductsPage = () => {
  return <GenericManagementPage config={productsConfig} />;
};

export default ProductsPage;
```

3. **Add Route**
```javascript
// src/App.jsx
<Route path="/products" element={<ProductsPage />} />
```

You now have a fully functional CRUD management page.

## Project Structure
```
src/
├── components/
│   ├── common/              # Reusable components
│   │   ├── DataTable.jsx
│   │   ├── SearchBar.jsx
│   │   ├── Pagination.jsx
│   │   ├── PageHeader.jsx
│   │   ├── GenericModal.jsx
│   │   └── StatusBadge.jsx
│   ├── GenericManagementPage.jsx  # Main generic page component
│   └── Layout.jsx           # App layout with sidebar
├── configs/                 # Page configurations
│   ├── listingsConfig.jsx
│   ├── reportsConfig.jsx
│   └── categoriesConfig.jsx
├── data/
│   └── mockData.json        # Mock data
├── pages/                   # Page components
│   ├── Dashboard.jsx
│   ├── ListingsPage.jsx
│   ├── ReportsPage.jsx
│   └── CategoriesPage.jsx
├── services/
│   └── mockApi.js           # Mock API service
├── App.jsx
└── index.css
```

## Customization

### Styling

The project uses TailwindCSS 3.4. Customize the theme in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#6366f1',
        600: '#4f46e5',
        700: '#4338ca',
      },
    },
  },
}
```

### Custom Components

Extend or create new components in `src/components/common/`.

### Backend Integration

Replace `mockApi.js` with real API calls:
```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-api.com/api',
});

export const apiService = {
  getAll: (endpoint, params) => api.get(endpoint, { params }),
  create: (endpoint, data) => api.post(endpoint, data),
  update: (endpoint, id, data) => api.put(`${endpoint}/${id}`, data),
  delete: (endpoint, id) => api.delete(`${endpoint}/${id}`)
};
```

Update your configuration files to use the real API service.

## 📚 Configuration Options

### Config Object Structure
```javascript
{
  entityName: string,           // Entity name for API calls
  title: string,                // Page title
  searchPlaceholder: string,    // Search input placeholder
  
  api: {                        // API methods
    getAll: Function,
    create: Function,
    update: Function,
    delete: Function
  },
  
  columns: [                    // Table columns
    {
      key: string,
      label: string,
      render?: Function         // Optional custom renderer
    }
  ],
  
  tableActions: Function,       // Row actions (edit, delete, etc.)
  actions: Array,               // Header actions (add new, export, etc.)
  formFields: Array             // Form fields for create/edit modal
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Data management with [React Query](https://tanstack.com/query)
- Icons from [Heroicons](https://heroicons.com/)



⭐ If you find this project useful, please consider giving it a star!
```

---

## LICENSE
```
MIT License

Copyright (c) 2025 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## .gitignore
```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea
.vscode
*.swp
*.swo
*~

# OS
Thumbs.db