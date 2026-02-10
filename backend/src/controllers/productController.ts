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

    for (const file of images) { // El orden lo determina el orden de llegada
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

const updateProduct = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Si req.body es undefined aquí, es culpa de la ruta (paso 2)
    const { name, price, stock, description, existingImages } = req.body;
    const files = req.files as Express.Multer.File[];

    // Parseamos las imágenes que el admin decidió conservar
    let updatedImages: string[] = JSON.parse(existingImages || "[]");

    // Si hay fotos nuevas, las subimos
    if (files && files.length > 0) {
      for (const file of files) {
        const result: any = await uploadToCloudinary(file.buffer);
        updatedImages.push(result.secure_url);
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        price: Number(price),
        stock: Number(stock),
        description,
        image: updatedImages
      },
      { new: true }
    );

    res.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
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

const importProducts = async (req: Request, res: Response) => {
  try {
    const products = req.body; // El array de objetos que mandamos desde el front

    for (const item of products) {
      // Usamos findOneAndUpdate con upsert: true
      // Si encuentra el producto por el nombre (o ID), lo actualiza. 
      // Si no existe, lo crea.
      await Product.findOneAndUpdate(
        { name: item.name }, // Criterio de búsqueda
        {
          price: Number(item.price),
          stock: Number(item.stock),
          description: item.description,
          category: item.category,
          // Si el Excel no tiene imagen, podrías dejar una por defecto
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ message: "Importación exitosa" });
  } catch (error) {
    res.status(500).json({ message: "Error al importar datos" });
  }
};
export { getProducts, addProduct, updateProduct, deleteProduct, getProductById, importProducts };