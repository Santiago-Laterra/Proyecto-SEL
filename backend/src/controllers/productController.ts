import { Request, Response } from 'express';
import { Product } from '../model/productModel';
import { productSchema } from '../validator/productValidator'
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
    let imageUrl = "";

    if (req.file) {
      // Subimos el buffer de la imagen a Cloudinary
      const result: any = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    // Luego guardas en la base de datos con imageUrl
    // ... resto de tu código de Mongoose
  } catch (error) {
    res.status(500).json({ message: "Error al subir imagen" });
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

export { getProducts, addProduct, updateProduct, deleteProduct }