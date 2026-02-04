import { Request, Response } from 'express';
import { Product } from '../model/productModel';
import * as XLSX from 'xlsx';

const exportProductsToExcel = async (req: Request, res: Response) => {
  try {
    // 1. Traemos todos los productos actuales de la DB
    const products: any[] = await Product.find().lean();

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No hay productos para exportar" });
    }

    // 2. Mapeamos los datos para que el Excel tenga nombres de columnas bonitos
    const dataForExcel = products.map(p => ({
      "ID Interno": p._id,
      "Nombre del Producto": p.name,
      "Descripción": p.description,
      "Precio ($)": p.price,
      "Stock Disponible": p.stock,
      "Categoría": p.category,
      "Link de Imagen": p.image,
      "Fecha de Creación": p.createdAt
    }));

    // 3. Creamos el libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos SeloYah");

    // 4. Generamos un Buffer (el archivo en memoria)
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 5. Configuramos los headers para que el navegador/Bruno entienda que es un archivo
    res.setHeader('Content-Disposition', 'attachment; filename=DB_SeloYah_Productos.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    return res.send(buffer);

  } catch (error: any) {
    console.error("Error al exportar Excel:", error);
    res.status(500).json({ message: "Error al generar el Excel", error: error.message });
  }
};


export { exportProductsToExcel }