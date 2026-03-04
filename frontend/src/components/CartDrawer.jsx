import { X, Minus, Plus, Trash2 } from 'lucide-react'; // ESTO FALTABA
import { useCart } from '../context/CartContext';
import { useState } from 'react';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal, shippingCost, openCheckout } = useCart();
  const [loading] = useState(false);

  const preCheckout = () => {
    if (cart.length === 0) return;
    onClose();
    setTimeout(() => {
      openCheckout();
    }, 200);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-100 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-dvh w-full max-w-md bg-white z-110 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-serif text-slate-800">Tu Carrito</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Lista de Productos */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 font-medium">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item._id} className="flex gap-4 group animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-bold text-slate-800 leading-tight pr-4 uppercase tracking-tight">{item.name}</h3>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-xs font-black text-emerald-700 mt-1">
                        ${Number(item.price).toLocaleString('es-AR')}
                      </p>
                    </div>

                    {/* BOTONES DE CANTIDAD - VISIBLES Y OPERATIVOS */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 shadow-sm">
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          className="p-2 hover:bg-white text-slate-600 transition-all border-r border-slate-200"
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>

                        <span className="px-4 text-sm font-black text-slate-800 min-w-10 text-center">
                          {item.quantity || 1}
                        </span>

                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          className="p-2 hover:bg-white text-slate-600 transition-all border-l border-slate-200"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>

                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Sub: ${(item.price * (item.quantity || 1)).toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-100 p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Total a pagar</p>
              <p className="text-2xl font-black text-slate-900">
                ${(cartTotal + (shippingCost || 0)).toLocaleString('es-AR')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Envío</p>
              <p className="text-xs font-black text-emerald-600 uppercase">
                {shippingCost > 0 ? `$${shippingCost.toLocaleString('es-AR')}` : "Gratis"}
              </p>
            </div>
          </div>

          <button
            onClick={preCheckout}
            disabled={loading || cart.length === 0}
            className="w-full bg-[#007f5f] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-[#00664d] transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Iniciar Compra"}
          </button>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;