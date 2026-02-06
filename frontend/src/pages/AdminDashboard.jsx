import { useEffect, useState } from 'react';
import api from '../services/api';
import { Pencil, Trash2, Plus, FileSpreadsheet, X } from 'lucide-react';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error("Error al traer productos:", error);
    }
  };

  const handleExportExcel = async () => {
    try {
      // Obtenemos el token del localStorage (asegurate que el nombre sea el mismo que usas al loguear)
      const token = localStorage.getItem('token');

      const response = await api.get('/products/export-excel', {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}` // ESTO ES LO QUE FALTA
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Inventario_SeloYah.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar:", error);
      alert("No tienes permisos o la sesión expiró. Volvé a loguear.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás segura de que querés borrar este producto?")) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        alert("No se pudo eliminar");
      }
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(product.price);
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/products/${editingProduct._id}`, {
        name: editName,
        price: editPrice
      });
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      alert("Error al actualizar");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen pt-28">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Cabecera del Dashboard */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h1 className="text-2xl font-serif text-slate-800">Panel de Administración</h1>
            <p className="text-sm text-slate-500">Gestioná tus calendarios y diseños</p>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-all">
              <Plus size={18} /> Nuevo Producto
            </button>

            {/* BOTÓN DE EXCEL ACTUALIZADO */}
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 border border-emerald-600 text-emerald-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-all active:scale-95"
            >
              <FileSpreadsheet size={18} /> Exportar Excel
            </button>
          </div>
        </div>

        {/* Tabla de Productos (Mismo código de antes...) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-slate-500 text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 font-semibold">Producto</th>
                <th className="px-6 py-4 font-semibold">Precio</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <img src={product.image} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                    <span className="font-medium text-slate-700">{product.name}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium italic">
                    {Number(product.price).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditModal(product)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edición (Mismo código de antes...) */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setEditingProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
              <X size={20} />
            </button>
            <h2 className="text-xl font-serif mb-6 text-slate-800">Editar Producto</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-slate-400 font-bold italic">Nombre del producto</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none transition-colors text-slate-700" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-slate-400 font-bold italic">Precio (ARS)</label>
                <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full border-b border-gray-200 py-2 focus:border-emerald-500 outline-none transition-colors text-slate-700" />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setEditingProduct(null)} className="flex-1 py-3 text-slate-500 font-medium hover:bg-gray-50 rounded-xl transition-all">Cancelar</button>
              <button onClick={handleUpdate} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;