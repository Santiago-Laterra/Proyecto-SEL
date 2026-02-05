import api from './api';

export const getProducts = async () => {
  try {
    const response = await api.get('/products'); //viene de la ruta de la api y le hago la peticion get en la ruta de los productos
    return response.data; // Aquí vienen tus remeras de MongoDB
  } catch (error) {
    console.error("Error al traer los productos", error);
    throw error;
  }
};

