import { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // --- CONFIGURACIÓN DE CÁLCULO DE ENVÍO ---
  const PRECIO_LITRO_NAFTA = 1000;
  const CONSUMO_KM_POR_LITRO = 10;
  const COSTO_FIJO_BASE = 500;

  const DISTANCIAS_KM = {
    "Villa Lugano": 1, "Nueva Pompeya": 6, "Parque Patricios": 8, "Floresta": 7,
    "Parque Avellaneda": 4, "Flores": 6, "Liniers": 7, "Parque Chacabuco": 7,
    "Caballito": 9, "Boedo": 10, "Almagro": 11, "Villa Crespo": 12,
    "Villa General Mitre": 9, "Villa del Parque": 11, "Villa Devoto": 13,
    "Villa Urquiza": 16, "Villa Pueyrredón": 15, "Saavedra": 18, "Núñez": 20,
    "Belgrano": 18, "Colegiales": 16, "Palermo": 15, "San Cristóbal": 11,
    "Constitución": 12, "San Telmo": 13, "Monserrat": 13, "San Nicolás": 14,
    "Puerto Madero": 15, "Retiro": 15, "Recoleta": 14, "Balvanera": 12,
    "San Cristóbal": 11, "Lanús": 5, "Gerli": 6, "Remedios de Escalada": 7,
    "Banfield": 9, "Lomas de Zamora": 11, "Temperley": 13, "Turdera": 14,
    "Llavallol": 16, "Monte Grande": 18, "Luis Guillón": 17, "Avellaneda Centro": 10,
    "Adrogué": 16
  };

  // --- ESTADOS ---
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('soleyah_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [shippingCost, setShippingCost] = useState(() => {
    return Number(localStorage.getItem('soleyah_shipping_cost')) || 0;
  });

  const [zipCode, setZipCode] = useState(() => {
    return localStorage.getItem('soleyah_zipcode') || '';
  });

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // --- PERSISTENCIA ---
  useEffect(() => {
    localStorage.setItem('soleyah_cart', JSON.stringify(cart));
  }, [cart]);

  // --- ACCIONES DEL CARRITO ---

  // Agregar al carrito o sumar si ya existe
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Modificar cantidad (sumar o restar)
  const updateQuantity = (productId, amount) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item._id === productId) {
            const currentQty = item.quantity || 1;
            const newQty = currentQty + amount;
            // Si es mayor a 0, actualizamos
            return newQty > 0 ? { ...item, quantity: newQty } : { ...item, quantity: 0 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0); // Si quedó en 0, se va del carrito
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  // --- CÁLCULOS TOTALES ---
  const cartTotal = cart.reduce((acc, item) => {
    return acc + (Number(item.price) * (item.quantity || 1));
  }, 0);

  // Cantidad total de productos (para el globito del icono)
  const cartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // --- LÓGICA DE ENVÍO ---
  const updateShipping = (cost) => {
    setShippingCost(cost);
    localStorage.setItem('soleyah_shipping_cost', cost);
  };

  const handleSetZipCode = (cp) => {
    setZipCode(cp);
    localStorage.setItem('soleyah_zipcode', cp);
  };

  const calculateShippingAction = (cp, localidad) => {
    const km = DISTANCIAS_KM[localidad];
    let costoFinal = 0;

    if (km !== undefined) {
      costoFinal = km === 0 ? 0 : Math.round((km / CONSUMO_KM_POR_LITRO) * PRECIO_LITRO_NAFTA + COSTO_FIJO_BASE);
    } else {
      costoFinal = 2500; // Costo por defecto si no se encuentra
    }

    updateShipping(costoFinal);
    handleSetZipCode(cp);
    return costoFinal;
  };

  const clearShipping = () => {
    setShippingCost(0);
    setZipCode('');
    localStorage.removeItem('soleyah_zipcode');
    localStorage.removeItem('soleyah_shipping_cost');
  };

  useEffect(() => {
    if (cart.length === 0) clearShipping();
  }, [cart]);

  // --- MODAL CONTROL ---
  const openCheckout = () => setIsCheckoutOpen(true);
  const closeCheckout = () => setIsCheckoutOpen(false);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity, // <--- Nueva función para el Drawer
      cartTotal,
      cartCount,      // <--- Para el icono del Navbar
      shippingCost,
      zipCod: zipCode,
      calculateShippingAction,
      clearShipping,
      isCheckoutOpen,
      openCheckout,
      closeCheckout
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);