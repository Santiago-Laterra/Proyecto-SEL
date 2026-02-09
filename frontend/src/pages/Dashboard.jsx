import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importación necesaria
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx'; // Para la función de Excel

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate(); // 2. Definición necesaria

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Función para exportar a Excel (Admin Role)
  const handleExportExcel = async () => {
    try {
      const { data } = await api.get('/products');
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Productos");
      XLSX.writeFile(wb, "Inventario_SeloYah.xlsx");
    } catch (error) {
      console.error("Error al exportar:", error);
    }
  };

  if (!isAdmin) return <div className="text-center py-20">No tienes acceso a esta sección.</div>;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      return alert("Por favor, selecciona una imagen antes de publicar.");
    }

    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    data.append('category', formData.category);

    Array.from(files).forEach((f) => {
      data.append('image', f);
    });

    try {
      // 3. Petición al Backend
      await api.post('/products/add', data);

      alert("¡Producto cargado con éxito!");

      // 4. Limpiar antes de navegar
      setFormData({ name: '', description: '', price: '', stock: '', category: '' });
      setFiles([]);

      // 5. Ahora sí funcionará porque navigate está definido
      navigate('/admin');

    } catch (error) {
      console.error("Error al cargar:", error);
      // Solo mostramos error si la petición falló realmente
      alert(error.response?.data?.message || "Error al comunicarse con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Panel de Control Admin</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tu formulario intacto */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-emerald-700">Nuevo Producto</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="name" placeholder="Nombre" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
            <textarea name="description" placeholder="Descripción" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
            <div className="flex gap-4">
              <input type="number" name="price" placeholder="Precio" value={formData.price} onChange={handleChange} className="w-1/2 p-2 border rounded-lg" required />
              <input type="number" name="stock" placeholder="Stock" value={formData.stock} onChange={handleChange} className="w-1/2 p-2 border rounded-lg" required />
            </div>
            <input type="text" name="category" placeholder="Categoría" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded-lg" required />

            <div className="border-2 border-dashed border-gray-200 p-4 rounded-lg text-center">
              <input type="file" onChange={(e) => setFiles(e.target.files)} className="text-sm" multiple accept="image/*" required />
              {files.length > 0 && (
                <p className="mt-2 text-xs text-emerald-600 font-medium">
                  {files.length} imágenes seleccionadas
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50">
              {loading ? "Publicando..." : "🚀 Publicar Producto"}
            </button>
          </form>
        </div>

        {/* Sección de Reportes para el Admin */}
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 h-fit">
          <h2 className="font-bold text-emerald-800 mb-2">Reportes</h2>
          <p className="text-sm text-emerald-600 mb-4">Descargá el inventario completo en Excel.</p>
          <button
            onClick={handleExportExcel}
            className="bg-white text-emerald-700 border border-emerald-700 px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 hover:text-white transition"
          >
            Descargar Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;