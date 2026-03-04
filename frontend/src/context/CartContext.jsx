import { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // ... (Tus constantes de envío y DISTANCIAS_KM quedan igual)
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
    "Gerli": 10, "Lanús": 11, "Remedios de Escalada": 13, "Banfield": 15,
    "Lomas de Zamora": 17, "Temperley": 19, "Turdera": 20, "Llavallol": 22,
    "Adrogué": 23, "Luis Guillón": 24, "Monte Grande": 26, "Avellaneda Centro": 12,
    "DEFAULT": 25
  };

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [zipCode, setZipCode] = useState(() => localStorage.getItem('soleyah_zipcode') || '');
  const [shippingCost, setShippingCost] = useState(() => {
    const saved = localStorage.getItem('soleyah_shipping_cost');
    return saved ? Number(saved) : 0;
  });

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('soleyah_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('soleyah_cart', JSON.stringify(cart));
  }, [cart]);

  // --- NUEVA FUNCIÓN UPDATE QUANTITY ---
  const updateQuantity = (productId, amount) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item._id === productId) {
          const newQty = (item.quantity || 1) + amount;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const isProductInCart = prevCart.find((item) => item._id === product._id);
      if (isProductInCart) {
        return prevCart.map(item =>
          item._id === product._id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  // --- TOTAL CALCULADO CON CANTIDADES ---
  const cartTotal = cart.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0);

  // ... (Tus funciones handleSetZipCode, updateShipping, calculateShippingAction y clearShipping quedan igual)
  const handleSetZipCode = (zip) => { setZipCode(zip); localStorage.setItem('soleyah_zipcode', zip); };
  const updateShipping = (cost) => { setShippingCost(Number(cost)); localStorage.setItem('soleyah_shipping_cost', cost.toString()); };

  const calculateShippingAction = (cp, localidadNombre) => {
    if (!localidadNombre) return 0;
    const km = DISTANCIAS_KM[localidadNombre] ?? DISTANCIAS_KM["DEFAULT"];
    let costoFinal = km === 0 && cp === "1439" ? 0 : Math.round((km / CONSUMO_KM_POR_LITRO) * PRECIO_LITRO_NAFTA + COSTO_FIJO_BASE);
    updateShipping(costoFinal);
    handleSetZipCode(cp);
    return costoFinal;
  };

  const clearShipping = () => { setShippingCost(0); setZipCode(''); localStorage.removeItem('soleyah_zipcode'); localStorage.removeItem('soleyah_shipping_cost'); };
  const openCheckout = () => setIsCheckoutOpen(true);
  const closeCheckout = () => setIsCheckoutOpen(false);

  return (
    <CartContext.Provider value={{
      cart, calculateShippingAction, addToCart, cartTotal, removeFromCart, updateQuantity,
      shippingCost, setShippingCost: updateShipping, updateShipping, zipCod: zipCode,
      setZipCode: handleSetZipCode, clearShipping, isCheckoutOpen, openCheckout, closeCheckout,
    }}>
      {children}
    </CartContext.Provider>
  );
};
export const useCart = () => useContext(CartContext);