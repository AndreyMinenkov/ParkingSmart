import axios from 'axios';

// Явно указываем полный URL бекенда
const API_BASE_URL = 'http://31.130.155.16:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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
  
  // Логируем запросы в development режиме
  if (process.env.NODE_ENV === 'development') {
    console.log(`� API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
  }
  
  return config;
});

// ��Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Логируем ошибки в консоль для отладки
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.baseURL}${error.config?.url}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

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

// Экспортируем базовый URL для отладки
export const getApiBaseUrl = () => API_BASE_URL;
