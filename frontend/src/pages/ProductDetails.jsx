import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Heart, Truck, MapPin } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

// Estilos de Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Mapa de CPs para que la función sepa qué nombre mandarle al Context
const CP_A_LOCALIDAD = {
  "1173": "Almagro", "1428": "Belgrano", "1218": "Boedo", "1405": "Caballito",
  "1133": "Constitución", "1406": "Flores", "1407": "Floresta", "1408": "Liniers",
  "1437": "Nueva Pompeya", "1429": "Núñez", "1425": "Palermo", "1430": "Saavedra",
  "1224": "San Cristóbal", "1001": "San Nicolás", "1414": "Villa Crespo",
  "1417": "Villa del Parque", "1419": "Villa Devoto", "1439": "Villa Lugano",
  "1431": "Villa Urquiza", "1824": "Lanús", "1826": "Remedios de Escalada",
  "1828": "Banfield", "1832": "Lomas de Zamora", "1834": "Temperley",
  "1836": "Llavallol", "1842": "Monte Grande", "1870": "Avellaneda Centro",
  "1846": "Adrogué"
};

const ProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zipCode, setZipCode] = useState('');
  const [calculating, setCalculating] = useState(false);

  const { toggleWishlist, isFavorite } = useWishlist();

  // EXTRACCIÓN CORRECTA DEL CONTEXTO
  const {
    addToCart,
    openCheckout,
    calculateShippingAction, // <--- Esto te faltaba extraer
    shippingCost: globalShippingCost // <--- Usamos el del context
  } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Error al obtener el producto:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Limpiar envío al desmontar si lo deseas, o dejarlo persistente
  useEffect(() => {
    return () => {
      // Opcional: si quieres que el envío se borre al salir de la página
      // if (clearShipping) clearShipping(); 
    };
  }, []);

  const handleCalculateShipping = () => {
    if (zipCode.length < 4) return showAlert("Por favor, ingresá un código postal válido", "warning");

    setCalculating(true);

    const nombreLocalidad = CP_A_LOCALIDAD[zipCode];

    if (!nombreLocalidad) {
      showAlert("No realizamos envíos a esta zona o el CP es incorrecto.", "error");
      setCalculating(false);
      return;
    }

    // Llamamos a la función centralizada del Context
    calculateShippingAction(zipCode, nombreLocalidad);
    setCalculating(false);
  };

  if (loading) return <div className="text-center py-40">Cargando producto...</div>;
  if (!product) return <div className="text-center py-40">Producto no encontrado.</div>;

  const carouselImages = Array.isArray(product.image) ? product.image : [product.image];

  const handleBuyNow = () => {

    addToCart(product);
    openCheckout();
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-5 md:px-[160.4px] font-proxima">
      <div className="flex flex-col md:flex-row gap-12">

        {/* CARRUSEL */}
        <div className="w-full md:w-1/2">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            loop={true}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            className="rounded-2xl overflow-hidden shadow-sm border border-gray-100"
          >
            {carouselImages.map((img, index) => (
              <SwiperSlide key={index}>
                <img src={img} alt={`Vista ${index}`} className="w-full h-auto object-cover aspect-square" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* INFO DEL PRODUCTO */}
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          <h1 className="text-3xl text-slate-800 leading-tight font-serif">{product.name}</h1>
          <p className="text-2xl font-normal text-slate-900">
            {Number(product.price).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
          </p>

          <div className="flex flex-col gap-3 mt-4">
            <button
              className="w-full bg-[#007f5f] text-white py-4 rounded-md font-bold hover:bg-[#00664d] transition-all active:scale-[0.98]"
              onClick={() => addToCart(product)}
            >
              Añadir al carrito
            </button>
            <button
              onClick={() => { handleBuyNow }}
              className="w-full border border-[#007f5f] text-[#007f5f] py-4 rounded-md font-bold hover:bg-slate-50 transition-all"
            >
              Compra ahora
            </button>
          </div>

          {/* CALCULADORA DE ENVÍO */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mt-2">
            <div className="flex items-center gap-2 mb-4 text-slate-700">
              <Truck size={20} className="text-[#007f5f]" />
              <span className="font-semibold text-sm">Calculá el costo de envío</span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Tu código postal (ej: 1828)"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#007f5f]"
                />
              </div>
              <button
                onClick={handleCalculateShipping}
                disabled={calculating}
                className="bg-[#007f5f] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {calculating ? "..." : "Calcular"}
              </button>
            </div>

            {/* Mostramos el costo global del context */}
            {globalShippingCost !== null && globalShippingCost > 0 && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-100 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                <span className="text-sm text-slate-600">Costo de envío:</span>
                <span className="font-bold text-emerald-700">
                  $ {globalShippingCost.toLocaleString('es-AR')}
                </span>
              </div>
            )}
            {globalShippingCost === 0 && zipCode && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-center text-sm text-emerald-700 font-bold">
                ¡Envío sin cargo para tu zona!
              </div>
            )}
          </div>

          {/* BOTÓN WISHLIST */}
          <button
            onClick={() => toggleWishlist(product)}
            className="flex items-center gap-2 text-slate-500 text-sm hover:text-slate-800 transition-colors w-fit mt-2 group"
          >
            <Heart size={18} className={`transition-colors ${isFavorite(product._id) ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} />
            <span className={isFavorite(product._id) ? 'text-red-600 font-medium' : 'underline'}>
              {isFavorite(product._id) ? 'En tu lista de deseos' : 'Añadir a la lista de deseos'}
            </span>
          </button>

          <div className="mt-4 border-t border-gray-100 pt-8 text-slate-600 mb-4 whitespace-pre-line text-sm">
            {product.description || "Sin descripción disponible."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;