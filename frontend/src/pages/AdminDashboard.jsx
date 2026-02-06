import { useEffect, useState } from 'react';
import api from '../services/api';
import { Pencil, Trash2, Plus, FileSpreadsheet } from 'lucide-react';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await api.get('/products');
    setProducts(res.data);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás segura de que querés borrar este producto?")) {
      await api.delete(`/products/${id}`);
      fetchProducts(); // Recargamos la lista
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
            <button className="flex items-center gap-2 border border-emerald-600 text-emerald-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-all">
              <FileSpreadsheet size={18} /> Exportar Excel
            </button>
          </div>
        </div>

        {/* Tabla de Productos */}
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
                <td className="px-6 py-4 text-slate-600 font-medium">
                  {Number(product.price).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Editar">
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar"
                    >
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
  );
};

export default AdminDashboard;