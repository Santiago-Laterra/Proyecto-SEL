import { Request, Response } from 'express';
import { Product } from '../model/productModel';
import * as XLSX from 'xlsx';
import { Order } from '../model/orderModel';

export const exportProductsToExcel = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().lean();

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No hay productos para exportar" });
    }

    const dataForExcel = products.map(p => ({
      "ID Interno": String(p._id),
      "Nombre del Producto": p.name,
      "Precio ($)": p.price,
      "Categoría": p.category || 'N/A',
      "Link de Imagen": p.image
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=DB_SeloYah.xlsx');

    return res.status(200).send(buffer);
  } catch (error: any) {
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    // Buscamos todas las órdenes y traemos los datos del usuario (name y email)
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pedidos", error });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    res.json({ message: "Orden eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar orden:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};