import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Este interceptor es el que "habla" con el middleware del backend
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Aquí es donde agregamos el "Bearer " que te pide el error de la imagen
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;