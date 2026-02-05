import { Request, Response } from 'express';
import { User } from '../model/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'

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
        role: user.role // Esto permite que el Middleware de Admin funcione
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

export { register, login }