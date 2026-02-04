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

    // usuario existe ya? 
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // validar la contraseña, es correcta? 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // creacion de token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email, // <--- ESTA ES LA LÍNEA CLAVE QUE AGREGAMOS
        role: user.role
      },
      process.env.JWT_SECRET as string, // Usamos 'as string' para que TS no chille
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: "Login exitoso",
      token,
      user: { name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

export { register, login }