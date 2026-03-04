import mongoose, { Schema, Document } from 'mongoose';


export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  shippingAddress: {
    street: string;
    number: string;
    city: string;
    zipCode: string;
    notes?: string;
  };
  shippingCost: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  mpPreferenceId?: string; // Opcional porque se crea después
  // --- AGREGAR ESTO ---
  orderNumber: string;
  shippingStatus: 'Por empaquetar' | 'Empaquetado' | 'Despachado';
  phoneNumber: string;
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
  orderNumber: { type: String, unique: true },
  shippingStatus: {
    type: String,
    enum: ['Por empaquetar', 'Empaquetado', 'Despachado'],
    default: 'Por empaquetar'
  },
  phoneNumber: { type: String, required: true },
  shippingCost: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  mpPreferenceId: { type: String }
}, { timestamps: true });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);