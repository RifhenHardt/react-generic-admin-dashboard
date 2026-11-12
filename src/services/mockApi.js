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

const storageKey = (entityName) => `campus-market-v2:${entityName}`;
const readEntity = (entityName) => getFromStorage(storageKey(entityName));
const writeEntity = (entityName, data) => saveToStorage(storageKey(entityName), data);
const today = () => new Date().toISOString().slice(0, 10);
const defaultListingKeys = new Set([
  'Ube Cheese Pandesal|BSEd Food Craft Team|2026-11-04',
  'Campus Fest Shirt|Student Council Merchandise|2026-11-03',
  'Beaded Phone Charms|Crafts for a Cause|2026-11-02',
  'Mini Campus Keychains|BS Architecture Project Group|2026-11-01',
  'Brownie Box|Bake Sale for Scholars|2026-10-31',
  'Hand-painted Tote Bag|Fine Arts Studio|2026-10-30',
  'School Spirit Pin Set|Campus Creatives|2026-10-29',
]);

const normalizeItem = (entityName, item) => {
  const normalized = { ...item };
  const numericFields = {
    listings: ['price', 'stock'],
    orders: ['quantity', 'price'],
    categories: ['productTypes'],
  }[entityName] || [];

  numericFields.forEach((field) => {
    if (normalized[field] !== '' && normalized[field] != null) normalized[field] = Number(normalized[field]);
  });

  return normalized;
};

// Initialize localStorage with mock data
const initializeData = () => {
  Object.entries(mockData).forEach(([entityName, seedData]) => {
    if (!readEntity(entityName)) writeEntity(entityName, seedData);
  });

  // Remove the old demo listings from browsers that already have the seeded data saved.
  const listings = readEntity('listings') || [];
  let migrated = false;
  const userListings = listings.filter((listing) => !defaultListingKeys.has(
    `${listing.title}|${listing.sellerTeam}|${listing.submissionDate}`,
  ));
  if (userListings.length !== listings.length) {
    listings.splice(0, listings.length, ...userListings);
    migrated = true;
  }

  // Publish listings from verified sellers even if they were created under the old review-required flow.
  listings.forEach((listing) => {
    if (!listing.sellerName) {
      const seller = (mockData.users || []).find((user) => user.teamName?.trim().toLowerCase() === listing.sellerTeam?.trim().toLowerCase());
      listing.sellerName = seller?.name || listing.sellerTeam || 'Campus seller';
      migrated = true;
    }
    if (listing.status === 'pending' && listing.sellerVerified) {
      listing.status = 'active';
      migrated = true;
    }
  });
  if (migrated) writeEntity('listings', listings);
};

initializeData();

// Generic CRUD operations
export const mockApi = {
  // GET ALL
  getAll: async (entityName, params = {}) => {
    await delay(500);
    
    let data = readEntity(entityName) || [];
    
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
    const data = readEntity(entityName) || [];
    return data.find(item => item.id === id);
  },

  // CREATE
  create: async (entityName, newItem) => {
    await delay(500);
    const data = readEntity(entityName) || [];
    const maxId = data.length > 0 ? Math.max(...data.map(item => item.id)) : 0;
    const item = normalizeItem(entityName, { ...newItem, id: maxId + 1 });
    if (entityName === 'listings' && !item.submissionDate) item.submissionDate = today();
    if (entityName === 'orders') {
      if (!item.orderId) item.orderId = `EVT-${3000 + item.id}`;
      if (!item.orderDate) item.orderDate = today();
    }
    if (entityName === 'reports') {
      if (!item.reportId) item.reportId = `REP-${2000 + item.id}`;
      if (!item.submissionDate) item.submissionDate = today();
    }
    if (entityName === 'users') {
      if (!item.joinedDate) item.joinedDate = today();
      if (!item.lastActive) item.lastActive = today();
    }
    data.push(item);
    writeEntity(entityName, data);
    return item;
  },

  // UPDATE
  update: async (entityName, id, updates) => {
    await delay(500);
    const data = readEntity(entityName) || [];
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = normalizeItem(entityName, { ...data[index], ...updates });
      writeEntity(entityName, data);
      return data[index];
    }
    throw new Error('Item not found');
  },

  // DELETE
  delete: async (entityName, id) => {
    await delay(500);
    const data = readEntity(entityName) || [];
    const filtered = data.filter(item => item.id !== id);
    writeEntity(entityName, filtered);
    return { success: true };
  }
};
