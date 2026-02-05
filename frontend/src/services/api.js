import axios from 'axios';

const api = axios.create({
  // Esta es la URL de tu servidor de Node.js
  baseURL: 'http://localhost:3000/api',
});

export default api;