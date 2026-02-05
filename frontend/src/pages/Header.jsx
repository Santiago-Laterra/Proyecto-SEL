import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, User, ShoppingBag } from 'lucide-react';

const Header = () => {
  const { isAdmin, user } = useAuth();

  return (
    <nav className="flex justify-between items-center px-12 py-8 bg-white border-b border-gray-50">
      {/* LADO IZQUIERDO: Logo con aire */}
      <div className="flex-none">
        <Link to="/" className="text-4xl font-serif tracking-tighter text-slate-900">
          soleyah
        </Link>
      </div>

      {/* LADO DERECHO: Todo agrupado aquí */}
      <div className="flex items-center">

        {/* Menú de navegación con letras chiquitas y espaciadas */}
        <div className="flex gap-8 text-[10.3px] uppercase tracking-[0.2em] font-medium text-slate-500">
          <Link to="/" className="hover:text-slate-900 transition-colors border-b-2 border-slate-900">
            Shop
          </Link>
          <Link to="/contact" className="hover:text-slate-900 transition-colors ">
            Contact
          </Link>

          {/* Dashboard solo para Admin */}
          {isAdmin && (
            <Link to="/dashboard" className="text-emerald-600 font-bold hover:text-emerald-700">
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

          <button className="hover:text-slate-900 relative transition-transform hover:scale-110">
            <ShoppingBag size={18} strokeWidth={1.2} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;