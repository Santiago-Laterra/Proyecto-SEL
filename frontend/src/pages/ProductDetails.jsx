import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { Heart } from 'lucide-react';
import api from '../services/api'; // Tu servicio de axios
import { useCart } from '../context/CartContext';

// Estilos de Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


import localImg2 from '../assets/foto-calendario-2.avif';
import localImg3 from '../assets/foto-calendario-3.avif';
import localImg4 from '../assets/foto-calendario-4.avif';
import localImg5 from '../assets/foto-calendario-5.webp';


const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Pedimos el producto específico a la API
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

  if (loading) return <div className="text-center py-40">Cargando producto...</div>;
  if (!product) return <div className="text-center py-40">Producto no encontrado.</div>;

  const carouselImages = [
    product.image, // La de Cloudinary (principal)
    localImg2,     // Local
    localImg3,     // Local
    localImg4,     // Local
    localImg5      // Local
  ]

  // Supongamos que tu DB tiene 'image' (string) o 'images' (array). 
  // Si solo hay una, la metemos en un array para que el Swiper funcione igual.
  const displayImages = product.images || [product.image];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-5 md:px-[160.4px] font-proxima">
      <div className="flex flex-col md:flex-row gap-12">

        {/* LADO IZQUIERDO: Carrusel Dinámico */}
        {/* LADO IZQUIERDO: Carrusel con el Mix */}
        <div className="w-full md:w-1/2">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="rounded-lg overflow-hidden shadow-sm"
          >
            {carouselImages.map((img, index) => (
              <SwiperSlide key={index}>
                <img
                  src={img}
                  alt={`Vista ${index + 1}`}
                  className="w-full h-auto object-cover aspect-square"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* LADO DERECHO: Info Dinámica de la DB */}
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          <h1 className="text-3xl text-slate-800 leading-tight font-serif">
            {product.name}
          </h1>

          <p className="text-2xl font-normal text-slate-900">
            {Number(product.price).toLocaleString('es-AR', {
              style: 'currency',
              currency: 'ARS'
            })}
          </p>

          <div className="flex flex-col gap-3 mt-4">
            <button
              className="w-full bg-[#007f5f] text-white py-4 rounded-md font-bold hover:bg-[#00664d] transition-all active:scale-[0.98]"
              onClick={() => addToCart(product)}>
              Añadir al carrito
            </button>
            <button
              className="w-full border border-[#007f5f] text-[#007f5f] py-4 rounded-md font-bold hover:bg-slate-50 transition-all">
              Compra ahora
            </button>
          </div>

          <button className="flex items-center gap-2 text-slate-500 text-sm hover:text-slate-800 transition-colors w-fit">
            <Heart size={18} />
            <span className="underline">Añadir a la lista de deseos</span>
          </button>

          {/* Descripción Dinámica */}
          <div className="mt-8 border-t border-gray-100 pt-8">
            <div className="text-slate-600 mb-4 whitespace-pre-line">
              {product.description || "Sin descripción disponible."}
            </div>

            {/* Si tenés un campo 'includes' en tu DB, podrías mapearlo aquí */}
            <h3 className="font-bold text-slate-800 mb-2 uppercase text-xs tracking-widest">Detalles:</h3>
            <ul className="list-disc list-inside text-slate-600 space-y-1 text-sm">
              <li>Formato: PDF imprimible A4</li>
              <li>Entrega: Inmediata vía Email</li>
              <li>Uso: Personal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;