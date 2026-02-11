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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el backend devuelve 401 (No autorizado)
    if (error.response && error.response.status === 401) {
      const msg = error.response.data.message || "Sesión expirada";
      alert(msg);

      // Limpiamos los datos y mandamos al Login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;