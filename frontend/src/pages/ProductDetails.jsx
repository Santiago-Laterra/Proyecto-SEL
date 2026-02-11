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

// --- CONFIGURACIÓN DE CÁLCULO UNIFICADA ---
const PRECIO_LITRO_NAFTA = 1000;
const CONSUMO_KM_POR_LITRO = 10;
const COSTO_FIJO_BASE = 500;

const DISTANCIAS_KM = {
  // --- CABA ---
  "Villa Lugano": 1,
  "Nueva Pompeya": 6,
  "Parque Patricios": 8,
  "Floresta": 7,
  "Parque Avellaneda": 4,
  "Flores": 6,
  "Liniers": 7,
  "Parque Chacabuco": 7,
  "Caballito": 9,
  "Boedo": 10,
  "Almagro": 11,
  "Villa Crespo": 12,
  "Villa General Mitre": 9,
  "Villa del Parque": 11,
  "Villa Devoto": 13,
  "Villa Urquiza": 16,
  "Villa Pueyrredón": 15,
  "Saavedra": 18,
  "Núñez": 20,
  "Belgrano": 18,
  "Colegiales": 16,
  "Palermo": 15,
  "San Cristóbal": 11,
  "Constitución": 12,
  "San Telmo": 13,
  "Monserrat": 13,
  "San Nicolás": 14,

  // --- GBA SUR ---
  "Gerli": 10,
  "Lanús": 11,
  "Remedios de Escalada": 13,
  "Banfield": 15,
  "Lomas de Zamora": 17,
  "Temperley": 19,
  "Turdera": 20,
  "Llavallol": 22,
  "Adrogué": 23,
  "Luis Guillón": 24,
  "Monte Grande": 26,
  "Avellaneda Centro": 12,

  // Default para lugares no mapeados
  "DEFAULT": 25
};
// Mapeo de Códigos Postales a Localidades para que el cálculo sea igual
const CP_A_LOCALIDAD = {
  // CABA
  "1439": "Villa Lugano",
  "1437": "Nueva Pompeya",
  "1407": "Floresta",
  "1406": "Flores",
  "1408": "Liniers",
  "1405": "Caballito",
  "1218": "Boedo",
  "1173": "Almagro",
  "1414": "Villa Crespo",
  "1417": "Villa del Parque",
  "1419": "Villa Devoto",
  "1431": "Villa Urquiza",
  "1430": "Saavedra",
  "1429": "Núñez",
  "1428": "Belgrano",
  "1425": "Palermo",
  "1133": "San Telmo",
  "1001": "San Nicolás",

  // GBA SUR
  "1824": "Lanús",
  "1826": "Remedios de Escalada",
  "1828": "Banfield",
  "1832": "Lomas de Zamora",
  "1834": "Temperley",
  "1836": "Llavallol",
  "1842": "Monte Grande",
  "1870": "Avellaneda Centro",
  "1846": "Adrogué"
};

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zipCode, setZipCode] = useState('');
  const [shippingCost, setShippingCost] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const { toggleWishlist, isFavorite } = useWishlist();

  const navigate = useNavigate();

  // Traemos las funciones del Contexto
  const { addToCart, updateShipping, setZipCode: setGlobalZip, clearShipping } = useCart();

  // 1. Cargar el producto al montar
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

  useEffect(() => {
    return () => {
      if (clearShipping) clearShipping();
    };
  }, []);


  // 3. LÓGICA DE CÁLCULO LOCAL (Actualizada para usar el mapa de localidades)
  const handleCalculateShipping = () => {
    if (zipCode.length < 4) return alert("Por favor, ingresá un código postal válido");

    setCalculating(true);

    setTimeout(() => {
      // 1. Traducimos el CP a Nombre de Localidad (ej: "1439" -> "Villa Lugano")
      const nombreLocalidad = CP_A_LOCALIDAD[zipCode];


      if (!nombreLocalidad) {
        alert("Lo sentimos, por el momento no realizamos envíos a esta zona.");
        setShippingCost(null);
        if (clearShipping) clearShipping(); // Limpiamos cualquier rastro previo
        setCalculating(false);
        return;
      }

      // 2. Buscamos los KM usando el nombre obtenido, o el DEFAULT si no existe
      const km = DISTANCIAS_KM[nombreLocalidad] !== undefined
        ? DISTANCIAS_KM[nombreLocalidad]
        : DISTANCIAS_KM["DEFAULT"];

      let costoFinal = 0;

      if (km > 0) {
        const costoCombustible = (km / CONSUMO_KM_POR_LITRO) * PRECIO_LITRO_NAFTA;
        costoFinal = Math.round(costoCombustible + COSTO_FIJO_BASE);
      } else if (nombreLocalidad === "Lomas de Zamora") {
        // Solo es gratis si explícitamente es Lomas
        costoFinal = 0;
      } else {
        // Por las dudas, si no es Lomas y km es 0, aplicamos el base
        costoFinal = COSTO_FIJO_BASE;
      }

      setShippingCost(costoFinal);

      // Sincronizamos con el carrito global (Esto es lo que lee el CartDrawer)
      if (setGlobalZip) setGlobalZip(zipCode);
      if (updateShipping) updateShipping(costoFinal);

      setCalculating(false);
    }, 600);
  };

  if (loading) return <div className="text-center py-40">Cargando producto...</div>;
  if (!product) return <div className="text-center py-40">Producto no encontrado.</div>;

  const carouselImages = Array.isArray(product.image) ? product.image : [product.image];

  const handleBuyNow = () => {
    addToCart(product); // Lo agrega al carrito
    navigate('/carrito'); // Lo manda directo a pagar (o al home si tu carrito es un Drawer)
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
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            className="rounded-2xl overflow-hidden shadow-sm border border-gray-100"
          >
            {carouselImages.map((img, index) => (
              <SwiperSlide key={index}>
                <img
                  src={img}
                  alt={`Vista ${index}`}
                  className="w-full h-auto object-cover aspect-square"
                />
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
              onClick={handleBuyNow}
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
                  inputMode="numeric" // Abre el teclado numérico en celulares
                  placeholder="Tu código postal (ej: 1828)"
                  value={zipCode}
                  onChange={(e) => {
                    setZipCode(e.target.value);
                    if (e.target.value === '') setShippingCost(null); // Limpia el costo visual si borran el input
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#007f5f]"
                />
              </div>
              <button
                onClick={handleCalculateShipping}
                disabled={calculating}
                className="bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {calculating ? "..." : "Calcular"}
              </button>
            </div>

            {shippingCost !== null && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-100 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                <span className="text-sm text-slate-600">Costo de envío:</span>
                <span className="font-bold text-emerald-700">
                  {shippingCost === 0 ? "¡Envío sin cargo!" : `$ ${shippingCost.toLocaleString('es-AR')}`}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => toggleWishlist(product)}
            className="flex items-center gap-2 text-slate-500 text-sm hover:text-slate-800 transition-colors w-fit mt-2 group"
          >
            <Heart
              size={18}
              className={`transition-colors ${isFavorite(product._id) ? 'fill-red-500 text-red-500' : 'text-slate-500'}`}
            />
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