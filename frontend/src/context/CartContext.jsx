// src/context/CartContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';


const CartContext = createContext();

export const CartProvider = ({ children }) => {

  const [shippingCost, setShippingCost] = useState(0);
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
    setShippingCost(cost);
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
    <CartContext.Provider value={{ cart, addToCart, shippingCost, updateShipping, removeFromCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);