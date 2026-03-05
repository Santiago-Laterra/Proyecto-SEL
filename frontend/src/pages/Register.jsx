import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { showAlert } from "../utils/alerts"; // Importación corregida con llaves

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
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password
      };

      const response = await api.post('/auth/register', userData);

      // CORRECCIÓN AQUÍ: Solo una llamada, nombre correcto y 3 parámetros.
      showAlert("¡Cuenta creada!", "Bienvenida a SeloYah. Ya puedes iniciar sesión.", "success");

      navigate('/login');
    } catch (err) {
      showAlert("Error", err.response?.data?.message || "No se pudo crear la cuenta", "error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-24 pb-20 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-[32px] font-normal text-[#111] text-center mb-4">Crear cuenta de cliente</h1>
        <p className="text-gray-500 text-[15px] text-center mb-10 leading-relaxed">
          Cree una cuenta de cliente para guardar todos sus pedidos en un solo lugar
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-[14px] text-[#111] font-medium">Nombre</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-emerald-600 transition-all text-sm"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-[14px] text-[#111] font-medium">Apellidos</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-emerald-600 transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] text-[#111] font-medium">Dirección de correo electrónico</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-emerald-600 transition-all text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] text-[#111] font-medium">Contraseña</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-emerald-600 transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#007b5e] hover:bg-[#00664e] text-white font-bold py-3.5 rounded-md flex items-center justify-center gap-2 transition-all mt-4"
          >
            {loading ? "Cargando..." : "Crear cuenta"}
            {!loading && <span className="text-lg">→</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;