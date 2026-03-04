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
    { cp: "1224", nombre: "San Cristóbal" }, { cp: "1224", nombre: "Balvanera" },
    { cp: "1001", nombre: "San Nicolás" }, { cp: "1001", nombre: "Retiro" },
    { cp: "1001", nombre: "Recoleta" }, { cp: "1001", nombre: "Puerto Madero" },
    { cp: "1414", nombre: "Villa Crespo" }, { cp: "1416", nombre: "Villa General Mitre" },
    { cp: "1417", nombre: "Villa del Parque" }, { cp: "1419", nombre: "Villa Devoto" },
    { cp: "1439", nombre: "Villa Lugano" }, { cp: "1431", nombre: "Villa Urquiza" },
    { cp: "1431", nombre: "Villa Pueyrredón" }, { cp: "1824", nombre: "Lanús" },
    { cp: "1824", nombre: "Gerli" }, { cp: "1826", nombre: "Remedios de Escalada" },
    { cp: "1828", nombre: "Banfield" }, { cp: "1832", nombre: "Lomas de Zamora" },
    { cp: "1834", nombre: "Temperley" }, { cp: "1834", nombre: "Turdera" },
    { cp: "1836", nombre: "Llavallol" }, { cp: "1842", nombre: "Monte Grande" },
    { cp: "1842", nombre: "Luis Guillón" }, { cp: "1870", nombre: "Avellaneda Centro" },
    { cp: "1846", nombre: "Adrogué" }
  ];

  useEffect(() => {
    if (zipCod) {
      const found = TODAS_LAS_LOCALIDADES.find(l => l.cp === zipCod);
      if (found) {
        setAddress(prev => ({ ...prev, city: found.nombre }));
        calculateShippingAction(zipCod, found.nombre);
      }
    }
  }, [zipCod, isCheckoutOpen]);

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setIsStepConfirmed(true);
  };

  const handleFinalPayment = async () => {
    setLoading(true);
    try {
      // Enviamos el carrito con cantidades incluidas al backend
      const response = await api.post('/payments/create-preference', {
        items: cart.map(item => ({
          title: item.name,
          unit_price: Number(item.price),
          quantity: item.quantity || 1, // Aquí enviamos la cantidad real
          currency_id: 'ARS'
        })),
        shipment: {
          cost: shippingCost,
          address: `${address.street} ${address.number}, ${address.city} ${address.type === 'depto' ? `(Piso ${address.floor} Dpto ${address.apartment})` : ''}`,
          phone: address.phoneNumber
        }
      });
      if (response.data.init_point) {
        window.location.href = response.data.init_point;
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      alert('Hubo un error al procesar el pago.');
    } finally {
      setLoading(false);
    }
  };

  if (!isCheckoutOpen) return null;

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeCheckout} />

      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex flex-col">
            <h2 className="text-xl font-serif text-slate-800">Finalizar Compra</h2>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Paso {isStepConfirmed ? '2 de 2: Resumen' : '1 de 2: Envío'}</p>
          </div>
          <button onClick={closeCheckout} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400"><X size={20} /></button>
        </div>

        <div className="p-8 max-h-[75dvh] overflow-y-auto">
          {!isStepConfirmed ? (
            <form onSubmit={handleAddressSubmit} className="space-y-6">
              {/* Formulario de dirección igual que antes */}
              <div className="space-y-4">
                <input required placeholder="Calle" type="text" className="w-full border-b border-slate-200 py-3 outline-none focus:border-[#007f5f] transition-all text-sm"
                  value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Número" type="text" className="w-full border-b border-slate-200 py-3 outline-none focus:border-[#007f5f] transition-all text-sm"
                    value={address.number} onChange={(e) => setAddress({ ...address, number: e.target.value })} />
                  <input required placeholder="Teléfono de contacto" type="tel" className="w-full border-b border-slate-200 py-3 outline-none focus:border-[#007f5f] transition-all text-sm"
                    value={address.phoneNumber} onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value })} />
                </div>
                <input required readOnly placeholder="Localidad" type="text" className="w-full border-b border-slate-100 py-3 outline-none text-slate-400 text-sm bg-slate-50 px-2 rounded"
                  value={address.city} />
              </div>

              <div className="flex gap-3">
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

              <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl uppercase text-xs tracking-widest hover:bg-slate-800 transition-all active:scale-95">
                Confirmar Datos
              </button>
            </form>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Resumen de productos</p>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm items-center">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 uppercase text-[11px] tracking-tight">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{item.quantity} Unidad/es</span>
                      </div>
                      <span className="font-black text-slate-900">
                        ${(item.price * (item.quantity || 1)).toLocaleString('es-AR')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-dashed border-slate-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Envío ({address.city}):</span>
                    <span className="font-bold text-[#007f5f]">{shippingCost > 0 ? `$${shippingCost.toLocaleString('es-AR')}` : "Gratis"}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-800 font-bold uppercase text-xs tracking-tighter">Total Final:</span>
                    <span className="text-2xl font-black text-slate-900">${(cartTotal + shippingCost).toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button onClick={handleFinalPayment} disabled={loading} className="w-full py-5 bg-[#007f5f] text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 uppercase text-xs tracking-widest hover:bg-[#00664d] transition-all active:scale-95">
                  <CreditCard size={18} /> {loading ? "PROCESANDO..." : "Pagar con Mercado Pago"}
                </button>
                <button onClick={() => setIsStepConfirmed(false)} className="w-full py-4 bg-white border-2 border-slate-100 text-slate-400 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest">
                  <Edit3 size={14} /> Corregir Datos de Envío
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;