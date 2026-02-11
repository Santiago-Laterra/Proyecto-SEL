import { useState, useEffect } from 'react'; // <--- AGREGAR ESTO
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import fotoPerfil from "../assets/fotoDePerfil.avif";
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Instagram } from 'lucide-react';

const Home = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga opcional
  const [openIndex, setOpenIndex] = useState(null);



  // Cargar productos al montar el componente
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error("Error cargando productos", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="text-center py-20">Cargando catálogo...</div>;


  const faqs = [
    { q: "¿Cómo recibo mi producto?", a: "¡Una vez hecho el pago te llegará un mail donde podrás descargar el archivo e imprimirlo para usar!" },
    { q: "¿Cuántas veces puedo reproducir las plantillas?", a: "Las plantillas son para un uso único y personal (no comercial) pero si querés hacerle un regalo a alguien imprimiendo 2 copias del mismo, no me enojo ;)" },
    { q: "Tengo otra duda", a: "Cualquier otra consulta podés hacerla en la sección 'Contacto' o escribiendo a mi instagram @aylensantoro" }
  ];

  return (
    <>
      {/* Contenedor de Productos: px-5 en mobile, px-15 en PC */}
      <div className="max-w-7xl mx-auto px-5 md:px-15 pt-15">
        {/* Grilla de Productos: 1 columna en mobile, 2 en sm, 4 en lg (PC) */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 md:gap-y-12">
            {products.map((product) => (
              <div key={product._id} className="group cursor-pointer">
                {/* Imagen: Redondeado más suave en mobile (2xl -> sm) según capturas */}
                <div className="aspect-square overflow-hidden bg-gray-50 rounded-sm md:rounded-2xl mb-6 md:mb-4 border border-gray-100 relative">
                  <Link to={`/product/${product._id}`} className="w-full h-full block">
                    {product.image ? (
                      <img
                        src={product.image[0].trim()}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/600x600?text=Soleyah+Store';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">Sin imagen</div>
                    )}
                  </Link>
                  {/* Badge X3 (Opcional, si lo tenés en la data) */}
                  <div className="absolute bottom-4 right-4 bg-gray-200/80 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center font-bold text-slate-700 border border-white md:hidden">
                    X3
                  </div>
                </div>

                {/* Detalles: Centrado total en mobile, según captura */}
                <div className="text-center px-4 md:px-2">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="text-[17px] md:text-base font-medium text-gray-800 group-hover:text-emerald-700 transition-colors leading-snug">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-[18px] md:text-lg font-bold text-gray-900 mt-2 md:mt-1">
                    {Number(product.price).toLocaleString('es-AR', {
                      style: 'currency',
                      currency: 'ARS',
                      minimumFractionDigits: 2
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 text-lg">No hay productos disponibles por el momento.</p>
          </div>
        )}
      </div>

      {/* Sección Sobre mí: Centrada en mobile, Row en PC */}
      <section className="bg-gray-50 py-20 md:py-16 px-8 md:px-10 mt-20 md:mt-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-12">
          <div className="flex-none">
            <img
              src={fotoPerfil}
              alt="Aylen - Creadora de Soleyah"
              className="w-48 h-48 md:w-38 md:h-38 rounded-full object-cover border-4 border-white shadow-sm"
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-2xl font-serif mb-6 text-slate-800">Sobre mí</h2>
            <p className="text-slate-600 leading-relaxed mb-8 text-[16px] md:text-1xl">
              ¡Hola! Soy Aylen, creadora de Soleyah, una tienda online de Arte & Diseño
              que ofrece piezas estéticas, funcionales y con el mensaje correcto.
            </p>
            <div className="flex justify-center md:justify-start">
              <button className="bg-[#008162] text-white px-10 md:px-5 py-3 rounded-md font-bold md:font-medium flex items-center gap-2 hover:bg-[#006b52] transition-colors text-[16px]">
                <span>+</span> Seguir
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sección FAQs */}
      <section className="bg-white py-16 md:py-[52.8px] font-proxima">
        <div className="mx-6 md:mx-[160.4px]">
          <h2 className="text-3xl md:text-[20px] font-proxima-nova mb-8 md:mb-5 text-slate-800 tracking-tight">
            FAQs
          </h2>

          <div className="flex flex-col border-t border-gray-300">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-300 py-6">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex justify-between items-center text-left group"
                >
                  <span className="text-[17px] md:text-[16px] font-normal text-slate-800 pr-4">
                    {faq.q}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp size={20} md:size={18} strokeWidth={1} className="text-stone-950 shrink-0" />
                  ) : (
                    <ChevronDown size={20} md:size={18} strokeWidth={1} className="text-stone-950 shrink-0" />
                  )}
                </button>

                {openIndex === index && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-300">
                    <p className="text-[15px] font-normal text-gray-500 leading-relaxed max-w-3xl">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;