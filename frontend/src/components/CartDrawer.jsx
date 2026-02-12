import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import api from '../services/api';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, cartTotal, shippingCost, zipCod } = useCart();
  const [loading, setLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    number: '',
    city: '',
    type: 'casa',
    floor: '',
    apartment: ''
  });

  const CP_A_OPCIONES = {
    "1173": ["Almagro"], "1428": ["Belgrano", "Colegiales"], "1218": ["Boedo"],
    "1405": ["Caballito"], "1133": ["Constitución", "San Telmo", "Monserrat"],
    "1406": ["Flores", "Parque Chacabuco"], "1407": ["Floresta", "Parque Avellaneda"],
    "1408": ["Liniers"], "1437": ["Nueva Pompeya", "Parque Patricios"],
    "1429": ["Núñez"], "1425": ["Palermo"], "1430": ["Saavedra", "Villa Pueyrredón"],
    "1224": ["San Cristóbal"], "1001": ["San Nicolás"], "1414": ["Villa Crespo"],
    "1417": ["Villa del Parque", "Villa General Mitre"], "1419": ["Villa Devoto"],
    "1439": ["Villa Lugano"], "1431": ["Villa Urquiza"], "1824": ["Lanús", "Gerli"],
    "1826": ["Remedios de Escalada"], "1828": ["Banfield"], "1832": ["Lomas de Zamora", "Banfield"],
    "1834": ["Temperley", "Turdera"], "1836": ["Llavallol"], "1842": ["Monte Grande", "Luis Guillón"],
    "1870": ["Avellaneda Centro"], "1846": ["Adrogué"]
  };

  useEffect(() => {
    if (zipCod && CP_A_OPCIONES[zipCod]) {
      setAddress(prev => ({ ...prev, city: CP_A_OPCIONES[zipCod][0] }));
    }
  }, [zipCod]);

  const preCheckout = () => {
    if (cart.length === 0) return;
    setIsAddressModalOpen(true);
  };

  const handleConfirmPurchase = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userRaw = localStorage.getItem('user');
      const userData = JSON.parse(userRaw);
      const payload = {
        items: cart.map(item => ({
          id: item._id,
          title: item.name,
          unit_price: Number(item.price),
          quantity: 1,
          currency_id: "ARS"
        })),
        shippingCost: Number(shippingCost),
        userId: userData.id || userData._id,
        shippingAddress: {
          ...address,
          zipCode: zipCod,
          fullAddress: `${address.street} ${address.number}, ${address.city}`
        }
      };
      const response = await api.post('/payments/create-preference', payload);
      if (response.data.init_point) {
        window.location.href = response.data.init_point;
      }
    } catch (error) {
      console.error("Error detalle:", error);
      alert("Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay: z-index alto para cubrir todo */}
      <div
        className={`fixed inset-0 bg-black/40 z-100 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />

      {/* Panel Lateral - FIX DEFINITIVO */}
      <div className={`fixed right-0 top-0 h-dvh w-full max-w-md bg-white z-110 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="grid grid-rows-[auto_1fr_auto] h-full max-h-full w-full bg-white overflow-hidden">
          {/* Contenedor Grid forzado al 100% del alto del panel */}
          <div className="grid grid-rows-[auto_1fr_auto] h-full w-full bg-white">

            {/* 1. HEADER (Fijo) */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">Carrito de la compra</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-black p-2 transition-colors">
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* 2. CONTENIDO (Scrollable y Flexible) */}
            <div className="flex-1 overflow-y-auto touch-pan-y p-6 custom-scrollbar min-h-0">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-center text-gray-400 text-sm italic">Aún no se han añadido artículos al carrito</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {cart.map((item) => (
                    <div key={item._id} className="flex gap-4 border-b border-gray-50 pb-4 shrink-0">
                      <img
                        src={Array.isArray(item.image) ? item.image[0] : (item.image || "/placeholder.png")}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-slate-800 leading-snug truncate">{item.name}</h3>
                        <p className="text-sm font-bold mt-1 text-emerald-700">
                          {Number(item.price).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                        </p>
                        <button onClick={() => removeFromCart(item._id)} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 mt-2 underline transition-colors">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. FOOTER (Fijo al fondo) */}
            <div className="bg-slate-50 border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
              {cart.length > 0 ? (
                <div className="p-6 space-y-3 pb-safe">
                  <div className="flex justify-between text-slate-500 text-sm">
                    <span>Subtotal</span>
                    <span className="font-semibold">${cartTotal.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-sm">
                    <span>Envío ({address.city || "No seleccionado"})</span>
                    <span className="font-semibold">
                      {shippingCost > 0 ? `$ ${shippingCost.toLocaleString('es-AR')}` : shippingCost === 0 ? "Gratis" : "A calcular"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 mb-4">
                    <span className="text-lg font-serif text-slate-900">Total</span>
                    <span className="text-xl font-bold text-slate-900">
                      {(cartTotal + (shippingCost || 0)).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                    </span>
                  </div>
                  <button
                    onClick={preCheckout}
                    disabled={loading}
                    className="w-full bg-[#007f5f] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-[#00664d] transition-all disabled:opacity-50 shadow-md active:scale-95"
                  >
                    {loading ? "Cargando..." : "Ir al Pago"}
                  </button>
                </div>
              ) : (
                // Espaciador para cuando no hay items y mantener la estética
                <div className="h-10 bg-white" />
              )}
            </div>
          </div>

          {/* Modal de Dirección */}
          {isAddressModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-200 flex items-center justify-center p-4">
              <div className="bg-white rounded-4xl p-6 md:p-10 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                <h2 className="text-2xl font-serif text-slate-800 text-center mb-6">Detalles de Entrega</h2>
                <form onSubmit={handleConfirmPurchase} className="space-y-6">
                  {/* ... (resto del formulario igual) ... */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Calle</label>
                      <input
                        required
                        type="text"
                        className="w-full border-b border-slate-200 py-2 outline-none focus:border-[#007f5f]"
                        placeholder="Ej: Av. Meeks"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Nro</label>
                      <input
                        required
                        type="number"
                        className="w-full border-b border-slate-200 py-2 outline-none focus:border-[#007f5f] text-center"
                        value={address.number}
                        onChange={(e) => setAddress({ ...address, number: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* (Incluye aquí el resto de tus campos de vivienda y localidad) */}
                  <div className="flex flex-col gap-3 mt-8">
                    <button type="submit" disabled={loading} className="w-full py-4 bg-[#007f5f] text-white font-bold rounded-xl shadow-lg hover:bg-[#00664d] transition-all">
                      {loading ? "PROCESANDO..." : "CONFIRMAR COMPRA"}
                    </button>
                    <button type="button" onClick={() => setIsAddressModalOpen(false)} className="w-full py-2 text-slate-400 text-xs font-bold hover:text-slate-600 uppercase">
                      Volver al carrito
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CartDrawer;