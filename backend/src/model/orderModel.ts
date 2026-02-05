import mongoose, { Schema, Document } from 'mongoose';


export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;      // Quién compró
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  shippingAddress: {                  // Datos para la logística de la Admin
    street: string;
    number: string;
    city: string;                     // Ej: "Lugano"
    zipCode: string;
    notes?: string;                   // Ej: "Timbre que no anda" o "Dejar en portería"
  };
  shippingCost: number;               // Cuánto cobró por el envío
  totalAmount: number;                // Precio total (Productos + Envío)
  status: 'pending' | 'approved' | 'rejected'; // Estado del pago
  mpPreferenceId: string;             // Para rastrear con Mercado Pago
  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    title: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit_price: { type: Number, required: true }
  }],
  shippingAddress: {
    street: { type: String, required: true },
    number: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },
    notes: { type: String }
  },
  shippingCost: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  mpPreferenceId: { type: String }
}, { timestamps: true });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);