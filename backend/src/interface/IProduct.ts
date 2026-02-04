import { Document } from 'mongoose';

interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category?: string; // El '?' significa que es opcional
}


export default IProduct