import { Request, Response } from 'express';
import { Product } from '../model/productModel';
import { productSchema } from '../validator/productValidator'


const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener productos", error });
  }
};


const addProduct = async (req: Request, res: Response) => {
  try {
    // Validar con Zod antes de tocar la DB
    const validation = productSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: validation.error.issues
      });
    }

    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ message: "Producto creado con éxito", newProduct });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el producto", error });
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