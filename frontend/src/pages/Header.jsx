import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, User as UserIcon, ShoppingBag } from 'lucide-react'; // Renombrado para evitar choques
import CartDrawer from '../components/CartDrawer';
import { useCart } from '../context/CartContext';
import UserDrawer from '../components/UserDrawer';

const Header = () => {
  const { isAdmin, user } = useAuth();
  const { cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false); // Nuevo estado para el drawer de usuario

  const cartCount = cart.length;

  return (
    <>
      <nav className="flex justify-between items-center px-12 py-8 bg-white border-b border-gray-50 fixed w-full top-0 z-50">
        {/* LADO IZQUIERDO: Logo */}
        <div className="flex-none">
          <Link to="/" className="text-4xl font-serif tracking-tighter text-slate-900">
            soleyah
          </Link>
        </div>

        {/* LADO DERECHO: Todo agrupado */}
        <div className="flex items-center">
          {/* Menú de navegación */}
          <div className="flex gap-8 text-[10.3px] uppercase tracking-[0.2em] font-medium text-slate-500 mr-10">
            <Link to="/" className="hover:text-slate-900 transition-colors">
              Shop
            </Link>
            <Link to="/contact" className="hover:text-slate-900 transition-colors ">
              Contact
            </Link>

            {isAdmin && (
              <Link to="/admin" className="text-emerald-600 font-bold hover:text-emerald-700">
                Dashboard
              </Link>
            )}
          </div>

          {/* Íconos de Acción */}
          <div className="flex gap-5 text-slate-700 border-l pl-10 border-gray-100">
            <button className="hover:text-slate-900 transition-transform hover:scale-110">
              <Search size={18} strokeWidth={1.2} />
            </button>

            {/* Icono de Usuario: Si hay usuario abre Drawer, si no va a Login */}
            {user ? (
              <button
                onClick={() => setIsUserOpen(true)}
                className="hover:text-slate-900 transition-transform hover:scale-110"
              >
                <UserIcon size={18} strokeWidth={1.2} />
              </button>
            ) : (
              <Link to="/login" className="hover:text-slate-900 transition-transform hover:scale-110">
                <UserIcon size={18} strokeWidth={1.2} />
              </Link>
            )}

            {/* Botón de Carrito */}
            <button
              className="hover:text-slate-900 relative transition-transform hover:scale-110"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag size={18} strokeWidth={1.2} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* DRAWERS */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      <UserDrawer
        isOpen={isUserOpen}
        onClose={() => setIsUserOpen(false)}
        user={user}
      />

      {/* Espaciador */}
      <div className="h-28"></div>
    </>
  );
};

export default Header;