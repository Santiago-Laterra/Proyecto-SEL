import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { showAlert } from "../utils/alerts";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // 1. Extraemos el mensaje real del backend si existe
      const mensajeError = err.response?.data?.message || "Correo o contraseña incorrectos";

      // 3. Disparamos el Alert visual (Asegúrate de que showAlert esté bien importado)
      showAlert(
        "Error de acceso",
        mensajeError,
        "error"
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-semibold text-center text-gray-800 mb-2 font-serif">
          Inicia sesión
        </h1>
        <p className="text-center text-gray-500 mb-8 font-light text-sm">
          Introduce tus credenciales para acceder a Soleyah
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              required
            />
          </div>


          <div>
            <div className="flex justify-between mb-1">
              <label className="text-gray-700 text-sm font-medium">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                required
              />
              {/* LINK AQUÍ: Justo arriba del input de password, a la derecha (estilo moderno) */}
              <Link to="/forgot-password" size="sm" className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-4 rounded-full text-xs uppercase tracking-widest transition duration-300 flex items-center justify-center gap-2"
          >
            Entrar <span className="text-lg">→</span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-emerald-700 font-semibold hover:underline">
              Regístrate ahora
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;