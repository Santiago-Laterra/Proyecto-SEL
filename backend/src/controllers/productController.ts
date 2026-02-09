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
    const images = req.files as Express.Multer.File[];

    const dataToValidate = {
      ...req.body,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
    };

    const validation = productSchema.safeParse(dataToValidate);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Datos inválidos",
        errors: validation.error.format()
      });
    }

    if (!images || images.length === 0) {
      return res.status(400).json({ message: "Al menos una imagen es obligatoria" });
    }

    // --- CORRECCIÓN AQUÍ ---
    // 5. Subir imágenes secuencialmente para respetar el orden del Admin
    const imageUrls: string[] = []; // Array nuevo para las URLs limpias

    const sortedImages = images.sort((a, b) => a.originalname.localeCompare(b.originalname));

    for (const file of sortedImages) {
      const result: any = await uploadToCloudinary(file.buffer);
      imageUrls.push(result.secure_url);
    }
    // -----------------------

    // 6. Crear el producto usando el nuevo array de URLs
    const newProduct = new Product({
      ...validation.data,
      image: imageUrls // Ahora sí, solo URLs y en orden
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Producto creado con éxito en Soleyah",
      product: newProduct
    });

  } catch (error: any) {
    console.error("Error en addProduct:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear el producto",
      error: error.message
    });
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