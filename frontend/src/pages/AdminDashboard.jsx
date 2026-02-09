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
  const [editStock, setEditStock] = useState("");

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
    return order.status === filter;
  });

  // 5. EXPORTACIÓN A EXCEL (ADAPTATIVA)
  const exportOrdersToExcel = () => {
    if (filteredOrders.length === 0) return alert("No hay órdenes en esta categoría para exportar");

    const dataToExport = filteredOrders.map(order => ({
      ID_Pedido: order._id,
      Fecha: new Date(order.createdAt).toLocaleDateString(),
      Cliente: order.user?.name || 'Invitado',
      Email: order.user?.email || 'N/A',
      Total: order.totalAmount, // Valor real del backend
      Envio: order.shippingCost,
      Estado: order.status === 'paid' ? 'PAGADO' : 'PENDIENTE',
      Direccion: `${order.shippingAddress?.street} ${order.shippingAddress?.number}, ${order.shippingAddress?.city}`
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas SeloYah");

    const fileName = `Ventas_SeloYah_${filter.toUpperCase()}_${new Date().toLocaleDateString()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // 6. ACCIONES DE PRODUCTOS
  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(product.price);
    setEditStock(product.stock || 0);
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/products/${editingProduct._id}`,
        { name: editName, price: Number(editPrice), stock: Number(editStock) },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setEditingProduct(null);
      fetchProducts();
      alert("Producto actualizado correctamente ✨");
    } catch (error) {
      alert("Error al actualizar el producto");
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
            <div className="flex gap-4 p-6 bg-gray-50/50 border-b border-gray-100">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-500 border border-gray-200 hover:bg-gray-100'}`}
              >
                Todas ({orders.length})
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === 'paid' ? 'bg-[#007f5f] text-white shadow-sm' : 'bg-white text-slate-500 border border-gray-200 hover:bg-gray-100'}`}
              >
                Pagadas ({orders.filter(o => o.status === 'paid').length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === 'pending' ? 'bg-stone-900 text-white shadow-sm' : 'bg-white text-slate-500 border border-gray-200 hover:bg-gray-100'}`}
              >
                Pendientes ({orders.filter(o => o.status === 'pending').length})
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
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              {order.status === 'paid' ? 'PAGADO' : 'PENDIENTE'}
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-200 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setEditingProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-slate-800 transition-colors"><X size={24} /></button>
            <h2 className="text-2xl font-serif mb-6 text-slate-800">Editar Producto</h2>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nombre del producto</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border-b-2 py-2 outline-none focus:border-emerald-500 transition-colors bg-transparent" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Precio (ARS)</label>
                <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full border-b-2 py-2 outline-none focus:border-emerald-500 transition-colors bg-transparent" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Stock disponible</label>
                <input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} className="w-full border-b-2 py-2 outline-none focus:border-emerald-500 transition-colors bg-transparent" />
              </div>
            </div>
            <div className="flex gap-3 mt-10">
              <button onClick={() => setEditingProduct(null)} className="flex-1 py-3 text-slate-500 font-semibold hover:bg-gray-50 rounded-xl transition-colors">Cancelar</button>
              <button onClick={handleUpdate} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.98]">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminDashboard;