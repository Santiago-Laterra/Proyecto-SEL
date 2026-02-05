import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useAuth(); // Nuestra función mágica del Contexto
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Intentamos loguear con los datos del formulario
      await login(email, password);

      // 2. Si el backend responde OK, el AuthContext guarda el token y el rol solo
      // 3. Redirigimos a la Home, donde ya aparecerá el botón de Excel si es Admin
      navigate('/');
    } catch (err) {
      // Si el backend tira 401 o 400, mostramos el error
      setError(typeof err === 'string' ? err : "Correo o contraseña incorrectos");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-semibold text-center text-gray-800 mb-2">
          Inicia sesión en tu cuenta
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Introduce tu dirección de correo electrónico y contraseña
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-md transition duration-200 flex items-center justify-center gap-2"
          >
            Iniciar sesión <span className="text-xl">→</span>
          </button>
        </form>

        <div className="mt-8 text-center space-y-2">
          <p>
            <Link to="/forgot-password" size="sm" className="text-gray-600 hover:underline">
              ¿Has olvidado la contraseña?
            </Link>
          </p>
          <p>
            <Link to="/register" className="text-gray-600 hover:underline">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;