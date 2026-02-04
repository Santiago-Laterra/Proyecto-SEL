import { Document } from 'mongoose';

//Document es una interfaz interna de Mongoose que trae todas las funciones "mágicas" que MongoDB le da a un registro automáticamente.

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'client'; // Esto evita que pongas cualquier otro texto
  createdAt: Date;
}