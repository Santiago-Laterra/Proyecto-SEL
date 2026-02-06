import { X, LogOut, User as UserIcon, Mail } from 'lucide-react';

const UserDrawer = ({ isOpen, onClose, user }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/'; // Recarga y limpia todo el estado
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 overflow-hidden">
      {/* Fondo oscuro/Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header del Drawer */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-serif text-slate-800">Mi Cuenta</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 p-8">
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

          <div className="space-y-4">
            {/* Si querés agregar links extra a futuro, van acá */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Estado de cuenta</p>
              <p className="text-sm font-medium text-slate-700">Cliente Activo</p>
            </div>
          </div>
        </div>

        {/* Footer del Drawer con botón de logout */}
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