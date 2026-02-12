import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, LogOut, User as UserIcon } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const UserDrawer = ({ isOpen, onClose, user }) => {
  const { wishlist = [], toggleWishlist } = useWishlist() || {};

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-10000 flex justify-end">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-85 bg-white shadow-2xl flex flex-col"
        style={{ height: '100dvh' }}
      >
        {/* 1. HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-800">Mi Cuenta</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <X size={22} className="text-slate-400" />
          </button>
        </div>

        {/* 2. CONTENIDO SCROLLABLE */}
        <div className="flex-1 overflow-y-auto min-h-0 p-6 custom-scrollbar">
          {/* Info Usuario */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
              <UserIcon size={38} className="text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">{user?.name || 'Usuario'}</h3>
            <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
          </div>

          {/* SECCIÓN FAVORITOS + BOTÓN LOGOUT MOBILE (El cuadrado rojo que pediste) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mis Favoritos</h3>

              {/* BOTÓN SOLO PARA MÓVILES (Cuadrado Rojo) */}
              <button
                onClick={handleLogout}
                className="flex md:hidden items-center gap-1 text-[10px] font-bold text-red-500 border border-red-100 px-2 py-1 rounded-lg bg-red-50 active:scale-95 transition-all"
              >
                <LogOut size={12} />
                CERRAR SESIÓN
              </button>
            </div>

            {wishlist.length > 0 ? (
              wishlist.map((item) => (
                <div key={item._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 bg-white shadow-sm">
                  <img src={Array.isArray(item.image) ? item.image[0] : item.image} className="w-12 h-12 object-cover rounded-lg" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{item.name}</p>
                    <p className="text-xs text-emerald-600 font-bold">$ {item.price?.toLocaleString('es-AR')}</p>
                  </div>
                  <button onClick={() => toggleWishlist(item)} className="p-1 text-slate-300 hover:text-red-500">
                    <X size={16} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-8">No tienes favoritos aún.</p>
            )}
          </div>
        </div>

        {/* 3. FOOTER (Botón Grande - SOLO SE VE EN PC/TABLET) */}
        <div className="hidden md:block p-6 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-95"
          >
            <LogOut size={20} />
            <span className="text-sm">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UserDrawer;