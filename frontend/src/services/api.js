import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
    // Agregamos comprobaciones de seguridad para que no explote si no hay respuesta
    if (error.response) {
      if (error.response.status === 401) {
        const msg = error.response.data?.message || "Sesión expirada"; // Usar ?. es clave
        alert(msg);
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;