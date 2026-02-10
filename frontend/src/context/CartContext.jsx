import { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // 1. Estado para el Código Postal (con persistencia)
  const [zipCode, setZipCode] = useState(() => {
    return localStorage.getItem('soleyah_zipcode') || '';
  });

  // 2. Estado para el Costo de Envío (con persistencia)
  const [shippingCost, setShippingCost] = useState(() => {
    const saved = localStorage.getItem('soleyah_shipping_cost');
    return saved ? Number(saved) : 0;
  });

  // 3. Estado para el Carrito
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('soleyah_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Persistencia del carrito
  useEffect(() => {
    localStorage.setItem('soleyah_cart', JSON.stringify(cart));
  }, [cart]);

  // Función para actualizar ZIP y persistirlo
  const handleSetZipCode = (zip) => {
    setZipCode(zip);
    localStorage.setItem('soleyah_zipcode', zip);
  };

  // Función para actualizar Envío y persistirlo
  const updateShipping = (cost) => {
    const numericCost = Number(cost);
    setShippingCost(numericCost);
    localStorage.setItem('soleyah_shipping_cost', numericCost.toString());
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const isProductInCart = prevCart.find((item) => item._id === product._id);
      if (isProductInCart) return prevCart;
      return [...prevCart, product];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  const cartTotal = cart.reduce((acc, item) => acc + Number(item.price), 0);

  const clearShipping = () => {
    setShippingCost(0);
    setZipCode('');
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      cartTotal,
      shippingCost,
      setShippingCost: updateShipping, // Sincroniza con el Drawer
      updateShipping,                  // Sincroniza con ProductDetails
      zipCod: zipCode,                 // Usamos zipCod para que CartDrawer no rompa
      setZipCode: handleSetZipCode,    // Sincroniza con ambos
      clearShipping
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);