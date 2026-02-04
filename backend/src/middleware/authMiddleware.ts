import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

  const header = req.headers.authorization;
  const SECRET_KEY = process.env.JWT_SECRET;


  //validacion de la secret_key, le asegura ts que no llega undefined
  if (!SECRET_KEY) {
    return res.status(500).json({ success: false, message: "Error de configuración del servidor" });
  }
  if (!header) {
    return res.status(401).json({ success: false, message: "El token es requerido" });
  }
  const [scheme, token] = header.split(" ");

  //validarmos si el formato es "Bearer" y si hay un token
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Formato de token inválido. Use Bearer <token>" });
  }


  // Validar el token en los headers

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

    try {
      // 4. Verificar el token
      const payload = jwt.verify(token, SECRET_KEY) as any;

      // Inyectamos el usuario en la req para usarlo después
      (req as any).user = payload;

      next();
    } catch (error: any) {
      // 5. Manejo de errores específicos como en tu otro proyecto
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, message: "El token expiró" });
      }
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ success: false, message: "Token inválido" });
      }

      res.status(401).json({ success: false, message: "Error al procesar el token" });
    }
  }
}
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user && (req as any).user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Acceso restringido: Solo para Administradores" });
  }
};

export { authMiddleware, isAdmin }