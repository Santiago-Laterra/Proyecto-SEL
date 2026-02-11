import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../model/userModel';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const SECRET_KEY = process.env.JWT_SECRET;

  // 1. Validación de la configuración
  if (!SECRET_KEY) {
    return res.status(500).json({ success: false, message: "Error de configuración del servidor" });
  }

  // 2. Validar formato del Header
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: "Token requerido (formato Bearer)" });
  }

  const token = header.split(" ")[1];

  try {
    // 3. PRIMERO VERIFICAMOS EL TOKEN
    // Si el token es inválido o expiró, saltará directamente al catch
    const decoded = jwt.verify(token, SECRET_KEY) as any;

    // 4. LUEGO BUSCAMOS AL USUARIO EN LA BD
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "Usuario no encontrado" });
    }

    // 5. COMPROBACIÓN DE SESIÓN ÚNICA
    // Si el ID de sesión del token no es el mismo que el guardado en la BD...
    if (user.lastSessionId !== decoded.sessionId) {
      return res.status(401).json({
        success: false,
        message: "Tu sesión ha sido iniciada en otro dispositivo.",
        code: "SESSION_EXPIRED"
      });
    }

    // 6. Si todo está ok, inyectamos el usuario en la req
    (req as any).user = decoded;
    next();

  } catch (error: any) {
    // 7. Manejo de errores de JWT
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "El token ha expirado" });
    }
    return res.status(401).json({ success: false, message: "Token inválido o error de sesión" });
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  // Debug para ver en consola qué llega
  console.log("Usuario en Middleware:", req.user);

  if (req.user && req.user.email === process.env.ADMIN_EMAIL) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Acceso denegado: No eres el administrador de SeloYah"
  });
};

export { authMiddleware, isAdmin }