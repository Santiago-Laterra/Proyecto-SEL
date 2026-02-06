import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import api from '../services/api';

const CartDrawer = ({ isOpen, onClose }) => {

  const { cart, removeFromCart, cartTotal, shippingCost } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    try {
      // 1. Extraer el ID correctamente del objeto 'user' que vimos en tu LocalStorage
      const userStorage = localStorage.getItem('user');
      const userData = userStorage ? JSON.parse(userStorage) : null;
      const currentUserId = userData?.id; // Esto saca el "698634..." que vimos en la foto

      if (!currentUserId) {
        alert("Debes estar logueado para comprar");
        setLoading(false);
        return;
      }

      const itemsFormateados = cart.map(product => ({
        id: product._id,
        title: product.name,
        unit_price: Math.round(Number(product.price)),
        quantity: 1,
        currency_id: "ARS"
      }));

      const payload = {
        items: itemsFormateados, // <--- CAMBIÁ 'cart' POR 'itemsFormateados'
        userId: currentUserId,   // Usamos la variable que sacaste del storage
        shippingCost: shippingCost,
        shippingAddress: {
          street: "Calle Falsa",
          number: "123",
          city: "Lomas de Zamora",
          zipCode: "1832"
        }
      };

      // Aquí es donde el 'await' necesita que la función de arriba sea 'async'
      const response = await api.post('/payments/create-preference', payload);

      if (response.data.init_point) {
        window.location.href = response.data.init_point;
      }
    } catch (error) {
      console.error("Error completo:", error.response?.data);
      alert("Error: " + (error.response?.data?.error || "Falla en el servidor"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-60 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />

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

        {/* BLOQUE DE PAGO UNIFICADO AL FINAL */}
        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-100 space-y-3">

            <div className="flex justify-between text-slate-500 text-sm">
              <span>Subtotal</span>
              <span>${cartTotal.toLocaleString('es-AR')}</span>
            </div>

            <div className="flex justify-between text-slate-500 text-sm">
              <span>Envío</span>
              <span>
                {shippingCost > 0
                  ? `$ ${shippingCost.toLocaleString('es-AR')}`
                  : "A calcular"}
              </span>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100 mb-6">
              <span className="text-lg font-serif text-slate-900">Total</span>
              <span className="text-xl font-bold italic text-slate-900">
                {((cartTotal + shippingCost)).toLocaleString('es-AR', {
                  style: 'currency',
                  currency: 'ARS'
                })}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-[#007f5f] text-white py-4 rounded-md font-bold uppercase tracking-widest hover:bg-[#00664d] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Pago"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;