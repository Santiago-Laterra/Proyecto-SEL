import { createContext, useState, useContext, useEffect } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('soleyah_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('soleyah_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const isFavorite = prev.find(item => item._id === product._id);
      if (isFavorite) {
        return prev.filter(item => item._id !== product._id); // Lo saca
      }
      return [...prev, product]; // Lo agrega
    });
  };

  const isFavorite = (productId) => wishlist.some(item => item._id === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isFavorite }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);