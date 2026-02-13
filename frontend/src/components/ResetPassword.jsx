import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
  const { token } = useParams(); // Captura el token de la URL
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Llamamos a la ruta de backend que creamos antes
      await api.post(`/auth/reset-password/${token}`, { password });
      setMessage("¡Contraseña actualizada! Redirigiendo al login...");
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setMessage("El link expiró o es inválido.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md w-full text-center">
        <h2 className="font-serif text-3xl mb-4">Nueva Contraseña</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="password"
            placeholder="Ingresa tu nueva contraseña"
            className="w-full border-b border-slate-200 py-3 outline-none focus:border-slate-900 transition-colors"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="w-full bg-slate-900 text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all">
            Actualizar Contraseña
          </button>
        </form>
        {message && <p className="mt-6 text-xs text-slate-900 font-medium">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;