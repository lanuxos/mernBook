import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({ baseURL: API_URL });

// attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, (err) => Promise.reject(err));

export default api;

/* high-level APIs */
export const authAPI = {
    login: async (data) => {
        const res = await api.post('/auth/login', data);
        // Save essentials to localStorage
        // This should be done here to ensure data is saved before any navigation
        if (res.data && res.data.user && res.data.token) {
            localStorage.setItem('userId', res.data.user._id);
            localStorage.setItem('role', res.data.user.role);
            localStorage.setItem('token', res.data.token);
        }
        // The component will receive the full response
        return res;
    },
    register: (data) => api.post('/auth/register', data),
};

export const electricianAPI = {
    // backend should implement GET /electricians?search=...
    list: (search = '') => api.get(`/electricians${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    getById: (id) => api.get(`/electricians/${id}`),
};

export const bookingAPI = {
    create: (payload) => api.post('/bookings', payload),
    getMine: () => api.get('/bookings/me'),
    getIncoming: () => api.get('/bookings/incoming'),
    adminAll: () => api.get('/admin/bookings'),
    updateStatus: (bookingId, action) => api.patch(`/bookings/${bookingId}/status`, { action }),
};

export const adminAPI = {
    verifyElectrician: (electricianId) => api.post(`/admin/electricians/${electricianId}/verify`),
    unVerifyElectrician: (electricianId) => api.post(`/admin/electricians/${electricianId}/unverify`),
};
