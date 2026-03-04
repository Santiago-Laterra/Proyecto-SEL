import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';


const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, cartTotal, shippingCost, zipCod } = useCart();
  const [loading, setLoading] = useState(false);
  const { openCheckout } = useCart();

  const preCheckout = () => {
    if (cart.length === 0) return;
    onClose(); // Cerramos el Drawer

    // Tiempo suficiente para que la animación de cierre no choque con la de apertura
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

      {/* Contenedor Principal: Usamos h-[100dvh] para evitar errores de barras de navegación en móvil */}
      <div className={`fixed right-0 top-0 h-dvh w-full max-w-md bg-white z-110 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* HEADER: Se mantiene igual */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 shrink-0">
          <h2 className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-800">Carrito de la compra</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black p-1 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* CONTENIDO: Agregamos pb-44 para que el scroll termine antes de chocar con el botón flotante */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-44 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-center text-gray-400 text-xs italic uppercase">Vacío</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 md:gap-6">
              {cart.map((item) => (
                <div key={item._id} className="flex gap-3 md:gap-4 border-b border-gray-50 pb-3 md:pb-4 shrink-0">
                  <img src={Array.isArray(item.image) ? item.image[0] : item.image} className="w-14 h-14 md:w-20 md:h-20 object-cover rounded-lg" alt="" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs md:text-sm font-medium text-slate-800 truncate">{item.name}</h3>
                    <p className="text-xs md:text-sm font-bold text-emerald-700 mt-1">${Number(item.price).toLocaleString('es-AR')}</p>
                    <button onClick={() => removeFromCart(item._id)} className="text-[10px] text-red-400 underline mt-1">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER FLOTANTE: Siempre al final, con fondo blanco sólido y sombra para destacar */}
        <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 md:p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] z-20 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Total a pagar</p>
              <p className="text-xl font-bold text-slate-900">
                ${(cartTotal + (shippingCost || 0)).toLocaleString('es-AR')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Envío</p>
              <p className="text-xs font-semibold text-slate-600">{shippingCost > 0 ? `$${shippingCost}` : "Gratis"}</p>
            </div>
          </div>

          <button
            onClick={preCheckout}
            disabled={loading || cart.length === 0}
            className="w-full bg-[#007f5f] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-lg"
          >
            {loading ? "PROCESANDO..." : "IR AL PAGO"}
          </button>
        </div>
      </div>
    </>
  );
}

export default CartDrawer;