import { Request, Response } from 'express';
import { User } from '../model/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import crypto from 'crypto';
import { sendResetEmail } from '../services/emailServices';


const register = async (req: Request, res: Response) => {

  try {
    const { name, email, password } = req.body

    //usuario ya existe?
    const exist = await User.findOne({ email })
    if (exist) {
      return res.status(400).json({ message: "User already exist" })
    }

    //encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Asignar rol de Admin automáticamente si el email coincide con el del .env
    const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'client';


    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();
    res.status(201).json({ message: `Usuario ${role} creado con éxito`, data: { name, email, role } });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
}

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. ¿El usuario existe?
    const user = await User.findOne({ email });
    if (!user) {
      // Usamos un mensaje genérico por seguridad (opcional)
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // 2. ¿La contraseña es correcta?
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }


    // Generamos un ID de sesión único para este login
    const sessionId = Math.random().toString(36).substring(7);
    user.lastSessionId = sessionId;
    await user.save();


    // 3. Creación del Token (JWT)
    // Asegúrate de tener JWT_SECRET en tu archivo .env
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET no está definido en las variables de entorno");
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role, sessionId // Esto permite que el Middleware de Admin funcione
      },
      secret,
      { expiresIn: '24h' } // 1 día de sesión
    );

    // 4. Respuesta exitosa
    res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role // Esto es lo que lee el AuthContext de React
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // 1. Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
      // Por seguridad, a veces es mejor decir que se envió el mail 
      // incluso si no existe, para no dar pistas a hackers.
      res.status(404).json({ message: "No existe un usuario con ese correo." });
      return;
    }

    // 2. Generar un token aleatorio
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 3. Hashear el token y guardarlo (opcional, pero más seguro) 
    // o guardarlo tal cual con una expiración de 1 hora
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora desde ahora

    await user.save();

    // 4. Enviar el mail (esto lo haremos en el paso 2)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    console.log("Token generado:", resetToken); // Solo para pruebas
    await sendResetEmail(user.email, resetUrl);

    res.status(200).json({ message: "Link de recuperación enviado al correo." });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params; // El token vendrá en la URL
    const { password } = req.body;

    // 1. Buscar al usuario que tenga ese token y que no haya expirado
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }, // $gt significa "greater than" (mayor que ahora)
    });

    if (!user) {
      res.status(400).json({ message: "El token es inválido o ha expirado." });
      return;
    }

    // 2. Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 3. Limpiar los campos de recuperación
    (user as any).resetPasswordToken = null;
    (user as any).resetPasswordExpires = null;

    await user.save();

    res.status(200).json({ message: "Contraseña actualizada con éxito. Ya puedes iniciar sesión." });
  } catch (error) {
    res.status(500).json({ message: "Error al restablecer la contraseña.", error });
  }
};

export { register, login, forgotPassword, resetPassword }