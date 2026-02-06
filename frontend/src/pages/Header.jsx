import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, User, ShoppingBag } from 'lucide-react';
import CartDrawer from '../components/CartDrawer';
import { useCart } from '../context/CartContext';
import UserDrawer from './UserDrawer';

const Header = () => {
  const { isAdmin, user } = useAuth();
  const { cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

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
            <Link to="/" className="hover:text-slate-900 transition-colors border-b-2 border-slate-900">
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

            <Link to={user ? "/profile" : "/login"} className="hover:text-slate-900 transition-transform hover:scale-110">
              <User size={18} strokeWidth={1.2} />
            </Link>

            {/* Botón de Carrito con Contador dinámico */}
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

      {/* RENDERIZAR EL DRAWER FUERA DE LA NAV PARA EVITAR PROBLEMAS DE Z-INDEX */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Espaciador para que el contenido no quede debajo del header fixed */}
      <div className="h-25"></div>
    </>
  );
};

export default Header;