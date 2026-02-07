import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';

import {
  Search as SearchIcon,
  User as UserIcon,
  ShoppingBag,
  X
} from 'lucide-react';

import CartDrawer from '../components/CartDrawer';
import UserDrawer from '../components/UserDrawer';

const Header = () => {
  const { isAdmin, user } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);

  const cartCount = cart.length;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data);
      } catch (err) {
        console.error("Error cargando productos:", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredResults([]);
    } else {
      const results = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredResults(results);
    }
  }, [searchTerm, products]);

  return (
    <>
      <nav className="flex justify-between items-center px-12 py-8 bg-white border-b border-gray-50 fixed w-full top-0 z-100">

        {/* LADO IZQUIERDO: Siempre el Logo */}
        <div className="flex-none">
          <Link to="/" className="text-4xl font-serif tracking-tighter text-slate-900">
            soleyah
          </Link>
        </div>

        {/* LADO DERECHO: Contenedor de acciones con ancho controlado */}
        <div className="flex items-center justify-end flex-1">

          {isSearchOpen ? (
            /* --- MODO BUSCADOR CHICO (A LA DERECHA) --- */
            <div className="relative flex items-center animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="flex items-center border-b border-slate-900 w-70"> {/* Medida similar a los 260px + iconos */}
                <SearchIcon className="text-slate-400 mr-2" size={16} strokeWidth={1.5} />
                <input
                  autoFocus
                  type="text"
                  placeholder="¿Qué estás buscando?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-1 outline-none text-sm font-light tracking-wide placeholder:text-slate-300"
                />
                <button onClick={() => { setIsSearchOpen(false); setSearchTerm(""); }}>
                  <X size={16} strokeWidth={1.5} className="text-slate-400 hover:text-slate-900 ml-2" />
                </button>
              </div>

              {/* RESULTADOS PREDICTIVOS (Alineados al ancho del input) */}
              {searchTerm && (
                <div className="absolute top-full right-0 w-[320px] bg-white shadow-2xl rounded-b-md mt-2 max-h-87.5 overflow-y-auto border border-gray-100 z-110">
                  {filteredResults.length > 0 ? (
                    filteredResults.map(product => (
                      <div
                        key={product._id}
                        onClick={() => {
                          navigate(`/product/${product._id}`);
                          setIsSearchOpen(false);
                          setSearchTerm("");
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 group"
                      >
                        <img src={product.image} alt="" className="w-10 h-10 object-cover rounded shadow-sm" />
                        <div className="flex-1">
                          <p className="text-[13px] font-medium text-slate-800 leading-tight">{product.name}</p>
                          <p className="text-[11px] text-slate-400 italic">ARS {product.price.toLocaleString('es-AR')}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-5 text-center text-slate-400 text-xs italic">
                      Sin resultados para "{searchTerm}"
                    </div>
                  )}
                </div>
              )}
            </div>

          ) : (
            /* --- MODO NAVEGACIÓN NORMAL --- */
            <div className="flex items-center animate-in fade-in duration-500">
              <div className="flex gap-8 text-[10.3px] uppercase tracking-[0.2em] font-medium text-slate-500 mr-10">
                <Link to="/" className="hover:text-slate-900 transition-colors">Shop</Link>
                <Link to="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
                {isAdmin && (
                  <Link to="/admin" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                    Dashboard
                  </Link>
                )}
              </div>

              <div className="flex gap-5 text-slate-700 border-l pl-10 border-gray-100">
                <button onClick={() => setIsSearchOpen(true)} className="hover:text-slate-900 transition-transform hover:scale-110">
                  <SearchIcon size={18} strokeWidth={1.2} />
                </button>

                {user ? (
                  <button onClick={() => setIsUserOpen(true)} className="hover:text-slate-900 transition-transform hover:scale-110">
                    <UserIcon size={18} strokeWidth={1.2} />
                  </button>
                ) : (
                  <Link to="/login" className="hover:text-slate-900 transition-transform hover:scale-110">
                    <UserIcon size={18} strokeWidth={1.2} />
                  </Link>
                )}

                <button onClick={() => setIsCartOpen(true)} className="hover:text-slate-900 relative transition-transform hover:scale-110">
                  <ShoppingBag size={18} strokeWidth={1.2} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <UserDrawer isOpen={isUserOpen} onClose={() => setIsUserOpen(false)} user={user} />
      <div className="h-28"></div>
    </>
  );
};

export default Header;