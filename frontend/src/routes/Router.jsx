import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '../pages/Header';
import Home from '../pages/Home';
import Login from '../pages/Login';
import ProtectedRoute from '../components/ProtectedRoute';
import Footer from '../pages/Footer';
import ProductDetail from '../pages/ProductDetails';
import AdminDashboard from '../pages/AdminDashboard'; // Este es el que terminamos recién
import Dashboard from '../pages/Dashboard';
import Register from '../pages/Register';

const RouterApp = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* 🔒 BLOQUE PROTEGIDO */}
        <Route element={<ProtectedRoute />}>
          {/* La tabla principal del admin */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* El formulario para cargar productos nuevos */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default RouterApp;