import { useEffect, useState } from 'react';
import api from '../services/api';
import { Pencil, Trash2, Plus, FileSpreadsheet, X, Package, ShoppingBag, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editImages, setEditImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

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

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const exportOrdersToExcel = () => {
    if (filteredOrders.length === 0) return alert("No hay órdenes para exportar");
    const dataToExport = filteredOrders.map(order => ({
      ID_Pedido: order._id,
      Fecha: new Date(order.createdAt).toLocaleDateString(),
      Cliente: order.user?.name || 'Invitado',
      Email: order.user?.email || 'N/A',
      Total: order.totalAmount,
      Envio: order.shippingCost,
      Estado: order.status === 'paid' ? 'PAGADO' : order.status === 'approved' ? 'PAGADO' : order.status === 'pending' ? 'PENDIENTE' : 'FALLIDO',
      Direccion: `${order.shippingAddress?.street} ${order.shippingAddress?.number}, ${order.shippingAddress?.city}`
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");
    XLSX.writeFile(workbook, `Ventas_${filter}.xlsx`);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(product.price);
    setEditStock(product.stock || 0);
    setEditDescription(product.description || "");
    setEditImages(Array.isArray(product.image) ? product.image : [product.image]);
    setNewFiles([]);
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este registro de venta?")) {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        // Usamos la ruta de órdenes, no la de productos
        await api.delete(`/products/orders/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // Actualizamos la lista local eliminando la orden borrada
        setOrders(orders.filter(order => order._id !== id));
        alert("Orden eliminada correctamente");
      } catch (error) {
        console.error("Error al borrar orden:", error);
        alert("No se pudo eliminar la orden. Revisa los permisos del admin.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleShippingChange = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await api.put(`/products/orders/${orderId}/shipping`,
        { newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setOrders(orders.map(o => o._id === orderId ? { ...o, shippingStatus: newStatus } : o));
      if (newStatus === 'Despachado') {
        alert("¡Pedido despachado! Mail enviado.");
      }
    } catch (error) {
      alert("Error al actualizar envío.");
    } finally {
      setLoading(false);
    }
  };


  const handleUpdate = async () => {
    try {
      setLoading(true);
      const data = new FormData();
      data.append('name', editName);
      data.append('price', editPrice);
      data.append('stock', editStock);
      data.append('description', editDescription);
      data.append('existingImages', JSON.stringify(editImages));
      newFiles.forEach(file => data.append('image', file));

      const token = localStorage.getItem('token');
      await api.put(`/products/${editingProduct._id}`, data, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setEditingProduct(null);
      fetchProducts();
      alert("¡Actualizado!");
    } catch (error) {
      alert("Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Borrar producto?")) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/products/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        fetchProducts();
      } catch (error) { alert("Error"); }
    }
  };

  return (
    /* pt-28 para dejar espacio al Header y pb-20 para el scroll final */
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen pt-28 pb-20">
      <div className="max-w-6xl mx-auto">

        {/* Selector de Pestañas */}
        <div className="flex gap-2 md:gap-4 mb-6 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${activeTab === 'products' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-gray-100'}`}
          >
            <Package size={18} /> Productos
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${activeTab === 'orders' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-gray-100'}`}
          >
            <ShoppingBag size={18} /> Ventas {orders.length > 0 && <span className="bg-emerald-500 text-white text-[10px] px-1.5 rounded-full ml-1">{orders.length}</span>}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Dinámico */}
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-white gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {activeTab === 'products' ? 'Gestión de Inventario' : 'Control de Ventas'}
              </h1>
              <p className="text-sm text-slate-500">
                {activeTab === 'products' ? 'Administrá tus productos' : 'Gestioná tus pedidos recibidos'}
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              {activeTab === 'products' ? (
                <button onClick={() => navigate('/dashboard')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700">
                  <Plus size={18} /> Nuevo Producto
                </button>
              ) : (
                <button onClick={exportOrdersToExcel} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700">
                  <FileSpreadsheet size={18} /> Exportar Excel
                </button>
              )}
            </div>
          </div>

          {/* Filtros de Ventas */}
          {activeTab === 'orders' && (
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50/50 border-b border-gray-100">
              {['all', 'paid', 'pending', 'rejected'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-gray-200'}`}
                >
                  {f === 'all' ? 'Todas' : f === 'paid' ? 'Pagadas' : f === 'pending' ? 'Pendientes' : 'Fallidas'}
                </button>
              ))}
            </div>
          )}

          {/* Tabla con Scroll Horizontal */}
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-150">
              <thead className="bg-gray-50 text-slate-400 text-[10px] uppercase tracking-[0.2em] border-b">
                <tr>
                  {activeTab === 'products' ? (
                    <>
                      <th className="px-6 py-4 font-black">Producto</th>
                      <th className="px-6 py-4 font-black">Precio</th>
                      <th className="px-6 py-4 font-black">Stock</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 font-black">Cliente / ID</th>
                      <th className="px-6 py-4 font-black">Total</th>
                      <th className="px-6 py-4 font-black">Pago</th>
                      <th className="px-6 py-4 font-black">Estado Envío</th>
                    </>
                  )}
                  <th className="px-6 py-4 font-black text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeTab === 'products' ? (
                  products.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img src={Array.isArray(p.image) ? p.image[0] : p.image} alt="" className="w-10 h-10 rounded object-cover shadow-sm" />
                        <span className="font-medium text-slate-700 text-sm">{p.name}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">${p.price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{p.stock}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => openEditModal(p)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"><Pencil size={18} /></button>
                        <button onClick={() => handleDelete(p._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50/50 border-b border-gray-100 last:border-0">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-md border border-red-100 uppercase tracking-tighter">
                            {o.orderNumber || 'S/N'}
                          </span>
                          <div className="text-sm font-bold text-slate-800">{o.user?.name || 'Invitado'}</div>
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono tracking-widest pl-1">ID: ...{o._id.slice(-6)}</div>
                      </td>

                      <td className="px-6 py-4 text-sm font-black text-slate-900">${o.totalAmount.toLocaleString()}</td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest ${o.status === 'approved' || o.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                          {o.status === 'approved' || o.status === 'paid' ? 'APROBADO' : 'PENDIENTE'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="relative group">
                          <select
                            value={o.shippingStatus || 'Por empaquetar'}
                            onChange={(e) => handleShippingChange(o._id, e.target.value)}
                            disabled={loading}
                            className={`appearance-none cursor-pointer pl-3 pr-8 py-1.5 rounded-lg text-[10px] font-bold border transition-all duration-300 outline-none ${o.shippingStatus === 'Despachado' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                                o.shippingStatus === 'Empaquetado' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                                  'bg-amber-50 border-amber-200 text-amber-600'
                              }`}
                          >
                            <option value="Por empaquetar">📦 POR EMPAQUETAR</option>
                            <option value="Empaquetado">🎁 EMPAQUETADO</option>
                            <option value="Despachado">🚚 DESPACHADO</option>
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteOrder(o._id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL DE EDICIÓN CORREGIDO --- */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-1000 flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Editar Producto</h2>
              <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nombre</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border-b py-2 outline-none focus:border-emerald-500" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Precio</label>
                    <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full border-b py-2 outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Stock</label>
                    <input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} className="w-full border-b py-2 outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Descripción</label>
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full border rounded-lg p-2 mt-1 h-24 resize-none text-sm" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Imágenes</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {editImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square">
                      <img src={img} className="w-full h-full object-cover rounded-lg border" />
                      <button onClick={() => setEditImages(editImages.filter((_, i) => i !== idx))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={10} /></button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-gray-200 flex flex-col items-center justify-center rounded-lg cursor-pointer hover:bg-gray-50 text-gray-400">
                    <Plus size={20} />
                    <input type="file" className="hidden" multiple onChange={(e) => setNewFiles([...newFiles, ...e.target.files])} />
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t flex gap-3">
              <button onClick={() => setEditingProduct(null)} className="flex-1 py-2.5 font-bold text-slate-500">Cancelar</button>
              <button onClick={handleUpdate} disabled={loading} className="flex-1 py-2.5 bg-slate-800 text-white font-bold rounded-lg disabled:opacity-50">
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;