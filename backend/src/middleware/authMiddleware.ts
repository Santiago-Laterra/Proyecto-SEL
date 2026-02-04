import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const SECRET_KEY = process.env.JWT_SECRET;

  // 1. Validación de la secret_key
  if (!SECRET_KEY) {
    return res.status(500).json({ success: false, message: "Error de configuración del servidor" });
  }

  // 2. Validar que exista el header y tenga el formato Bearer
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: "El token es requerido y debe ser formato Bearer" });
  }

  const token = header.split(" ")[1];

  try {
    // 3. Verificar el token
    const payload = jwt.verify(token, SECRET_KEY) as any;

    // 4. Inyectamos el usuario en la req
    // Esto es lo que permite que isAdmin vea el email después
    (req as any).user = payload;

    next();
  } catch (error: any) {
    // 5. Manejo de errores específicos
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "El token expiró" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Token inválido" });
    }

    res.status(401).json({ success: false, message: "Error al procesar el token" });
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