import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Auto-attach JWT token to every request
API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMyProfile = () => API.get('/auth/me');
export const updateMyProfile = (data) => API.put('/auth/me', data);

// Expenses
export const getExpenses = (month, year) => API.get('/expenses', { params: { month, year } });
export const addExpense = (data) => API.post('/expenses', data);
export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);
export const getCategories = () => API.get('/expenses/categories');

// Budgets
export const getBudgets = (month, year) => API.get('/budgets', { params: { month, year } });
export const saveBudget = (data) => API.post('/budgets', data);
export const deleteBudget = (id) => API.delete(`/budgets/${id}`);

// Cards
export const getCards = () => API.get('/cards');
export const searchCards = (q) => API.get('/cards/search', { params: { q } });
export const addCard = (data) => API.post('/cards', data);
export const deleteCard = (id) => API.delete(`/cards/${id}`);

// Dashboard
export const getDashboard = () => API.get('/dashboard');
export const getRecommendation = (category) => API.get(`/dashboard/recommend/${category}`);
