import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { Search as SearchIcon, User as UserIcon, ShoppingBag, X, Menu } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // Función para manejar la navegación desde el buscador y limpiar estados
  const handleSearchNavigation = (productId) => {
    navigate(`/product/${productId}`);
    setIsSearchOpen(false);
    setSearchTerm("");
  };

  return (
    <>
      <nav className="flex justify-between items-center px-6 md:px-12 py-5 md:py-8 bg-white border-b border-gray-100 fixed w-full top-0 z-50">

        {/* --- MOBILE: Botón Hamburguesa --- */}
        <div className="flex md:hidden flex-1">
          <button onClick={() => setIsMenuOpen(true)} className="text-slate-700">
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* LOGO */}
        <div className="flex-none text-center md:text-left">
          <Link to="/" className="text-[30px] md:text-[40px] font-serif tracking-tighter text-slate-900">
            soleyah
          </Link>
        </div>

        {/* LADO DERECHO: Acciones */}
        <div className="flex items-center justify-end flex-1 gap-4 md:gap-5">

          {/* BUSCADOR (PC) */}
          <div className="hidden md:flex items-center">
            {isSearchOpen ? (
              <div className="relative flex items-center animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="flex flex-col relative">
                  <div className="flex items-center border-b border-slate-900 w-80">
                    <SearchIcon className="text-slate-400 mr-2" size={16} strokeWidth={1.5} />
                    <input
                      autoFocus
                      type="text"
                      placeholder="¿Qué estás buscando?"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-1 outline-none text-sm font-light tracking-wide"
                    />
                    <button onClick={() => { setIsSearchOpen(false); setSearchTerm(""); }}>
                      <X size={16} strokeWidth={1.5} className="text-slate-400 ml-2" />
                    </button>
                  </div>

                  {/* RESULTADOS PC */}
                  {searchTerm && (
                    <div className="absolute top-full left-0 w-full bg-white shadow-xl border border-gray-100 mt-2 z-50 max-h-100 overflow-y-auto">
                      {filteredResults.length > 0 ? (
                        filteredResults.map((product) => (
                          <div
                            key={product._id}
                            onClick={() => handleSearchNavigation(product._id)}
                            className="flex items-center gap-4 p-3 hover:bg-slate-50 transition-colors border-b border-gray-50 cursor-pointer"
                          >
                            <img
                              src={Array.isArray(product.image) ? product.image[0] : product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="text-sm font-medium text-slate-800">{product.name}</p>
                              <p className="text-xs text-slate-500">ARS {product.price.toLocaleString('es-AR')}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="p-4 text-sm text-slate-400 text-center italic">No hay resultados</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-8 text-[10.3px] uppercase tracking-[0.2em] font-medium text-slate-500 mr-10 font-['proxima-nova']">
                <Link to="/" className="hover:text-slate-900 transition-colors">Shop</Link>
                <Link to="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
                {isAdmin && (
                  <Link to="/admin" className="text-emerald-600 font-bold hover:text-emerald-700">Dashboard</Link>
                )}
              </div>
            )}
          </div>

          {/* ICONOS ACCIÓN */}
          <div className="flex items-center gap-4 md:gap-5 text-slate-700 md:border-l md:pl-10 border-gray-100">
            <button onClick={() => setIsSearchOpen(true)} className="hover:text-slate-900 transition-transform hover:scale-110">
              <SearchIcon size={20} md:size={18} strokeWidth={1.2} />
            </button>

            <div className="hidden md:block">
              {user ? (
                <button onClick={() => setIsUserOpen(true)} className="hover:text-slate-900 transition-transform hover:scale-110">
                  <UserIcon size={18} strokeWidth={1.2} />
                </button>
              ) : (
                <Link to="/login" className="hover:text-slate-900 transition-transform hover:scale-110">
                  <UserIcon size={18} strokeWidth={1.2} />
                </Link>
              )}
            </div>

            <button onClick={() => setIsCartOpen(true)} className="hover:text-slate-900 relative transition-transform hover:scale-110">
              <ShoppingBag size={20} md:size={18} strokeWidth={1.2} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* --- OVERLAY BUSCADOR MOBILE (Corregido) --- */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-white z-110 p-6 flex flex-col md:hidden animate-in fade-in duration-200">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
            <SearchIcon size={20} className="text-slate-400" />
            <input
              autoFocus
              type="text"
              placeholder="¿Qué estás buscando?"
              className="flex-1 outline-none text-lg font-light"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => { setIsSearchOpen(false); setSearchTerm(""); }}>
              <X size={24} className="text-slate-400" />
            </button>
          </div>

          {/* LISTA DE RESULTADOS MOBILE */}
          <div className="mt-4 overflow-y-auto flex-1">
            {searchTerm && (
              filteredResults.length > 0 ? (
                filteredResults.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleSearchNavigation(product._id)}
                    className="flex items-center gap-4 py-4 border-b border-gray-50 active:bg-gray-50"
                  >
                    <img
                      src={Array.isArray(product.image) ? product.image[0] : product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded shadow-sm"
                    />
                    <div className="flex-1">
                      <p className="text-[15px] font-medium text-slate-800">{product.name}</p>
                      <p className="text-sm text-slate-500">ARS {product.price.toLocaleString('es-AR')}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center mt-10 text-slate-400 italic">No hay resultados para "{searchTerm}"</p>
              )
            )}
          </div>
        </div>
      )}

      {/* --- MENÚ LATERAL MOBILE --- */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-100 md:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[80%] bg-white p-10 flex flex-col animate-in slide-in-from-left duration-300">
            <button onClick={() => setIsMenuOpen(false)} className="self-end mb-10">
              <X size={28} strokeWidth={1} className="text-slate-400" />
            </button>
            <nav className="flex flex-col gap-8 text-[20px] font-['proxima-nova'] font-bold text-slate-800 tracking-tight">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>Shop</Link>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
              {user ? (
                <button onClick={() => { setIsUserOpen(true); setIsMenuOpen(false); }} className="text-left font-bold">
                  Mi Cuenta
                </button>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>Iniciar sesión</Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-emerald-600 pt-4 border-t border-gray-100">
                  Dashboard
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <UserDrawer isOpen={isUserOpen} onClose={() => setIsUserOpen(false)} user={user} />
      <div className="h-20 md:h-28"></div>
    </>
  );
};

export default Header;