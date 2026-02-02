// src/services/mockApi.js
import mockData from '../data/mockData.json';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Local storage helper
const getFromStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initialize localStorage with mock data
const initializeData = () => {
  if (!getFromStorage('listings')) {
    saveToStorage('listings', mockData.listings);
  }
  if (!getFromStorage('reports')) {
    saveToStorage('reports', mockData.reports);
  }
  if (!getFromStorage('categories')) {
    saveToStorage('categories', mockData.categories);
  }
};

initializeData();

// Generic CRUD operations
export const mockApi = {
  // GET ALL
  getAll: async (entityName, params = {}) => {
    await delay(500);
    
    let data = getFromStorage(entityName) || [];
    
    // Search filter
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      data = data.filter(item => 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchLower)
        )
      );
    }

    // Status filter (for listings)
    if (params.status && params.status !== 'all') {
      data = data.filter(item => item.status === params.status);
    }

    // Pagination
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      items: data.slice(startIndex, endIndex),
      total: data.length,
      totalPages: Math.ceil(data.length / pageSize),
      currentPage: page
    };
  },

  // GET ONE
  getOne: async (entityName, id) => {
    await delay(300);
    const data = getFromStorage(entityName) || [];
    return data.find(item => item.id === id);
  },

  // CREATE
  create: async (entityName, newItem) => {
    await delay(500);
    const data = getFromStorage(entityName) || [];
    const maxId = data.length > 0 ? Math.max(...data.map(item => item.id)) : 0;
    const item = { ...newItem, id: maxId + 1 };
    data.push(item);
    saveToStorage(entityName, data);
    return item;
  },

  // UPDATE
  update: async (entityName, id, updates) => {
    await delay(500);
    const data = getFromStorage(entityName) || [];
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updates };
      saveToStorage(entityName, data);
      return data[index];
    }
    throw new Error('Item not found');
  },

  // DELETE
  delete: async (entityName, id) => {
    await delay(500);
    const data = getFromStorage(entityName) || [];
    const filtered = data.filter(item => item.id !== id);
    saveToStorage(entityName, filtered);
    return { success: true };
  }
};