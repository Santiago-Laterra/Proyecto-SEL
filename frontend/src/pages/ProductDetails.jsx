import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Heart, Truck, MapPin } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';

// Estilos de Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// --- CONFIGURACIÓN DE CÁLCULO UNIFICADA ---
const PRECIO_LITRO_NAFTA = 1000;
const CONSUMO_KM_POR_LITRO = 10;
const COSTO_FIJO_BASE = 500;

const DISTANCIAS_KM = {
  // GBA SUR
  "1828": 0,  // Lomas de Zamora (Centro)
  "1834": 15, // Temperley
  "1832": 13, // Banfield
  "1846": 18, // Adrogué
  // CABA
  "1439": 2,  // Villa Lugano
  "1406": 8,  // Flores
  "1407": 8,  // Floresta
  "1411": 11, // Caballito
  "1425": 18, // Palermo
  "1429": 22, // Núñez
  "1157": 14, // La Boca
  "1001": 18, // Retiro
  "1426": 20, // Belgrano
  "1419": 15, // Villa Pueyrredón
  "DEFAULT": 25 // Cualquier otro CP
};

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zipCode, setZipCode] = useState('');
  const [shippingCost, setShippingCost] = useState(null);
  const [calculating, setCalculating] = useState(false);

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

  // 2. Limpiar envío previo al entrar a un nuevo producto
  useEffect(() => {
    clearShipping();
  }, [clearShipping]);

  // 3. LÓGICA DE CÁLCULO LOCAL (Eliminada la API)
  const handleCalculateShipping = () => {
    if (zipCode.length < 4) return alert("Por favor, ingresá un código postal válido");

    setCalculating(true);

    // Simulamos un delay de "procesamiento" para mejorar la UX
    setTimeout(() => {
      const km = DISTANCIAS_KM[zipCode] !== undefined ? DISTANCIAS_KM[zipCode] : DISTANCIAS_KM["DEFAULT"];

      let costoFinal = 0;

      if (km > 0) {
        const costoCombustible = (km / CONSUMO_KM_POR_LITRO) * PRECIO_LITRO_NAFTA;
        costoFinal = Math.round(costoCombustible + COSTO_FIJO_BASE);
      } else {
        // Si km es 0 (Lomas de Zamora), el envío es gratis
        costoFinal = 0;
      }

      setShippingCost(costoFinal);

      // Sincronizamos con el carrito global
      if (setGlobalZip) setGlobalZip(zipCode);
      if (updateShipping) updateShipping(costoFinal);

      setCalculating(false);
    }, 600);
  };

  if (loading) return <div className="text-center py-40">Cargando producto...</div>;
  if (!product) return <div className="text-center py-40">Producto no encontrado.</div>;

  const carouselImages = Array.isArray(product.image) ? product.image : [product.image];

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
            <button className="w-full border border-[#007f5f] text-[#007f5f] py-4 rounded-md font-bold hover:bg-slate-50 transition-all">
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
                  placeholder="Tu código postal (ej: 1828)"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
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
                  {shippingCost === 0 ? "¡Gratis en Lomas!" : `$ ${shippingCost.toLocaleString('es-AR')}`}
                </span>
              </div>
            )}
          </div>

          <button className="flex items-center gap-2 text-slate-500 text-sm hover:text-slate-800 transition-colors w-fit mt-2">
            <Heart size={18} />
            <span className="underline">Añadir a la lista de deseos</span>
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