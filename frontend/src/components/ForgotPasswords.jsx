import { useState } from 'react';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage("Si el correo coincide con una cuenta, recibirás un link de recuperación en breve.");
    } catch (err) {
      setMessage("Ocurrió un error. Inténtalo más tarde.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md w-full text-center">
        <h2 className="font-serif text-3xl mb-4">Recuperar Acceso</h2>
        <p className="text-slate-500 text-sm mb-8 font-light">
          Ingresa tu email y te enviaremos los pasos para restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="tu@email.com"
            className="w-full border-b border-slate-200 py-3 outline-none focus:border-slate-900 transition-colors"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="w-full bg-slate-900 text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all">
            Enviar Instrucciones
          </button>
        </form>

        {message && <p className="mt-6 text-xs text-emerald-600 font-medium italic">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;