import { Router } from 'express';
import { getProducts, addProduct, updateProduct, deleteProduct, getProductById } from '../controllers/productController';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware';
import { upload } from "../config/cloudinary";
import { exportProductsToExcel, getAllOrders } from '../controllers/adminController';

const router = Router();

// Solo el admin puede descargar este archivo
router.get('/export-excel', authMiddleware, isAdmin, exportProductsToExcel);

// Ruta pública: Cualquiera puede ver los productos
router.get('/', getProducts);
router.get('/:id', getProductById);


// Rutas protegidas: Solo el Admin con un Token válido puede entrar
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);
router.get('/orders', authMiddleware, isAdmin, getAllOrders);

// Lo aplicas solo en la ruta de creación (POST)
router.post("/", authMiddleware, isAdmin, upload.single("image"), addProduct);



export default router;