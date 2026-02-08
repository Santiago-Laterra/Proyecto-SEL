import { Schema, model } from 'mongoose';

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: Array, required: true }, // Aquí guardaremos la URL de Cloudinary
  stock: { type: Number, default: 0 },
  category: { type: String }
});

export const Product = model('Product', productSchema);