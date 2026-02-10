import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx';
import { X, ImagePlus } from 'lucide-react'; // Para iconos bonitos

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: ''
  });

  const [files, setFiles] = useState([]); // Array de archivos reales
  const [previews, setPreviews] = useState([]); // Array de URLs temporales para ver las fotos
  const [loading, setLoading] = useState(false);

  if (!isAdmin) return <div className="text-center py-20">No tienes acceso a esta sección.</div>;

  // Manejar selección de archivos y generar previews
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Guardamos los archivos reales para el backend
    setFiles((prev) => [...prev, ...selectedFiles]);

    // Generamos URLs temporales para que el Admin vea las imágenes
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  // Eliminar una foto de la lista antes de subir
  const removeImage = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return alert("Por favor, selecciona al menos una imagen.");

    setLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    data.append('category', formData.category);

    files.forEach((f) => {
      data.append('image', f);
    });

    try {
      await api.post('/products/add', data);
      alert("¡Producto cargado con éxito!");
      setFormData({ name: '', description: '', price: '', stock: '', category: '' });
      setFiles([]);
      setPreviews([]);
      navigate('/admin');
    } catch (error) {
      alert(error.response?.data?.message || "Error al comunicarse con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Panel de Control Admin</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 text-emerald-700">Nuevo Producto</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Nombre del producto" value={formData.name} onChange={handleChange} className="w-full p-3 border rounded-xl" required />
              <input type="text" name="category" placeholder="Categoría" value={formData.category} onChange={handleChange} className="w-full p-3 border rounded-xl" required />
            </div>

            <textarea name="description" placeholder="Descripción detallada..." value={formData.description} onChange={handleChange} className="w-full p-3 border rounded-xl h-32" required />

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500 ml-2">Precio (ARS)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-3 border rounded-xl" required />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 ml-2">Stock disponible</label>
                <input
                  type="number"
                  min="0" // El stock mínimo es 0
                  placeholder="Cantidad disponible"
                  onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                  className="tu-clase-de-input"
                  value={productData.stock}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setProductData({ ...productData, stock: val < 0 ? 0 : val });
                  }}
                />
              </div>
            </div>

            {/* ÁREA DE FOTOS (Estilo Drag & Drop) */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Fotos del producto</label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {previews.map((url, index) => (
                  <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border">
                    <img src={url} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-emerald-600 text-white text-[10px] text-center py-1 font-bold">PRINCIPAL</span>
                    )}
                  </div>
                ))}

                {/* Botón de añadir más */}
                <label className="cursor-pointer aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
                  <ImagePlus className="text-gray-400" />
                  <span className="text-[10px] mt-2 text-gray-500 font-medium">Añadir foto</span>
                  <input type="file" onChange={handleFileChange} className="hidden" multiple accept="image/*" />
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition disabled:opacity-50 shadow-lg shadow-emerald-100">
              {loading ? "Subiendo a la nube..." : "🚀 Publicar Producto"}
            </button>
          </form>
        </div>

        {/* Sección Reportes lateral */}
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 h-fit">
          <h2 className="font-bold text-emerald-800 mb-2">Acciones Rápidas</h2>
          <p className="text-sm text-emerald-600 mb-4 font-medium">Respaldo local del inventario.</p>
          <button onClick={() => {/* handleExportExcel */ }} className="w-full bg-white text-emerald-700 border border-emerald-200 px-4 py-3 rounded-xl font-bold hover:bg-emerald-700 hover:text-white transition flex items-center justify-center gap-2">
            Descargar Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;