import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import api from '../services/api';

const CartDrawer = ({ isOpen, onClose }) => {

  // --- ESTADOS ---
  // En CartDrawer.jsx
  const { cart, removeFromCart, cartTotal, shippingCost, zipCode } = useCart();
  const [loading, setLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    number: '',
    city: ''
  });

  // --- FUNCIONES ---

  // 1. Paso previo: Valida carrito/sesión y abre el modal
  const preCheckout = () => {
    if (cart.length === 0) return;

    const userStorage = localStorage.getItem('user');
    if (!userStorage) {
      alert("Debes estar logueado para comprar");
      return;
    }

    setIsAddressModalOpen(true);
  };

  // 2. Paso final: Envía la dirección y crea la preferencia de pago
  const handleConfirmPurchase = async (e) => {
    e.preventDefault();

    // VALIDACIÓN EXTRA
    if (!zipCode) {
      alert("Por favor, vuelve a calcular el costo de envío con tu código postal antes de pagar.");
      setIsAddressModalOpen(false); // Cerramos el modal para que lo vea
      return;
    }

    setLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem('user'));

      const payload = {
        items: cart.map(product => ({
          id: product._id,
          title: product.name,
          unit_price: Math.round(Number(product.price)),
          quantity: 1,
          currency_id: "ARS"
        })),
        userId: userData.id,
        shippingCost: shippingCost, // El valor que ya calculaste antes
        shippingAddress: {
          ...address, // street, number, city
          zipCode: zipCode // <--- Usás el que ya tenías en el contexto del carrito
        }
      };

      const response = await api.post('/payments/create-preference', payload);
      if (response.data.init_point) window.location.href = response.data.init_point;

    } catch (error) {
      console.error("Error:", error);
      alert("Error al procesar la compra");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {/* OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/40 z-60 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />

      {/* PANEL DEL CARRITO */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white z-70 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">Carrito de la compra</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* LISTA DE PRODUCTOS */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 mt-10 text-sm">Aún no se han añadido artículos al carrito</p>
          ) : (
            cart.map((item) => ( // <--- Aquí definiste 'item'
              <div key={item._id} className="flex gap-4 border-b border-gray-50 pb-4">
                <img
                  // CAMBIO: Usar 'item' en lugar de 'product'
                  src={Array.isArray(item.image) ? item.image[0] : (item.image || "/placeholder.png")}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
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

        {/* BLOQUE DE PAGO (Solo si hay items) */}
        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-100 space-y-3">
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Subtotal</span>
              <span>${cartTotal.toLocaleString('es-AR')}</span>
            </div>

            <div className="flex justify-between text-slate-500 text-sm">
              <span>Envío</span>
              <span>{shippingCost > 0 ? `$ ${shippingCost.toLocaleString('es-AR')}` : "A calcular"}</span>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100 mb-6">
              <span className="text-lg font-serif text-slate-900">Total</span>
              <span className="text-xl font-bold italic text-slate-900">
                {(cartTotal + shippingCost).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
              </span>
            </div>

            <button
              onClick={preCheckout} // <-- PRIMER PASO: Abre el modal
              disabled={loading}
              className="w-full bg-[#007f5f] text-white py-4 rounded-md font-bold uppercase tracking-widest hover:bg-[#00664d] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Ir al Pago"}
            </button>
          </div>
        )}

        {/* MODAL DE DIRECCIÓN (POP-UP) */}
        {isAddressModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-100 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-serif mb-6 text-slate-800">Datos de Envío</h2>

              <form onSubmit={handleConfirmPurchase} className="space-y-4">
                <input
                  required
                  type="text"
                  placeholder="Calle"
                  className="w-full border-b-2 py-2 outline-none focus:border-[#007f5f]"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                />
                <div className="flex gap-4">
                  <input
                    required
                    type="text"
                    placeholder="Número"
                    className="w-1/3 border-b-2 py-2 outline-none focus:border-[#007f5f]"
                    value={address.number}
                    onChange={(e) => setAddress({ ...address, number: e.target.value })}
                  />
                  <input
                    required
                    type="text"
                    placeholder="Ciudad"
                    className="flex-1 border-b-2 py-2 outline-none focus:border-[#007f5f]"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
                    className="flex-1 py-3 text-slate-500 font-semibold hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit" // <-- SEGUNDO PASO: Dispara handleConfirmPurchase
                    disabled={loading}
                    className="flex-1 py-3 bg-[#007f5f] text-white font-bold rounded-xl shadow-lg hover:bg-[#00664d] transition-all disabled:opacity-50"
                  >
                    {loading ? "Procesando..." : "Confirmar y Pagar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
export default CartDrawer;