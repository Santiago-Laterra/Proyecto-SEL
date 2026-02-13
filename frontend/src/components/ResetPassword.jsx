import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
  const { token } = useParams(); // Captura el token de la URL
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setMessage("Las contraseñas no coinciden.");
    }

    try {
      // Enviamos el token y la nueva contraseña al backend
      await api.post(`/auth/reset-password/${token}`, { password });
      setMessage("¡Contraseña actualizada con éxito! Redirigiendo al login...");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setMessage("El link es inválido o ha expirado.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Nueva Contraseña</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input
          type="password"
          placeholder="Nueva contraseña"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          className="border p-2 rounded"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-black text-white p-2 rounded">
          Guardar Cambios
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default ResetPassword;