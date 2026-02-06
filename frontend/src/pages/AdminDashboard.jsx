import { useEffect, useState } from 'react';
import api from '../services/api';
import { Pencil, Trash2, Plus, FileSpreadsheet, X, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  // Estados para Edición
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
      const token = localStorage.getItem('token');
      const response = await api.get('/products/export-excel', {
        responseType: 'blob',
        headers: { 'Authorization': `Bearer ${token}` }
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
      alert("Error al descargar el Excel.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás segura de que querés borrar este producto?")) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/products/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
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
      const token = localStorage.getItem('token');
      await api.put(`/products/${editingProduct._id}`,
        { name: editName, price: editPrice },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      alert("Error al actualizar");
    }
  };



  return (
    <div className="p-8 bg-gray-50 min-h-screen pt-28">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h1 className="text-2xl font-serif text-slate-800">Panel de Administración</h1>
            <p className="text-sm text-slate-500">Gestioná el inventario de SeloYah</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-all"
            >
              <Plus size={18} /> Nuevo Producto
            </button>
            <button onClick={handleExportExcel} className="flex items-center gap-2 border border-emerald-600 text-emerald-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-all">
              <FileSpreadsheet size={18} /> Exportar Excel
            </button>
          </div>
        </div>

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
                      <button onClick={() => openEditModal(product)} className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg">
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
    </div>
  );
};

export default AdminDashboard;