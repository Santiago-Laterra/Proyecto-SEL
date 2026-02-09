import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
    <CheckCircle size={80} className="text-emerald-500 mb-4 animate-bounce" />
    <h1 className="text-3xl font-serif text-slate-800 mb-2 text-center">¡Gracias por tu compra!</h1>
    <p className="text-slate-500 mb-8 text-center text-balance">Tu pedido ha sido procesado con éxito. Pronto recibirás un correo con los detalles.</p>
    <Link to="/" className="bg-slate-800 text-white px-8 py-3 rounded-full font-medium hover:bg-slate-700 transition-all shadow-lg">
      Volver al Inicio
    </Link>
  </div>
);

export default PaymentSuccess;