import { X, LogOut, User as UserIcon, Mail } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const UserDrawer = ({ isOpen, onClose, user }) => {
  const { wishlist = [], toggleWishlist } = useWishlist() || {};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10000">
      {/* Overlay: fixed para que no se mueva */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* EL FIX: 
        1. Usamos h-[100dvh] (Dynamic Viewport Height) para móviles.
        2. display: grid con 3 filas: auto (header), 1fr (contenido), auto (footer).
      */}
      <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl grid grid-rows-[auto_1fr_auto] h-dvh animate-in slide-in-from-right duration-300">

        {/* 1. HEADER (Fijo) */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-serif text-slate-800">Mi Cuenta</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* 2. CONTENIDO (Único lugar con scroll) */}
        {/* 'touch-auto' asegura que el táctil funcione en Brave/Chrome */}
        <div className="overflow-y-auto touch-auto px-6 py-8 custom-scrollbar">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100 shadow-sm">
              <UserIcon size={40} className="text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{user?.name || 'Usuario'}</h3>
            <div className="flex items-center gap-2 text-slate-500 mt-2">
              <Mail size={16} />
              <span className="text-sm truncate max-w-50">{user?.email || 'correo@ejemplo.com'}</span>
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Estado de cuenta</p>
              <p className="text-sm font-semibold text-slate-700">Cliente Activo</p>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Mis Favoritos</h3>
              <div className="space-y-3">
                {wishlist.length > 0 ? (
                  wishlist.map(item => (
                    <div key={item._id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
                      <img
                        src={Array.isArray(item.image) ? item.image[0] : item.image}
                        className="w-16 h-16 object-cover rounded-xl shadow-sm"
                        alt={item.name}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{item.name}</p>
                        <p className="text-xs text-emerald-600 font-bold mt-0.5">
                          {Number(item.price).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleWishlist(item)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 px-4 border-2 border-dashed border-slate-100 rounded-2xl">
                    <p className="text-sm text-slate-400 italic">No tienes productos favoritos aún.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. FOOTER (Fijo abajo) */}
        <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all active:scale-[0.98]"
          >
            <LogOut size={20} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDrawer;