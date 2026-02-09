import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentPending = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
    <Clock size={80} className="text-amber-500 mb-4 animate-pulse" />
    <h1 className="text-3xl font-serif text-slate-800 mb-2 text-center">Pago en Proceso</h1>
    <p className="text-slate-500 mb-8 text-center text-balance">Estamos esperando la confirmación de Mercado Pago. Te avisaremos apenas se acredite.</p>
    <Link to="/" className="text-slate-600 font-medium underline">Volver a la tienda</Link>
  </div>
);
export default PaymentPending;