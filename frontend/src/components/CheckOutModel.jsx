import { X, Building2, Home } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import api from '../services/api';

const CheckoutModal = () => {
  const { isCheckoutOpen, closeCheckout, cart, shippingCost, zipCod } = useCart();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: '', number: '', city: '', type: 'casa', floor: '', apartment: '', phoneNumber: ''
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

  // Sincronizar ciudad cuando se abre el modal o cambia el CP
  useEffect(() => {
    if (isCheckoutOpen && zipCod && CP_A_OPCIONES[zipCod]) {
      setAddress(prev => ({ ...prev, city: CP_A_OPCIONES[zipCod][0] }));
    }
  }, [isCheckoutOpen, zipCod]);

  console.log(isCheckoutOpen)

  if (!isCheckoutOpen) return null;

  const handleConfirmPurchase = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userRaw = localStorage.getItem('user');
      if (!userRaw) {
        alert("Por favor, inicia sesión para continuar");
        return;
      }
      const userData = JSON.parse(userRaw);
      const extraInfo = address.type === 'depto' ? ` - P: ${address.floor} D: ${address.apartment}` : '';

      const payload = {
        items: cart.map(item => ({
          id: item._id, // Mercado Pago necesita ID
          title: item.name,
          unit_price: Number(item.price),
          quantity: 1
        })),
        shippingCost: Number(shippingCost),
        userId: userData.id || userData._id,
        phoneNumber: address.phoneNumber, // <--- ESTO DEBE SER STRING
        shippingAddress: {
          street: address.street,
          number: address.number,
          city: address.city,
          zipCode: zipCod,
          type: address.type,
          floor: address.floor,
          apartment: address.apartment
        }
      };



      const response = await api.post('/payments/create-preference', payload);
      if (response.data.init_point) window.location.href = response.data.init_point;
      // CAMBIO EN EL CATCH PARA DEBUGGEAR:
    } catch (error) {
      console.error("DETALLE DEL ERROR:", error.response?.data || error.message);
      alert(`Error: ${error.response?.data?.message || "Revisá los datos del formulario"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-999 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] p-8 md:p-12 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
        <button onClick={closeCheckout} className="absolute right-6 top-6 text-slate-300 hover:text-slate-800 transition-colors">
          <X size={28} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-serif text-slate-800 mb-2">Detalles de Entrega</h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Completá los datos para el envío</p>
        </div>

        <form onSubmit={handleConfirmPurchase} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Localidad (CP: {zipCod})</label>
              <select
                required
                className="w-full border-b border-slate-200 py-2 outline-none focus:border-[#007f5f] bg-transparent text-sm"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              >
                {CP_A_OPCIONES[zipCod] ? (
                  CP_A_OPCIONES[zipCod].map(opc => <option key={opc} value={opc}>{opc}</option>)
                ) : (
                  <option value="">Seleccionar...</option>
                )}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Teléfono</label>
              <input required type="tel" className="w-full border-b border-slate-200 py-2 outline-none focus:border-[#007f5f] text-sm"
                placeholder="11 2233 4455" value={address.phoneNumber} onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value })} />
            </div>
          </div>

          {/* Resto del formulario igual... */}
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Calle</label>
              <input required type="text" className="w-full border-b border-slate-200 py-2 outline-none focus:border-[#007f5f] text-sm"
                value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
            </div>
            <div className="col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Nro</label>
              <input required type="number" className="w-full border-b border-slate-200 py-2 outline-none focus:border-[#007f5f] text-sm"
                value={address.number} onChange={(e) => setAddress({ ...address, number: e.target.value })} />
            </div>
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => setAddress({ ...address, type: 'casa' })}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${address.type === 'casa' ? 'border-[#007f5f] bg-emerald-50 text-[#007f5f]' : 'border-slate-100 text-slate-400'}`}>
              <Home size={18} /> <span className="text-[10px] font-bold uppercase">Casa</span>
            </button>
            <button type="button" onClick={() => setAddress({ ...address, type: 'depto' })}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${address.type === 'depto' ? 'border-[#007f5f] bg-emerald-50 text-[#007f5f]' : 'border-slate-100 text-slate-400'}`}>
              <Building2 size={18} /> <span className="text-[10px] font-bold uppercase">Depto</span>
            </button>
          </div>

          {address.type === 'depto' && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
              <input required placeholder="Piso" type="text" className="w-full border-b border-slate-200 py-2 outline-none focus:border-[#007f5f] text-sm text-center"
                value={address.floor} onChange={(e) => setAddress({ ...address, floor: e.target.value })} />
              <input required placeholder="Depto" type="text" className="w-full border-b border-slate-200 py-2 outline-none focus:border-[#007f5f] text-sm text-center"
                value={address.apartment} onChange={(e) => setAddress({ ...address, apartment: e.target.value })} />
            </div>
          )}

          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full py-5 bg-[#007f5f] text-white font-black rounded-2xl shadow-xl uppercase text-xs tracking-widest active:scale-95 transition-all">
              {loading ? "PROCESANDO..." : "FINALIZAR Y PAGAR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;