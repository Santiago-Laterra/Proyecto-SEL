// src/context/CartContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';


const CartContext = createContext();

export const CartProvider = ({ children }) => {


  const [zipCode, setZipCode] = useState(() => {
    // Intentamos recuperar el CP guardado, si no, vacío
    return localStorage.getItem('soleyah_zipcode') || '';
  });

  const [shippingCost, setShippingCost] = useState(() => {
    // Intentamos recuperar el costo guardado, si no, 0
    return Number(localStorage.getItem('soleyah_shipping_cost')) || 0;
  });

  useEffect(() => {
    localStorage.setItem('soleyah_zipcode', zipCode);
    localStorage.setItem('soleyah_shipping_cost', shippingCost.toString());
  }, [zipCode, shippingCost]);




  // Inicializamos el carrito con lo que haya en localStorage o un array vacío
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('soleyah_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Cada vez que el carrito cambia, lo guardamos en localStorage
  useEffect(() => {
    localStorage.setItem('soleyah_cart', JSON.stringify(cart));
  }, [cart]);


  const updateShipping = (cost) => {
    const numericCost = Number(cost);
    setShippingCost(numericCost);
    localStorage.setItem('soleyah_shipping_cost', numericCost.toString());
  };
  // Función para añadir al carrito
  const addToCart = (product) => {
    setCart((prevCart) => {
      const isProductInCart = prevCart.find((item) => item._id === product._id);
      if (isProductInCart) {
        // Si ya está, podrías aumentar la cantidad, o simplemente dejarlo así si es un PDF
        return prevCart;
      }
      return [...prevCart, product];
    });
  };

  // Función para eliminar
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  const cartTotal = cart.reduce((acc, item) => acc + Number(item.price), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, shippingCost, updateShipping, removeFromCart, cartTotal, zipCode, setZipCode }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);