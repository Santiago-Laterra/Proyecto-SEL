import { Router } from 'express';
import { getProducts, addProduct, updateProduct, deleteProduct, getProductById } from '../controllers/productController';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware';
import { upload } from "../config/cloudinary";
import { exportProductsToExcel, getAllOrders, deleteOrder } from '../controllers/adminController';
import { notify } from '../controllers/authController';

const router = Router();

// Solo el admin puede descargar este archivo
router.get('/export-excel', authMiddleware, isAdmin, exportProductsToExcel);


// Ruta pública: Cualquiera puede ver los productos
router.get('/', getProducts);
router.get('/orders', authMiddleware, isAdmin, getAllOrders);

router.delete('/orders/:id', authMiddleware, isAdmin, deleteOrder);

// Rutas protegidas: Solo el Admin con un Token válido puede entrar
router.put('/:id', authMiddleware, isAdmin, upload.array('image', 5), updateProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);
router.put('/orders/:id/shipping', authMiddleware, isAdmin, notify);

// Lo aplicas solo en la ruta de creación (POST)
router.post("/add", upload.array('image', 5), addProduct);

router.get('/:id', getProductById);

export default router;