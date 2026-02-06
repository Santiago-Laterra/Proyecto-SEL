import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '../pages/Header';
import Home from '../pages/Home';
import Login from '../pages/Login';
import ProtectedRoute from '../components/ProtectedRoute';
import Footer from '../pages/Footer';
import ProductDetail from '../pages/ProductDetails';
import AdminDashboard from '../pages/AdminDashboard'; // Este es el que terminamos recién

const RouterApp = () => {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* 🔒 BLOQUE PROTEGIDO: Solo accesible para Admin */}
        <Route element={<ProtectedRoute />}>
          {/* Limpiamos aquí: Solo dejamos una ruta para el dashboard. 
              Usamos AdminDashboard que es el que tiene la tabla, los botones y el modal.
          */}
          <Route path="/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default RouterApp;