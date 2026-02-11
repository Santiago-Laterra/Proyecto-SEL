import { X, LogOut, User as UserIcon, Mail } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';


const UserDrawer = ({ isOpen, onClose, user }) => {
  const { wishlist, toggleWishlist } = useWishlist();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/'; // Recarga y limpia todo el estado
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 overflow-hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-serif text-slate-800">Mi Cuenta</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
              <UserIcon size={40} className="text-emerald-600" />
            </div>
            <h3 className="text-2xl font-medium text-slate-800">{user?.name || 'Usuario'}</h3>
            <div className="flex items-center gap-2 text-slate-500 mt-2">
              <Mail size={16} />
              <span className="text-sm">{user?.email || 'correo@ejemplo.com'}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Estado de cuenta</p>
              <p className="text-sm font-medium text-slate-700">Cliente Activo</p>
            </div>

            {/* SECCIÓN DE DESEADOS (Tu recuadro rojo) */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Mis Favoritos</h3>
              <div className="space-y-3">
                {wishlist && wishlist.length > 0 ? (
                  wishlist.map(item => (
                    <div key={item._id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all group">
                      {/* Imagen con manejo de errores o array */}
                      <img
                        src={Array.isArray(item.image) ? item.image[0] : item.image}
                        className="w-14 h-14 object-cover rounded-lg shadow-sm"
                        alt={item.name}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">{item.name}</p>
                        <p className="text-xs text-emerald-600 font-bold">
                          {Number(item.price).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleWishlist(item)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        title="Quitar de deseados"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 px-4 border-2 border-dashed border-slate-100 rounded-xl">
                    <p className="text-sm text-slate-400 italic">No tienes productos favoritos aún.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all active:scale-[0.98]"
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