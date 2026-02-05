import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAdmin, loading } = useAuth();

  // Mientras se verifica el token, mostramos un estado de carga
  if (loading) return <div className="p-10 text-center">Verificando permisos...</div>;

  // Si es admin, dejamos pasar al "Outlet" (el Dashboard). 
  // Si no, lo mandamos al login.
  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;