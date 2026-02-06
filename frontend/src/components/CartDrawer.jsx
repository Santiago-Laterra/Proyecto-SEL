// src/components/CartDrawer.jsx
import { X, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, cartTotal } = useCart();

  return (
    <>
      {/* Fondo oscuro cuando el carrito está abierto */}
      <div
        className={`fixed inset-0 bg-black/40 z-60 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />

      {/* Panel Lateral */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-100 bg-white z-70 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Cabecera */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">Carrito de la compra</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Lista de Productos */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-h-[calc(100vh-250px)]">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">Aún no se han añadido artículos al carrito</p>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="flex gap-4 border-b border-gray-50 pb-4">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-slate-800 leading-snug">{item.name}</h3>
                  <p className="text-sm font-bold mt-1">
                    {Number(item.price).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                  </p>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 mt-2 underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pie del Carrito (Subtotal y Botón) */}
        {cart.length > 0 && (
          <div className="absolute bottom-0 left-0 w-full p-6 bg-white border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-600">Total</span>
              <span className="text-xl font-bold italic">
                {cartTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
              </span>
            </div>
            <button className="w-full bg-[#007f5f] text-white py-4 rounded-md font-bold uppercase tracking-widest hover:bg-[#00664d] transition-all active:scale-[0.98]">
              Pago
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;