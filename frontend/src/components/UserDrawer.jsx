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
        <div className="flex items-center justify-between p-6 border-b border-gray-50 shrink-0">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Mi Perfil</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors group">
            <X size={20} className="text-slate-300 group-hover:text-slate-600" />
          </button>
        </div>

        {/* 2. CONTENIDO SCROLLABLE */}
        <div className="flex-1 overflow-y-auto min-h-0 p-8 custom-scrollbar">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="relative">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                <UserIcon size={28} className="text-slate-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">{user?.name || 'Usuario'}</h3>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-1">{user?.email}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Favoritos</h3>

              {/* BOTÓN MOBILE (Rosita) */}
              <button
                onClick={handleLogout}
                className="flex md:hidden items-center gap-1.5 text-[9px] font-bold text-rose-400 bg-rose-50 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-all uppercase"
              >
                <LogOut size={10} strokeWidth={3} />
                Salir
              </button>
            </div>

            {wishlist.length > 0 ? (
              wishlist.map((item) => (
                <div key={item._id} className="group flex items-center gap-4 p-2 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                  <img src={Array.isArray(item.image) ? item.image[0] : item.image} className="w-12 h-12 object-cover rounded-xl shadow-sm" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{item.name}</p>
                    <p className="text-[11px] text-emerald-600 font-bold mt-0.5">$ {item.price?.toLocaleString('es-AR')}</p>
                  </div>
                  <button onClick={() => toggleWishlist(item)} className="p-2 text-slate-200 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100">
                    <X size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 px-4 border-2 border-dashed border-slate-50 rounded-3xl">
                <p className="text-[11px] text-slate-300 font-medium uppercase tracking-widest">Lista vacía</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. FOOTER (Botón Rosita Chico y Centrado) */}
        <div className="p-8 pt-2 shrink-0 bg-white flex justify-center">
          <button
            onClick={handleLogout}
            className="px-8 py-3 bg-rose-400 text-white text-[11px] font-bold rounded-full hover:bg-rose-500 transition-all active:scale-95 shadow-sm shadow-rose-100 flex items-center gap-2 uppercase tracking-widest"
          >
            <LogOut size={16} strokeWidth={2.5} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UserDrawer;