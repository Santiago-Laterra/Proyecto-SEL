import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react'; // Faltaba importar useEffect
import api from '../services/api';

// --- CONFIGURACIÓN FUERA DEL COMPONENTE ---
const PRECIO_LITRO_NAFTA = 1000;
const CONSUMO_KM_POR_LITRO = 10;

// Corregido: Definición de DISTANCIAS_KM (estaba comentada y rota)
const DISTANCIAS_KM = {
  "Villa Lugano": 2, "Villa Riachuelo": 3, "Villa Soldati": 4, "Mataderos": 5,
  "Parque Avellaneda": 6, "Liniers": 7, "Flores": 8, "Floresta": 8, "Villa Luro": 7,
  "Parque Chacabuco": 9, "Vélez Sársfield": 8, "Monte Castro": 10, "Villa del Parque": 11,
  "Villa Santa Rita": 10, "Villa General Mitre": 10, "Caballito": 11, "Boedo": 11,
  "Nueva Pompeya": 7, "Parque Patricios": 10, "Barracas": 12, "La Boca": 14,
  "Constitución": 13, "San Cristóbal": 12, "Villa Devoto": 12, "Villa Real": 11,
  "Versalles": 9, "Agronomía": 13, "Villa Pueyrredón": 15, "Parque Chas": 15,
  "Villa Ortúzar": 16, "Villa Crespo": 14, "Chacarita": 16, "Almagro": 13,
  "Balvanera": 14, "Paternal": 13, "La Paternal": 13, "Monserrat": 15,
  "San Nicolás": 16, "San Telmo": 15, "Puerto Madero": 17, "Retiro": 18,
  "Recoleta": 18, "Palermo": 18, "Colegiales": 18, "Belgrano": 20, "Coghlan": 20,
  "Núñez": 22, "Saavedra": 21, "Villa Urquiza": 18, "Lomas de Zamora": 0,
  "Temperley": 15, "Banfield": 13, "Adrogué": 18, "DEFAULT": 25
};

// Mapeo de Códigos Postales a Localidades para que el cálculo sea igual
const CP_A_LOCALIDAD = {
  "1828": "Lomas de Zamora",
  "1834": "Temperley",
  "1832": "Banfield",
  "1846": "Adrogué",
  "1429": "Núñez",
  "1425": "Palermo"
};

const calcularEnvioDinamico = (identificador) => {
  // Busca por localidad o por CP (si es CP, lo traduce a localidad)
  const nombreLocalidad = CP_A_LOCALIDAD[identificador] || identificador;
  const km = DISTANCIAS_KM[nombreLocalidad] !== undefined ? DISTANCIAS_KM[nombreLocalidad] : DISTANCIAS_KM["DEFAULT"];

  const costoCombustible = (km / CONSUMO_KM_POR_LITRO) * PRECIO_LITRO_NAFTA;
  const costoFijo = 500;
  return Math.round(costoCombustible + costoFijo);
};

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, cartTotal, shippingCost, zipCod, setShippingCost } = useCart();

  const [loading, setLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    number: '',
    city: 'Lomas de Zamora',
    type: 'casa',
    floor: '',
    apartment: ''
  });

  const localidadesCABA = Object.keys(DISTANCIAS_KM).filter(k => k !== "DEFAULT");

  const filteredLocalidades = localidadesCABA.filter(loc =>
    loc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // EFECTO: Si ya pusiste el CP en el producto, calcular el costo apenas se abre el modal
  useEffect(() => {
    if (isAddressModalOpen) {
      // Si ya tenemos un zipCod del producto, calculamos con eso
      if (zipCod) {
        const costo = calcularEnvioDinamico(zipCod);
        setShippingCost(costo);

        // Intentamos autocompletar la ciudad si el CP es conocido
        if (CP_A_LOCALIDAD[zipCod]) {
          setAddress(prev => ({ ...prev, city: CP_A_LOCALIDAD[zipCod] }));
          setSearchTerm(CP_A_LOCALIDAD[zipCod]);
        }
      }
      // Si no hay zipCod pero hay una ciudad seleccionada en el modal
      else if (address.city) {
        const costo = calcularEnvioDinamico(address.city);
        setShippingCost(costo);
      }
    }
  }, [isAddressModalOpen, zipCod]);

  const preCheckout = () => {
    if (cart.length === 0) return;
    const userStorage = localStorage.getItem('user');
    if (!userStorage) {
      alert("Debes estar logueado para comprar");
      return;
    }
    setIsAddressModalOpen(true);
  };

  const handleConfirmPurchase = async (e) => {
    e.preventDefault();

    if (!shippingCost || shippingCost === 0) {
      // Permitimos 0 si es Lomas de Zamora (gratis)
      if (address.city !== "Lomas de Zamora" && shippingCost === 0) {
        alert("Por favor, selecciona una localidad para calcular el envío.");
        return;
      }
    }

    if (!address.street || !address.number || !address.city) {
      alert("Por favor, completá los datos de la calle, número y localidad.");
      return;
    }

    setLoading(true);

    try {
      const userRaw = localStorage.getItem('user');
      const userData = JSON.parse(userRaw);

      const capitalize = (text) =>
        text.trim().toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

      const streetClean = capitalize(address.street);
      const detailInfo = address.type === 'depto' ? ` - Piso: ${address.floor} Dpto: ${address.apartment.toUpperCase()}` : "";
      const fullAddressString = `${streetClean} ${address.number}${detailInfo}, ${address.city}`;

      const payload = {
        items: cart.map(product => ({
          id: product._id,
          title: product.name,
          unit_price: Math.round(Number(product.price)),
          quantity: 1,
          currency_id: "ARS"
        })),
        userId: userData.id || userData._id,
        shippingCost: Number(shippingCost),
        shippingAddress: {
          street: streetClean,
          number: address.number,
          city: address.city,
          zipCode: zipCod || "0000",
          fullAddress: fullAddressString,
          type: address.type,
          floor: address.floor || "",
          apartment: address.apartment || ""
        }
      };

      const response = await api.post('/payments/create-preference', payload);
      if (response.data.init_point) {
        window.location.href = response.data.init_point;
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un problema al procesar el pago.");
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

        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">Carrito de la compra</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

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
              onClick={preCheckout}
              disabled={loading}
              className="w-full bg-[#007f5f] text-white py-4 rounded-md font-bold uppercase tracking-widest hover:bg-[#00664d] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Ir al Pago"}
            </button>
          </div>
        )}

        {isAddressModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-9999 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl relative my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-10">
                <h2 className="text-4xl font-serif text-slate-800">Detalles de Entrega</h2>
                <p className="text-slate-400 mt-3 text-lg">Asegurá tus datos para una entrega perfecta.</p>
              </div>

              <form onSubmit={handleConfirmPurchase} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Nombre de la Calle</label>
                    <input
                      required
                      type="text"
                      className="w-full border-b-2 border-slate-100 py-3 outline-none focus:border-[#007f5f] transition-colors text-lg"
                      placeholder="Ej: Av. Meeks"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Nro</label>
                    <input
                      required
                      type="number"
                      className="w-full border-b-2 border-slate-100 py-3 outline-none focus:border-[#007f5f] transition-colors text-lg text-center"
                      value={address.number}
                      onChange={(e) => setAddress({ ...address, number: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Tipo de Vivienda</label>
                    <select
                      className="w-full border-b-2 border-slate-100 py-3 outline-none focus:border-[#007f5f] bg-transparent"
                      value={address.type}
                      onChange={(e) => setAddress({ ...address, type: e.target.value })}
                    >
                      <option value="casa">Casa</option>
                      <option value="depto">Departamento / PH</option>
                    </select>
                  </div>

                  <div className="flex flex-col relative">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Localidad (CABA / GBA)</label>
                    <input
                      required
                      type="text"
                      className="w-full border-b-2 border-slate-100 py-3 outline-none focus:border-[#007f5f] transition-colors"
                      placeholder="Escribí para buscar..."
                      value={searchTerm || address.city}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchTerm(value);
                        setShowSuggestions(true);
                        setAddress({ ...address, city: value });
                      }}
                      onFocus={() => setShowSuggestions(true)}
                    />

                    {showSuggestions && searchTerm && (
                      <div className="absolute top-full left-0 z-10000 w-full bg-white border border-slate-200 rounded-xl mt-1 shadow-2xl max-h-48 overflow-y-auto">
                        {filteredLocalidades.length > 0 ? (
                          filteredLocalidades.map((loc) => (
                            <div
                              key={loc}
                              className="p-3 hover:bg-emerald-50 cursor-pointer text-sm text-slate-700 font-medium border-b border-slate-50 last:border-none"
                              onClick={() => {
                                setAddress({ ...address, city: loc });
                                setSearchTerm(loc);
                                setShowSuggestions(false);
                                const nuevoCosto = calcularEnvioDinamico(loc);
                                setShippingCost(nuevoCosto);
                              }}
                            >
                              {loc}
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-xs text-slate-400 italic">Sin resultados</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {address.type === 'depto' && (
                  <div className="flex gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-100 transition-all">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Piso</label>
                      <input
                        required
                        type="text"
                        placeholder="4"
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
                        placeholder="B"
                        className="w-full bg-transparent border-b border-slate-300 py-1 outline-none focus:border-[#007f5f] uppercase"
                        value={address.apartment}
                        onChange={(e) => setAddress({ ...address, apartment: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row items-center gap-4 mt-10">
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
                    className="w-full md:flex-1 py-4 text-slate-400 font-bold hover:text-slate-600"
                  >
                    VOLVER
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:flex-2 py-4 bg-[#007f5f] text-white font-bold rounded-2xl shadow-lg hover:bg-[#00664d] transition-all disabled:opacity-50"
                  >
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