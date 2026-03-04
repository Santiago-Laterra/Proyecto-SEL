import { X, Building2, Home, Edit3, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import api from '../services/api';

const CheckoutModal = () => {
  const { isCheckoutOpen, closeCheckout, cart, shippingCost, zipCod, calculateShippingAction, cartTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [isStepConfirmed, setIsStepConfirmed] = useState(false);
  const [address, setAddress] = useState({
    street: '', number: '', city: '', type: 'casa', floor: '', apartment: '', phoneNumber: ''
  });

  const TODAS_LAS_LOCALIDADES = [
    { cp: "1173", nombre: "Almagro" }, { cp: "1428", nombre: "Belgrano" },
    { cp: "1428", nombre: "Colegiales" }, { cp: "1218", nombre: "Boedo" },
    { cp: "1405", nombre: "Caballito" }, { cp: "1133", nombre: "Constitución" },
    { cp: "1133", nombre: "San Telmo" }, { cp: "1133", nombre: "Monserrat" },
    { cp: "1406", nombre: "Flores" }, { cp: "1406", nombre: "Parque Chacabuco" },
    { cp: "1407", nombre: "Floresta" }, { cp: "1407", nombre: "Parque Avellaneda" },
    { cp: "1408", nombre: "Liniers" }, { cp: "1437", nombre: "Nueva Pompeya" },
    { cp: "1437", nombre: "Parque Patricios" }, { cp: "1429", nombre: "Núñez" },
    { cp: "1425", nombre: "Palermo" }, { cp: "1430", nombre: "Saavedra" },
    { cp: "1430", nombre: "Villa Pueyrredón" }, { cp: "1224", nombre: "San Cristóbal" },
    { cp: "1001", nombre: "San Nicolás" }, { cp: "1414", nombre: "Villa Crespo" },
    { cp: "1417", nombre: "Villa del Parque" }, { cp: "1417", nombre: "Villa General Mitre" },
    { cp: "1419", nombre: "Villa Devoto" }, { cp: "1439", nombre: "Villa Lugano" },
    { cp: "1431", nombre: "Villa Urquiza" }, { cp: "1824", nombre: "Lanús" },
    { cp: "1824", nombre: "Gerli" }, { cp: "1826", nombre: "Remedios de Escalada" },
    { cp: "1828", nombre: "Banfield" }, { cp: "1832", nombre: "Lomas de Zamora" },
    { cp: "1834", nombre: "Temperley" }, { cp: "1834", nombre: "Turdera" },
    { cp: "1836", nombre: "Llavallol" }, { cp: "1842", nombre: "Monte Grande" },
    { cp: "1842", nombre: "Luis Guillón" }, { cp: "1870", nombre: "Avellaneda Centro" },
    { cp: "1846", nombre: "Adrogué" }
  ];

  useEffect(() => {
    if (isCheckoutOpen && zipCod) {
      const locEncontrada = TODAS_LAS_LOCALIDADES.find(l => l.cp === zipCod);
      if (locEncontrada) setAddress(prev => ({ ...prev, city: locEncontrada.nombre }));
    }
  }, [isCheckoutOpen, zipCod]);

  if (!isCheckoutOpen) return null;

  const handleCityChange = (e) => {
    const selectedName = e.target.value;
    const data = TODAS_LAS_LOCALIDADES.find(l => l.nombre === selectedName);
    if (data) {
      setAddress({ ...address, city: data.nombre });
      calculateShippingAction(data.cp, data.nombre);
    }
  };

  const handleFinalPayment = async () => {
    setLoading(true);
    try {
      const userRaw = localStorage.getItem('user');
      if (!userRaw) return alert("Inicia sesión para continuar");
      const userData = JSON.parse(userRaw);

      const response = await api.post('/payments/create-preference', {
        items: cart.map(item => ({ id: item._id, title: item.name, unit_price: Number(item.price), quantity: 1 })),
        shippingCost: Number(shippingCost),
        userId: userData.id || userData._id,
        phoneNumber: address.phoneNumber,
        shippingAddress: { ...address, zipCode: zipCod }
      });
      if (response.data.init_point) window.location.href = response.data.init_point;
    } catch (error) {
      alert("Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-999 flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] p-8 md:p-12 max-w-lg w-full shadow-2xl relative overflow-y-auto max-h-[90vh]">
        <button onClick={() => { closeCheckout(); setIsStepConfirmed(false); }} className="absolute right-6 top-6 text-slate-300 hover:text-slate-800">
          <X size={28} />
        </button>

        {!isStepConfirmed ? (
          <form onSubmit={(e) => { e.preventDefault(); setIsStepConfirmed(true); }} className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif text-slate-800 mb-2">Detalles de Entrega</h2>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">PASO 1: DATOS DE ENVÍO</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Localidad</label>
                <select required className="w-full border-b border-slate-200 py-2 outline-none focus:border-[#007f5f] text-sm bg-transparent"
                  value={address.city} onChange={handleCityChange}>
                  <option value="">Seleccionar...</option>
                  {TODAS_LAS_LOCALIDADES.map((loc, idx) => (
                    <option key={`${loc.cp}-${idx}`} value={loc.nombre}>{loc.nombre} ({loc.cp})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Teléfono</label>
                <input required type="tel" className="w-full border-b border-slate-200 py-2 outline-none focus:border-[#007f5f] text-sm"
                  placeholder="11 2233 4455" value={address.phoneNumber} onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value })} />
              </div>
            </div>

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
                <input required placeholder="Piso" type="text" className="w-full border-b border-slate-200 py-2 text-sm text-center"
                  value={address.floor} onChange={(e) => setAddress({ ...address, floor: e.target.value })} />
                <input required placeholder="Depto" type="text" className="w-full border-b border-slate-200 py-2 text-sm text-center"
                  value={address.apartment} onChange={(e) => setAddress({ ...address, apartment: e.target.value })} />
              </div>
            )}

            <button type="submit" className="w-full py-5 bg-[#007f5f] text-white font-black rounded-2xl uppercase text-xs tracking-widest active:scale-95 transition-all">
              Finalizar
            </button>
          </form>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif text-slate-800 mb-2">Confirmar Pago</h2>
              <p className="text-[10px] text-[#007f5f] uppercase font-bold tracking-widest">PASO 2: RESUMEN FINAL</p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Dirección:</span>
                <span className="font-bold text-slate-700">{address.street} {address.number}, {address.city}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal:</span>
                <span className="font-bold text-slate-700">${cartTotal.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Envío:</span>
                <span className="font-bold text-[#007f5f]">{shippingCost > 0 ? `$${shippingCost.toLocaleString('es-AR')}` : "Gratis"}</span>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-4 flex justify-between items-center">
                <span className="text-slate-800 font-bold uppercase text-xs">Total Final:</span>
                <span className="text-2xl font-black text-slate-900">${(cartTotal + shippingCost).toLocaleString('es-AR')}</span>
              </div>
            </div>

            <div className="space-y-4">
              <button onClick={handleFinalPayment} disabled={loading} className="w-full py-5 bg-[#007f5f] text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 uppercase text-xs tracking-widest">
                <CreditCard size={18} /> {loading ? "PROCESANDO..." : "Pagar"}
              </button>
              <button onClick={() => setIsStepConfirmed(false)} className="w-full py-4 bg-white border-2 border-slate-100 text-slate-400 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest">
                <Edit3 size={16} /> Modificar Envío
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;