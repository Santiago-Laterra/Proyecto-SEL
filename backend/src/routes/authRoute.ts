import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { forgotPassword } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

export default router;