import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Importamos los íconos: Buscar, Usuario y Carrito (Bolsa)
import { Search, User, ShoppingBag } from 'lucide-react';

const Header = () => {
  const { isAdmin, user } = useAuth(); // Usamos tu contexto de autenticación

  return (
    <nav className="flex justify-between items-center px-10 py-6 bg-white border-b border-gray-100">
      {/* LADO IZQUIERDO: Logo */}
      <div className="flex-1">
        <Link to="/" className="text-3xl font-serif tracking-tight text-slate-900">
          soleyah
        </Link>
      </div>

      {/* CENTRO: Navegación Principal */}
      <div className="flex gap-8 text-sm uppercase tracking-widest font-medium text-slate-600">
        <Link to="/" className="hover:text-slate-900 transition-colors border-b-2 border-slate-900">
          Shop
        </Link>
        <Link to="/contact" className="hover:text-slate-900 transition-colors">
          Contact
        </Link>

        {/* ✨ ACCESO ADMIN: Solo visible para vos */}
        {isAdmin && (
          <Link to="/dashboard" className="text-emerald-600 font-bold hover:text-emerald-700">
            Dashboard
          </Link>
        )}
      </div>

      {/* LADO DERECHO: Íconos de Acción */}
      <div className="flex-1 flex justify-end gap-6 text-slate-700">
        <button className="hover:text-slate-900">
          <Search size={22} strokeWidth={1.5} />
        </button>

        {/* Al apretar el símbolo de la persona, lo lleva a login */}
        <Link to={user ? "/profile" : "/login"} className="hover:text-slate-900">
          <User size={22} strokeWidth={1.5} />
        </Link>

        <button className="hover:text-slate-900 relative">
          <ShoppingBag size={22} strokeWidth={1.5} />
          {/* Aquí irá el contador del carrito más adelante */}
        </button>
      </div>
    </nav>
  );
};

export default Header;