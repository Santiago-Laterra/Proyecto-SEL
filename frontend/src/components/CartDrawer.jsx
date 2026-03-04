import { X, Minus, Plus } from 'lucide-react'; // Agregamos Minus y Plus
import { useCart } from '../context/CartContext';
import { useState } from 'react';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal, shippingCost, openCheckout } = useCart();
  const [loading] = useState(false);

  const preCheckout = () => {
    if (cart.length === 0) return;
    onClose();
    setTimeout(() => { openCheckout(); }, 200);
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 z-100 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={onClose} />
      <div className={`fixed right-0 top-0 h-dvh w-full max-w-md bg-white z-110 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-serif text-slate-800">Tu Carrito</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-slate-400">El carrito está vacío</div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item._id} className="flex gap-4 group">
                  <img src={Array.isArray(item.image) ? item.image[0] : item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-slate-800 uppercase">{item.name}</h3>
                    <p className="text-slate-900 font-bold">${Number(item.price).toLocaleString('es-AR')}</p>

                    {/* BOTONES DE CANTIDAD - DISEÑO RESPETUOSO */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg">
                        <button onClick={() => updateQuantity(item._id, -1)} className="p-1 hover:bg-slate-50 text-slate-500 border-r border-slate-200"><Minus size={12} /></button>
                        <span className="px-3 text-xs font-bold text-slate-700">{item.quantity || 1}</span>
                        <button onClick={() => updateQuantity(item._id, 1)} className="p-1 hover:bg-slate-50 text-slate-500 border-l border-slate-200"><Plus size={12} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item._id)} className="text-[10px] text-red-400 uppercase font-bold">Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 md:p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] z-20 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex justify-between items-center mb-4">
            <div><p className="text-[10px] text-slate-400 uppercase font-bold">Total a pagar</p>
              <p className="text-xl font-bold text-slate-900">${(cartTotal + (shippingCost || 0)).toLocaleString('es-AR')}</p>
            </div>
            <div className="text-right"><p className="text-[10px] text-slate-400 uppercase font-bold">Envío</p>
              <p className="text-xs font-semibold text-slate-600">{shippingCost > 0 ? `$${shippingCost}` : "Gratis"}</p>
            </div>
          </div>
          <button onClick={preCheckout} disabled={loading || cart.length === 0}
            className="w-full bg-[#007f5f] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#00664d] transition-all disabled:opacity-50">
            CONFIRMAR ENVÍO
          </button>
        </div>
      </div>
    </>
  );
};
export default CartDrawer;