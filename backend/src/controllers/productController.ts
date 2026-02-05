import { Request, Response } from 'express';
import { Product } from '../model/productModel';
import { productSchema } from '../validator/productValidator';
import { uploadToCloudinary } from '../config/cloudinary';
import * as ExcelJS from 'exceljs';

const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener productos", error });
  }
};

const addProduct = async (req: any, res: any) => {
  try {
    // 1. Convertir strings a números para que Zod no se queje
    const dataToValidate = {
      ...req.body,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
    };

    // 2. Validar con Zod
    const validation = productSchema.safeParse(dataToValidate);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Datos inválidos",
        errors: validation.error.format()
      });
    }

    // 3. Verificar imagen
    if (!req.file) {
      return res.status(400).json({ message: "La imagen es obligatoria" });
    }

    // 4. Subir a Cloudinary (Esto ya te da la URL limpia)
    const result: any = await uploadToCloudinary(req.file.buffer);
    const imageUrl = result.secure_url;

    // 5. Crear el producto usando los datos LIMPIOS de Zod
    const newProduct = new Product({
      // USAMOS validation.data en lugar de req.body
      // Esto asegura que price sea número y los strings estén trimeados si tu schema lo hace
      ...validation.data,
      image: imageUrl // La URL segura de Cloudinary sin espacios
    });

    await newProduct.save();

    res.status(201).json({
      message: "Producto creado con éxito en SeloYah",
      product: newProduct
    });

  } catch (error: any) {
    console.error("Error en addProduct:", error);
    res.status(500).json({ message: "Error al crear el producto", error: error.message });
  }
};

const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: "Producto no encontrado" });
    res.status(200).json({ message: "Producto actualizado", updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar", error });
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) return res.status(404).json({ message: "Producto no encontrado" });
    res.status(200).json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar", error });
  }
};


const exportProductsExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find(); // Trae los datos de MongoDB

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Stock SeloYah');

    // Definimos las columnas
    worksheet.columns = [
      { header: 'ID del Producto', key: '_id', width: 30 },
      { header: 'Nombre', key: 'name', width: 30 },
      { header: 'Precio', key: 'price', width: 15 },
      { header: 'Categoría', key: 'category', width: 20 },
      { header: 'Stock Actual', key: 'stock', width: 15 }
    ];

    // Agregamos las filas
    products.forEach(product => {
      worksheet.addRow({
        _id: product._id.toString(),
        name: product.name,
        price: product.price,
        category: product.category,
        stock: product.stock
      });
    });

    // Configuramos los headers para la descarga
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=inventario_seloyah.xlsx');

    await workbook.xlsx.write(res);
    res.status(200).end();

  } catch (error) {
    console.error("Error al exportar:", error);
    res.status(500).json({ message: "Error al generar el archivo Excel" });
  }
};

export { getProducts, addProduct, updateProduct, deleteProduct, exportProductsExcel };