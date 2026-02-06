import { useState, useEffect } from 'react'; // <--- AGREGAR ESTO
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import fotoPerfil from "../assets/fotoDePerfil.avif";
import { Link } from 'react-router-dom';


const Home = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga opcional

  // Función para exportar Excel (se mantiene igual)
  const handleExportExcel = async () => {
    try {
      console.log("Iniciando descarga...");
      const response = await api.get('/products/export-excel', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Reporte_Ventas_SeloYah.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("No se pudo descargar el Excel", error);
      alert("Error al descargar el archivo. Revisa la consola.");
    }
  };

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

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Sección de Admin (Panel de Control mejorado) */}
        {isAdmin && (
          <div className="mb-12 p-6 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Panel de Administración</h2>
              <p className="text-sm text-gray-500">Gestioná el inventario y exportá reportes</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportExcel}
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                📥 Exportar a Excel
              </button>
              {/* Aquí podrías agregar el botón de "Nuevo Producto" pronto */}
            </div>
          </div>
        )}


        {/* Grilla de Productos */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {products.map((product) => (
              <div key={product._id} className="group cursor-pointer">
                {/* Contenedor de Imagen con Protección contra errores */}
                <div className="aspect-square overflow-hidden bg-gray-100 rounded-2xl mb-4 border border-gray-100 flex items-center justify-center relative">
                  <Link to={`/product/${product._id}`} className="overflow-hidden rounded-lg mb-4">
                    {product.image ? (
                      <img
                        src={product.image.trim()}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        // Si la URL de Cloudinary falla, cargamos una imagen por defecto
                        onError={(e) => {
                          console.error("Fallo la carga de imagen para:", product.name);
                          e.target.onerror = null;
                          // Cambiamos el placeholder por uno más confiable
                          e.target.src = 'https://placehold.co/600x600?text=SeloYah+Store';
                        }}
                      />
                    ) : (
                      <div className="text-gray-400 text-sm italic">Sin imagen</div>
                    )}

                  </Link>

                  {/* Overlay sutil al pasar el mouse (opcional, estilo Shop moderno) */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Detalles del Producto */}
                <div className="text-center px-2">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="text-base font-medium text-gray-800 group-hover:text-emerald-700 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-lg font-bold text-gray-900 mt-1">
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

      {/* Sección Sobre mí */}
      <section className="bg-gray-50 py-16 px-10 mt-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          {/* Imagen de Perfil Circular */}
          <div className="flex-none">
            <img
              src={fotoPerfil}
              alt="Aylen - Creadora de Soleyah"
              className="w-48 h-48 md:w-38 md:h-38 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>

          {/* Texto Descriptivo */}
          <div className="flex-1 text-left">
            <h2 className="text-2xl font-serif mb-6 text-slate-800">Sobre mí</h2>
            <p className="text-slate-600 leading-relaxed mb-8 text-1xl">
              ¡Hola! Soy Aylen, creadora de Soleyah, una tienda online de Arte & Diseño
              que ofrece piezas estéticas, funcionales y con el mensaje correcto.
            </p>
            <button className="bg-[#008162] text-white px-5 py-3 rounded-md font-medium flex items-center gap-2 hover:bg-[#006b52] transition-colors text-[16px]">
              <span>+</span> Seguir
            </button>
          </div>
        </div>
      </section>

      {/*Seccion sobre preguntas */}
      <section className="bg-white py-[52.8px] font-proxima">

        {/* Margen lateral exacto de 160.4px */}
        <div className="mx-5 md:mx-[160.4px]">

          {/* Título FAQs: 25px, Serif, sin línea abajo */}
          <h2 className="text-[20px] font-proxima-nova mb-5 text-slate-800 tracking-tight">
            FAQs
          </h2>

          <div className="flex flex-col border-t border-gray-300">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-300 py-6">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex justify-between items-center text-left group"
                >
                  {/* Preguntas: 16px, Normal y Proxima */}
                  <span className="text-[16px] font-normal text-slate-800">
                    {faq.q}
                  </span>

                  {/* Flecha finita estilo minimalista */}
                  {openIndex === index ? (
                    <ChevronUp size={18} strokeWidth={1} className="text-stone-950" />
                  ) : (
                    <ChevronDown size={18} strokeWidth={1} className="text-stone-950" />
                  )}
                </button>

                {/* Respuesta: 15px */}
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
};

export default Home;