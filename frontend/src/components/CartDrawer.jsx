import { X, Building2, Home } from 'lucide-react';
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
      const extraInfo = address.type === 'depto' ? ` - Piso: ${address.floor} Depto: ${address.apartment}` : '';
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
          fullAddress: `${address.street} ${address.number}${extraInfo}, ${address.city}`
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

        {/* Modal de Dirección: Se mantiene exactamente igual a tu versión */}
        {isAddressModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-200 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 md:p-10 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-serif text-slate-800 text-center mb-6">Detalles de Entrega</h2>
              <form onSubmit={handleConfirmPurchase} className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Localidad (CP: {zipCod})</label>
                  <select className="w-full border-b border-slate-200 py-2 outline-none focus:border-[#007f5f] bg-transparent text-sm"
                    value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })}>
                    {CP_A_OPCIONES[zipCod]?.map(opc => (
                      <option key={opc} value={opc}>{opc}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Calle</label>
                    <input required type="text" className="w-full border-b border-slate-200 py-2 outline-none focus:border-[#007f5f] text-sm"
                      value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Nro</label>
                    <input required type="number" className="w-full border-b border-slate-200 py-2 outline-none focus:border-[#007f5f] text-center text-sm"
                      value={address.number} onChange={(e) => setAddress({ ...address, number: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setAddress({ ...address, type: 'casa' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${address.type === 'casa' ? 'border-[#007f5f] bg-emerald-50 text-[#007f5f]' : 'border-slate-100 text-slate-400'}`}>
                    <Home size={18} /> <span className="text-[10px] font-bold uppercase">Casa</span>
                  </button>
                  <button type="button" onClick={() => setAddress({ ...address, type: 'depto' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${address.type === 'depto' ? 'border-[#007f5f] bg-emerald-50 text-[#007f5f]' : 'border-slate-100 text-slate-400'}`}>
                    <Building2 size={18} /> <span className="text-[10px] font-bold uppercase">Depto</span>
                  </button>
                </div>
                {address.type === 'depto' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Piso</label>
                      <input required type="text" className="w-full border-b border-slate-200 py-2 outline-none focus:border-[#007f5f] text-center text-sm"
                        value={address.floor} onChange={(e) => setAddress({ ...address, floor: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Depto</label>
                      <input required type="text" className="w-full border-b border-slate-200 py-2 outline-none focus:border-[#007f5f] text-center text-sm"
                        value={address.apartment} onChange={(e) => setAddress({ ...address, apartment: e.target.value })} />
                    </div>
                  </div>
                )}
                <div className="pt-4">
                  <button type="submit" disabled={loading} className="w-full py-4 bg-[#007f5f] text-white font-bold rounded-xl shadow-lg uppercase text-xs">
                    Confirmar Compra
                  </button>
                  <button type="button" onClick={() => setIsAddressModalOpen(false)} className="w-full py-2 text-slate-400 text-[10px] font-bold uppercase mt-2">
                    Cerrar
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