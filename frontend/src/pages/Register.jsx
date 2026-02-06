import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', {
        username: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password
      });
      alert("Cuenta creada con éxito");
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-32 px-4 pb-20">
      {/* Contenedor principal con el ancho exacto de Payhip */}
      <div className="w-full max-w-150">
        <h1 className="text-[32px] font-normal text-[#111] text-center mb-4">Crear cuenta de cliente</h1>
        <p className="text-gray-500 text-[15px] text-center mb-12">
          Cree una cuenta de cliente para guardar todos sus pedidos en un solo lugar
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre y Apellidos en la misma línea */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-[15px] text-[#111] font-medium">Nombre</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-[15px] text-[#111] font-medium">Apellidos</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-[15px] text-[#111] font-medium">Dirección de correo electrónico</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-3 outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[15px] text-[#111] font-medium">Contraseña</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-3 outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
            />
          </div>

          {/* Botón Verde Payhip */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#007b5e] hover:bg-[#00664e] text-white font-bold py-4 rounded-md flex items-center justify-center gap-2 transition-all mt-4 text-[16px]"
          >
            {loading ? "Cargando..." : "Crear cuenta"}
            {!loading && <span className="text-xl">→</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;