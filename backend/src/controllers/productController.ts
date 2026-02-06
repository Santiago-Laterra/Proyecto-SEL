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


const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id); // O la lógica que uses para tu DB

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el producto", error });
  }
};

export { getProducts, addProduct, updateProduct, deleteProduct, getProductById };