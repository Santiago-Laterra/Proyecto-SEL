import { Router } from 'express';
import { createPreference } from '../controllers/paymentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Protegemos la ruta: solo usuarios logueados pueden generar pagos
router.post('/create-preference', authMiddleware, createPreference);

export default router;