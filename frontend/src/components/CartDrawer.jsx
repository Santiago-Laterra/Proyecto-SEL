import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import api from '../services/api';

const CartDrawer = ({ isOpen, onClose }) => {
  // Solo consumimos datos. No usamos setShippingCost aquí.
  const { cart, removeFromCart, cartTotal, shippingCost, zipCod } = useCart();
  const [loading, setLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Estados para el buscador de localidades (solo visual)
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const localidadesDisponibles = ["Lomas de Zamora", "Temperley", "Banfield", "Adrogué", "Villa Lugano", "Palermo", "Núñez"];

  const filteredLocalidades = localidadesDisponibles.filter(loc =>
    loc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [address, setAddress] = useState({
    street: '',
    number: '',
    city: '',
    type: 'casa',
    floor: '',
    apartment: ''
  });

  const CP_A_OPCIONES = {
    // --- CABA (Capital Federal) ---
    "1173": ["Almagro"],
    "1428": ["Belgrano", "Colegiales"],
    "1218": ["Boedo"],
    "1405": ["Caballito"],
    "1133": ["Constitución", "San Telmo", "Monserrat"],
    "1406": ["Flores", "Parque Chacabuco"],
    "1407": ["Floresta", "Parque Avellaneda"],
    "1408": ["Liniers"],
    "1437": ["Nueva Pompeya", "Parque Patricios"],
    "1429": ["Núñez"],
    "1425": ["Palermo"],
    "1430": ["Saavedra", "Villa Pueyrredón"],
    "1224": ["San Cristóbal"],
    "1001": ["San Nicolás"],
    "1414": ["Villa Crespo"],
    "1417": ["Villa del Parque", "Villa General Mitre"],
    "1419": ["Villa Devoto"],
    "1439": ["Villa Lugano"],
    "1431": ["Villa Urquiza"],

    // --- GBA SUR ---
    "1824": ["Lanús", "Gerli"],
    "1826": ["Remedios de Escalada"],
    "1828": ["Banfield"],
    "1832": ["Lomas de Zamora", "Banfield"],
    "1834": ["Temperley", "Turdera"],
    "1836": ["Llavallol"],
    "1842": ["Monte Grande", "Luis Guillón"],
    "1870": ["Avellaneda Centro"],
    "1846": ["Adrogué"]
  };

  // Sincronizar automáticamente la ciudad si ya se calculó en el producto
  useEffect(() => {
    if (zipCod && CP_A_OPCIONES[zipCod]) {
      // Por defecto elegimos la primera del array
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
        // 1. Asegúrate de que el unit_price sea el precio del producto
        items: cart.map(item => ({
          id: item._id,
          title: item.name,
          // Usamos el precio del producto de la DB. 
          // Importante: Mercado Pago requiere números enteros o con decimales puntos.
          unit_price: Number(item.price),
          quantity: 1,
          currency_id: "ARS"
        })),

        // 2. El costo de envío se envía aparte (si tu backend lo suma allá)
        // O se puede agregar como un item más llamado "Envío"
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
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-60 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />

      {/* Panel Lateral del Carrito */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white z-70 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">Carrito de la compra</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Lista de productos */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 mt-10 text-sm">Aún no se han añadido artículos al carrito</p>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="flex gap-4 border-b border-gray-50 pb-4">
                <img
                  src={Array.isArray(item.image) ? item.image[0] : (item.image || "/placeholder.png")}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-slate-800 leading-snug">{item.name}</h3>
                  <p className="text-sm font-bold mt-1">
                    {Number(item.price).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                  </p>
                  <button onClick={() => removeFromCart(item._id)} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 mt-2 underline">
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resumen de costos */}
        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-100 space-y-3">
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Subtotal</span>
              <span>${cartTotal.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Envío ({address.city || "No seleccionado"})</span>
              <span>{shippingCost > 0 ? `$ ${shippingCost.toLocaleString('es-AR')}` : shippingCost === 0 ? "Gratis" : "A calcular"}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-100 mb-6">
              <span className="text-lg font-serif text-slate-900">Total</span>
              <span className="text-xl font-bold italic text-slate-900">
                {(cartTotal + (shippingCost || 0)).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
              </span>
            </div>
            <button
              onClick={preCheckout}
              disabled={loading}
              className="w-full bg-[#007f5f] text-white py-4 rounded-md font-bold uppercase tracking-widest hover:bg-[#00664d] transition-all disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Ir al Pago"}
            </button>
          </div>
        )}

        {/* Modal de Dirección */}
        {isAddressModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-9999 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl relative">
              <h2 className="text-4xl font-serif text-slate-800 text-center mb-10">Detalles de Entrega</h2>

              <form onSubmit={handleConfirmPurchase} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-3">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Calle</label>
                    <input
                      required
                      type="text"
                      className="w-full border-b-2 border-slate-100 py-3 outline-none focus:border-[#007f5f] text-lg"
                      placeholder="Ej: Av. Meeks"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Nro</label>
                    <input
                      required
                      type="number"
                      className="w-full border-b-2 border-slate-100 py-3 outline-none focus:border-[#007f5f] text-lg text-center"
                      value={address.number}
                      onChange={(e) => setAddress({ ...address, number: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Tipo de Vivienda</label>
                    <select
                      className="w-full border-b-2 border-slate-100 py-3 outline-none focus:border-[#007f5f] bg-transparent"
                      value={address.type}
                      onChange={(e) => setAddress({ ...address, type: e.target.value })}
                    >
                      <option value="casa">Casa</option>
                      <option value="depto">Departamento / PH</option>
                    </select>
                  </div>

                  <div className="relative">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Localidad</label>
                    {zipCod && CP_A_OPCIONES[zipCod]?.length > 1 ? (
                      <select
                        className="w-full border-b-2 border-slate-100 py-3 outline-none focus:border-[#007f5f] bg-white text-slate-700"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      >
                        {CP_A_OPCIONES[zipCod].map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        readOnly
                        className="w-full border-b-2 border-slate-100 py-3 bg-slate-50 text-slate-500 cursor-not-allowed"
                        value={address.city}
                      />
                    )}
                    <p className="text-[10px] text-orange-400 mt-1">* Basado en el CP {zipCod}</p>
                  </div>
                </div>

                {address.type === 'depto' && (
                  <div className="flex gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Piso</label>
                      <input
                        required
                        type="text"
                        className="w-full bg-transparent border-b border-slate-300 py-1 outline-none focus:border-[#007f5f]"
                        value={address.floor}
                        onChange={(e) => setAddress({ ...address, floor: e.target.value })}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Depto</label>
                      <input
                        required
                        type="text"
                        className="w-full bg-transparent border-b border-slate-300 py-1 outline-none focus:border-[#007f5f] uppercase"
                        value={address.apartment}
                        onChange={(e) => setAddress({ ...address, apartment: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row items-center gap-4 mt-10">
                  <button type="button" onClick={() => setIsAddressModalOpen(false)} className="w-full md:flex-1 py-4 text-slate-400 font-bold hover:text-slate-600">
                    VOLVER
                  </button>
                  <button type="submit" disabled={loading} className="w-full md:flex-2 py-4 bg-[#007f5f] text-white font-bold rounded-2xl shadow-lg hover:bg-[#00664d] transition-all disabled:opacity-50">
                    {loading ? "PROCESANDO..." : "CONFIRMAR COMPRA"}
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