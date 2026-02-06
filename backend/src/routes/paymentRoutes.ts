import { Router } from 'express';
import { createPreference, receiveWebhook } from '../controllers/paymentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Protegemos la ruta: solo usuarios logueados pueden generar pagos
router.post('/create-preference', authMiddleware, createPreference);

// Ruta para el cálculo de envío
router.post('/shipping/calculate', (req, res) => {
  const { zipCode } = req.body;

  const cost = zipCode && zipCode.startsWith('1') ? 1500 : 3000;

  res.status(200).json({ cost });
});


//Publica para que mercado pago mande la notificacion
router.post('/webhook', receiveWebhook);

export default router;