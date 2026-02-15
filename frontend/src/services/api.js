import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
});

// Add interceptor to include token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const loginWithGoogle = async (idToken) => {
    const response = await api.post('/auth/google', { idToken });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const register = async (email, password, displayName) => {
    const response = await api.post('/auth/register', { email, password, displayName });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get('/auth/profile');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
};

export const getExpenses = async () => {
    const response = await api.get('/expenses');
    return response.data;
};

export const addExpense = async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
};

export const getAnalytics = async () => {
    const response = await api.get('/analytics');
    return response.data;
};

export const getSubscriptions = async () => {
    const response = await api.get('/subscriptions');
    return response.data;
};

export const addSubscription = async (subData) => {
    const response = await api.post('/subscriptions', subData);
    return response.data;
};

export const updateSubscription = async (id, subData) => {
    const response = await api.patch(`/subscriptions/${id}`, subData);
    return response.data;
};

export const updateProfile = async (userData) => {
    const response = await api.patch('/auth/profile', userData);
    const updatedUser = response.data;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
};

export const changePassword = async (passwords) => {
    const response = await api.patch('/auth/change-password', passwords);
    return response.data;
};

export const deleteAccount = async () => {
    const response = await api.delete('/auth/profile');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
};

export const deleteExpense = async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
};

export const updateExpense = async (id, expenseData) => {
    const response = await api.patch(`/expenses/${id}`, expenseData);
    return response.data;
};

export const resetExpenses = async () => {
    const response = await api.post('/expenses/reset');
    return response.data;
};

export const getCategories = async () => {
    const response = await api.get('/auth/categories');
    return response.data;
};

export const addCustomCategory = async (categoryData) => {
    const response = await api.post('/auth/categories', categoryData);
    return response.data;
};

export default api;
