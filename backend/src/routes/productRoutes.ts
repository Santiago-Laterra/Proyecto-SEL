import { Router } from 'express';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware';
import { upload } from "../config/cloudinary";
const router = Router();

// Ruta pública: Cualquiera puede ver los productos
router.get('/', getProducts);

// Rutas protegidas: Solo el Admin con un Token válido puede entrar
// Lo aplicas solo en la ruta de creación (POST)
router.post("/", authMiddleware, isAdmin, upload.single("image"), addProduct);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);




export default router;