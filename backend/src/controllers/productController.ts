import { Request, Response } from 'express';
import { Product } from '../model/productModel';
import { productSchema } from '../validator/productValidator';
import { uploadToCloudinary } from '../config/cloudinary';

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

    // 2. Validar con los datos ya convertidos
    const validation = productSchema.safeParse(dataToValidate);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Datos inválidos",
        errors: validation.error.format()
      });
    }

    // 3. Verificar que el archivo de imagen exista
    if (!req.file) {
      return res.status(400).json({ message: "La imagen es obligatoria" });
    }

    // 4. Subir la imagen a Cloudinary usando el Buffer
    const result: any = await uploadToCloudinary(req.file.buffer);
    const imageUrl = result.secure_url;

    // 4. Crear y guardar el producto en MongoDB
    const newProduct = new Product({
      ...req.body, // Trae name, price, description, etc.
      image: imageUrl // Agrega la URL que nos dio Cloudinary
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

export { getProducts, addProduct, updateProduct, deleteProduct };