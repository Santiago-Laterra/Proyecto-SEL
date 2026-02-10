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
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    number: '',
    city: 'Lomas de Zamora', // Ciudad por defecto
    type: 'casa',           // 'casa' o 'depto'
    floor: '',
    apartment: ''
  });

  // --- FUNCIONES ---
  const localidadesCABA = [
    "Agronomía", "Almagro", "Balvanera", "Barracas", "Belgrano", "Boedo", "Caballito",
    "Chacarita", "Coghlan", "Colegiales", "Constitución", "Flores", "Floresta",
    "La Boca", "La Paternal", "Liniers", "Mataderos", "Monte Castro", "Monserrat",
    "Nueva Pompeya", "Núñez", "Palermo", "Parque Avellaneda", "Parque Chacabuco",
    "Parque Chas", "Parque Patricios", "Puerto Madero", "Recoleta", "Retiro",
    "Saavedra", "San Cristóbal", "San Nicolás", "San Telmo", "Vélez Sársfield",
    "Versalles", "Villa Crespo", "Villa del Parque", "Villa Devoto", "Villa General Mitre",
    "Villa Lugano", "Villa Luro", "Villa Ortúzar", "Villa Pueyrredón", "Villa Real",
    "Villa Riachuelo", "Villa Santa Rita", "Villa Soldati", "Villa Urquiza"
  ];

  const filteredLocalidades = localidadesCABA.filter(loc =>
    loc.toLowerCase().includes(searchTerm.toLowerCase())
  );
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

    // --- 1. VALIDACIONES PREVIAS ---
    if (!zipCode || !shippingCost) {
      alert("Por favor, calculá el envío antes de continuar.");
      return;
    }

    // Validación básica de campos obligatorios del modal
    if (!address.street || !address.number || !address.city) {
      alert("Por favor, completá los datos de la calle, número y localidad.");
      return;
    }

    setLoading(true);

    try {
      const userRaw = localStorage.getItem('user');
      if (!userRaw) {
        alert("No se encontró sesión de usuario. Por favor, iniciá sesión.");
        return;
      }
      const userData = JSON.parse(userRaw);

      if (cart.length === 0) {
        alert("El carrito está vacío.");
        return;
      }

      // --- 2. SANITIZACIÓN DE DATOS (Nivel Admin) ---
      // Función para poner la primera en mayúscula (ej: "rivadavia" -> "Rivadavia")
      const capitalize = (text) =>
        text.trim().toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

      const streetClean = capitalize(address.street);
      const cityClean = address.city; // Ya viene del select

      // Construimos la dirección detallada para el Excel
      let detailInfo = "";
      if (address.type === 'depto') {
        detailInfo = ` - Piso: ${address.floor} Dpto: ${address.apartment.toUpperCase()}`;
      }

      // Esta es la cadena final que verá el Admin en el reporte
      const fullAddressString = `${streetClean} ${address.number}${detailInfo}, ${cityClean}`;

      // --- 3. CONSTRUCCIÓN DEL PAYLOAD ---
      const payload = {
        items: cart.map(product => ({
          id: product._id,
          title: product.name,
          // Usamos Math.round para evitar decimales extraños en MP
          unit_price: Math.round(Number(product.price)),
          quantity: 1,
          currency_id: "ARS"
        })),
        userId: userData.id || userData._id,
        shippingCost: Number(shippingCost),
        shippingAddress: {
          street: streetClean,
          number: address.number,
          city: cityClean,
          zipCode: zipCode,
          // Enviamos el string completo para que el Backend lo guarde fácil
          fullAddress: fullAddressString,
          type: address.type,
          floor: address.floor || "",
          apartment: address.apartment || ""
        }
      };

      console.log("🚀 Admin Payload listo:", payload);

      // --- 4. ENVÍO AL BACKEND ---
      const response = await api.post('/payments/create-preference', payload);

      if (response.data.init_point) {
        // Redirigimos al Checkout de Mercado Pago
        window.location.href = response.data.init_point;
      } else {
        throw new Error("No se recibió el link de pago desde el servidor.");
      }

    } catch (error) {
      console.error("❌ Error en el proceso de compra:", error);
      const errorMsg = error.response?.data?.error || error.message;
      alert(`Hubo un problema: ${errorMsg}`);
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
          /* El contenedor principal ahora usa 'inset-0' sin 'w-screen' para evitar el desfasaje por scrollbar */
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-9999 flex items-center justify-center p-4 overflow-y-auto">
            <div
              /* Añadimos 'my-auto' para asegurar centrado vertical si el contenido crece */
              className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl animate-modal relative my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-10">
                <h2 className="text-4xl font-serif text-slate-800">Detalles de Entrega</h2>
                <p className="text-slate-400 mt-3 text-lg">Asegurá tus datos para una entrega perfecta.</p>
              </div>

              <form onSubmit={handleConfirmPurchase} className="space-y-8">
                {/* FILA 1: CALLE Y NÚMERO */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-3">
                    <label className="admin-label">Nombre de la Calle</label>
                    <input
                      required
                      type="text"
                      className="admin-input text-lg"
                      placeholder="Ej: Av. Meeks"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="admin-label">Nro</label>
                    <input
                      required
                      type="number"
                      min="1"
                      className="admin-input text-lg text-center"
                      onKeyDown={(e) => { if (['-', 'e', '+'].includes(e.key)) e.preventDefault(); }}
                      value={address.number}
                      onChange={(e) => setAddress({ ...address, number: e.target.value })}
                    />
                  </div>
                </div>

                {/* FILA 2: TIPO Y LOCALIDAD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="admin-label">Tipo de Vivienda</label>
                    <select
                      className="admin-select"
                      value={address.type}
                      onChange={(e) => setAddress({ ...address, type: e.target.value })}
                    >
                      <option value="casa">Casa</option>
                      <option value="depto">Departamento / PH</option>
                    </select>
                  </div>

                  <div className="flex flex-col relative">
                    <label className="admin-label">Localidad (CABA / GBA)</label>
                    <input
                      required
                      type="text"
                      className="admin-input font-medium"
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

                    {/* LISTA DE SUGERENCIAS */}
                    {showSuggestions && searchTerm && (
                      <div className="absolute top-full left-0 z-10000 w-full bg-white border border-slate-200 rounded-xl mt-1 shadow-2xl max-h-48 overflow-y-auto">
                        {filteredLocalidades.length > 0 ? (
                          filteredLocalidades.map((loc) => (
                            <div
                              key={loc}
                              className="p-3 hover:bg-emerald-50 cursor-pointer text-sm text-slate-700 font-medium transition-colors border-b border-slate-50 last:border-none"
                              onClick={() => {
                                setAddress({ ...address, city: loc });
                                setSearchTerm(loc);
                                setShowSuggestions(false);
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

                {/* FILA 3: CONDICIONAL DEPTO */}
                {address.type === 'depto' && (
                  <div className="flex gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-100 transition-all">
                    <div className="flex-1">
                      <label className="admin-label text-slate-500">Piso</label>
                      <input
                        required={address.type === 'depto'}
                        type="text"
                        placeholder="4"
                        className="w-full bg-transparent border-b border-slate-300 py-1 outline-none focus:border-[#007f5f]"
                        value={address.floor}
                        onChange={(e) => setAddress({ ...address, floor: e.target.value })}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="admin-label text-slate-500">Departamento</label>
                      <input
                        required={address.type === 'depto'}
                        type="text"
                        placeholder="B"
                        className="w-full bg-transparent border-b border-slate-300 py-1 outline-none focus:border-[#007f5f] uppercase"
                        value={address.apartment}
                        onChange={(e) => setAddress({ ...address, apartment: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* BOTONES */}
                <div className="flex flex-col md:flex-row items-center gap-4 mt-10">
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
                    className="w-full md:flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                  >
                    VOLVER
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:flex-2 py-4 bg-[#007f5f] text-white font-bold rounded-2xl shadow-[0_10px_20px_rgba(0,127,95,0.2)] hover:bg-[#00664d] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
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