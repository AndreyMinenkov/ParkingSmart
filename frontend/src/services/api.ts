import axios from 'axios';

const API_BASE_URL = 'http://31.130.155.16:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Интерцептор для JWT токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  loginOrRegister: (phone: string) => 
    api.post('/auth/login-or-register', { phone }),
  logout: () => 
    api.post('/auth/logout'),
  getMe: () => 
    api.get('/auth/me')
};

// Parking endpoints
export const parkingAPI = {
  create: (data: { lat: number; lon: number; isBlocking: boolean }) => 
    api.post('/parkings', data),
  getCurrent: () => 
    api.get('/parkings/current'),
  delete: () => 
    api.delete('/parkings/current')
};

// Blockers endpoints
export const blockersAPI = {
  getNearby: (lat: number, lon: number) => 
    api.get('/blockers/nearby', { params: { lat, lon } })
};

// Calls endpoints
export const callsAPI = {
  mark: (data: { blockerId: number }) => 
    api.post('/calls', data),
  getHistory: () => 
    api.get('/calls/history')
};
