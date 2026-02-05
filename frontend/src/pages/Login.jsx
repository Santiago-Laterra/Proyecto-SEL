import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      // Si es admin, lo mandamos directo al dashboard
      if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-normal text-gray-800 mb-2">Inicia sesión en tu cuenta</h1>
        <p className="text-gray-600 mb-8">Introduce tu dirección de correo electrónico y contraseña</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-gray-700 mb-1">Dirección de correo electrónico</label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="w-full bg-[#008060] text-white font-semibold py-3 rounded-md hover:bg-[#006e52] transition-colors flex items-center justify-center">
            Iniciar sesión <span className="ml-2">→</span>
          </button>
        </form>

        <div className="mt-6 space-y-2">
          <a href="#" className="text-emerald-700 block text-sm hover:underline">¿Has olvidado la contraseña?</a>
          <a href="#" className="text-emerald-700 block text-sm hover:underline">Crear cuenta</a>
        </div>
      </div>
    </div>
  );
};

export default Login;