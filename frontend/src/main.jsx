import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import RouterApp from './routes/Router'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <RouterApp />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
