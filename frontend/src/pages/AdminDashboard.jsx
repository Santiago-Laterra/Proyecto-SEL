import { useEffect, useState } from 'react';
import api from '../services/api';
import { Pencil, Trash2, Plus, FileSpreadsheet, X, Package, ShoppingBag, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const AdminDashboard = () => {
  // 1. ESTADOS PRINCIPALES
  const [activeTab, setActiveTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  // 2. ESTADOS DE EDICIÓN (PRODUCTOS)
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editImages, setEditImages] = useState([]); // URLs existentes
  const [newFiles, setNewFiles] = useState([]);





  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  // 3. CARGA DE DATOS
  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error("Error al traer productos:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/orders');
      setOrders(res.data);
    } catch (err) {
      console.error("Error cargando pedidos", err);
    } finally {
      setLoading(false);
    }
  };

  // 4. LÓGICA DE FILTRADO
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter; // 'paid', 'pending', 'rejected', 'cancelled'
  });

  // 5. EXPORTACIÓN A EXCEL (ADAPTATIVA)
  const exportOrdersToExcel = () => {
    if (filteredOrders.length === 0) return alert("No hay órdenes para exportar");

    const dataToExport = filteredOrders.map(order => ({
      ID_Pedido: order._id,
      Fecha: new Date(order.createdAt).toLocaleDateString(),
      Cliente: order.user?.name || 'Invitado',
      Email: order.user?.email || 'N/A',
      Total: order.totalAmount,
      Envio: order.shippingCost,
      // Mapeo amigable para el Excel
      Estado: order.status === 'paid' ? 'PAGADO' :
        order.status === 'pending' ? 'PENDIENTE' :
          order.status === 'rejected' ? 'RECHAZADO' : 'CANCELADO',
      Direccion: `${order.shippingAddress?.street} ${order.shippingAddress?.number}, ${order.shippingAddress?.city}`
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas SeloYah");

    const fileName = `Reporte_Ventas_${filter.toUpperCase()}_${new Date().toLocaleDateString()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // 6. ACCIONES DE PRODUCTOS
  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(product.price);
    setEditStock(product.stock || 0);
    setEditDescription(product.description || "");
    setEditImages(Array.isArray(product.image) ? product.image : [product.image]);
    setNewFiles([]); // Reset de archivos nuevos
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const data = new FormData();
      data.append('name', editName);
      data.append('price', editPrice);
      data.append('stock', editStock);
      data.append('description', editDescription);

      // Mandamos las fotos que el admin decidió conservar
      data.append('existingImages', JSON.stringify(editImages));

      // Mandamos las fotos nuevas si las hay
      newFiles.forEach(file => data.append('image', file));

      const token = localStorage.getItem('token');
      await api.put(`/products/${editingProduct._id}`, data, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setEditingProduct(null);
      fetchProducts();
      alert("¡Producto actualizado con éxito! 🚀");
    } catch (error) {
      alert("Error al actualizar");
    } finally {
      setLoading(false);
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

  // 7. ACCIONES DE VENTAS
  const handleDeleteOrder = async (id) => {
    if (window.confirm("¿Estás segura de eliminar esta orden? No aparecerá más en el historial.")) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/products/orders/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchOrders();
      } catch (error) {
        alert("Error al eliminar orden");
      }
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen pt-28">
      <div className="max-w-6xl mx-auto">

        {/* Selector de Pestañas */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'products' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-gray-100'}`}
          >
            <Package size={18} /> Productos
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'orders' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-gray-100'}`}
          >
            <ShoppingBag size={18} /> Ventas {orders.length > 0 && <span className="bg-emerald-500 text-white text-[10px] px-1.5 rounded-full ml-1">{orders.length}</span>}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Dinámico */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <div>
              <h1 className="text-2xl font-serif text-slate-800">
                {activeTab === 'products' ? 'Gestión de Inventario' : 'Control de Ventas'}
              </h1>
              <p className="text-sm text-slate-500">
                {activeTab === 'products' ? 'Administrá tus calendarios y diseños' : 'Revisá quién compró y gestioná los pedidos'}
              </p>
            </div>
            <div className="flex gap-3">
              {activeTab === 'products' ? (
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-all">
                  <Plus size={18} /> Nuevo Producto
                </button>
              ) : (
                <button onClick={exportOrdersToExcel} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all">
                  <FileSpreadsheet size={18} /> Descargar {filter === 'all' ? 'Todas' : filter === 'paid' ? 'Pagadas' : 'Pendientes'} (.xlsx)
                </button>
              )}
            </div>
          </div>

          {/* Filtros de Estado (Solo visibles en Ventas) */}
          {activeTab === 'orders' && (
            <div className="flex flex-wrap gap-3 p-6 bg-gray-50/50 border-b border-gray-100">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-gray-200'}`}
              >
                Todas ({orders.length})
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === 'paid' ? 'bg-[#007f5f] text-white' : 'bg-white text-slate-500 border border-gray-200'}`}
              >
                Pagadas ({orders.filter(o => o.status === 'paid').length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === 'pending' ? 'bg-amber-500 text-white' : 'bg-white text-slate-500 border border-gray-200'}`}
              >
                Pendientes ({orders.filter(o => o.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-white text-slate-500 border border-gray-200'}`}
              >
                Rechazadas/Fallas ({orders.filter(o => o.status === 'rejected' || o.status === 'cancelled').length})
              </button>
            </div>
          )}

          {/* Contenido de la Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              {activeTab === 'products' ? (
                <>
                  <thead className="bg-gray-50 text-slate-500 text-xs uppercase tracking-widest border-b border-gray-100">
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
                          <img src={Array.isArray(product.image) ? product.image[0] : product.image} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                          <span className="font-medium text-slate-700">{product.name}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium italic">
                          {Number(product.price).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEditModal(product)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Pencil size={18} /></button>
                            <button onClick={() => handleDelete(product._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              ) : (
                <>
                  <thead className="bg-gray-50 text-slate-500 text-xs uppercase tracking-widest border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Cliente / ID</th>
                      <th className="px-6 py-4 font-semibold">Monto Total</th>
                      <th className="px-6 py-4 font-semibold">Estado</th>
                      <th className="px-6 py-4 font-semibold">Fecha</th>
                      <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-700">{order.user?.name || 'Invitado'}</div>
                            <div className="text-[10px] text-slate-400 font-mono uppercase">{order._id.slice(-8)}...</div>
                          </td>
                          <td className="px-6 py-4 text-slate-900 font-bold">
                            ${order.totalAmount.toLocaleString('es-AR')}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider ${order.status === 'paid' ? 'bg-green-100 text-green-700' :
                              order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                              {order.status === 'paid' ? 'PAGADO' :
                                order.status === 'pending' ? 'PENDIENTE' :
                                  order.status === 'rejected' ? 'FALLIDO' : 'CANCELADO'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteOrder(order._id)}
                              className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Eliminar orden"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic text-sm">
                          No se encontraron órdenes en esta categoría.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL DE EDICIÓN --- */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-999 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Fijo */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-2xl font-serif text-slate-800">Editar Producto</h2>
              <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                <X size={24} />
              </button>
            </div>

            {/* Contenido con Scroll Propio */}
            <div className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border-b-2 py-2 outline-none focus:border-emerald-500 transition-colors bg-transparent text-slate-700 font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Precio</label>
                    <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full border-b-2 py-2 outline-none focus:border-emerald-500 transition-colors bg-transparent" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Stock</label>
                    <input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} className="w-full border-b-2 py-2 outline-none focus:border-emerald-500 transition-colors bg-transparent" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-xl p-3 mt-2 outline-none focus:border-emerald-500 h-28 resize-none text-sm text-slate-600 leading-relaxed"
                  placeholder="Escribí una descripción matadora..."
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Galería de Imágenes</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-3">
                  {editImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square group">
                      <img src={img} className="w-full h-full object-cover rounded-xl border border-gray-100 shadow-sm" />
                      <button
                        onClick={() => setEditImages(editImages.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-gray-200 flex flex-col items-center justify-center rounded-xl cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all text-gray-400 hover:text-emerald-500">
                    <Plus size={24} />
                    <span className="text-[9px] font-bold uppercase mt-1">Subir</span>
                    <input type="file" className="hidden" multiple onChange={(e) => setNewFiles([...newFiles, ...e.target.files])} />
                  </label>
                </div>
                {newFiles.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full text-[10px] font-bold">
                    <RefreshCw size={12} className="animate-spin" />
                    {newFiles.length} FOTOS NUEVAS LISTAS
                  </div>
                )}
              </div>
            </div>

            {/* Footer Fijo */}
            <div className="p-6 border-t border-gray-50 bg-gray-50/50 flex gap-3">
              <button onClick={() => setEditingProduct(null)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">
                Descartar
              </button>
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl shadow-xl hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Actualizar Producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminDashboard;