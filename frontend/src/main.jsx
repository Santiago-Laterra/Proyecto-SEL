import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import RouterApp from './routes/Router'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <RouterApp />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
