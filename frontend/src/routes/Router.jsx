import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '../pages/Header';
import Home from '../pages/Home';
import Login from '../pages/Login'; // Agregado
import Register from '../pages/Register'; // Corregido el path
import ProtectedRoute from '../components/ProtectedRoute';
import Footer from '../pages/Footer';
import AdminDashboard from '../pages/AdminDashboard';
import Dashboard from '../pages/Dashboard';
import PaymentSuccess from '../pages/PaymentSuccess';
import PaymentPending from '../pages/PaymentPending';
import ProductDetails from '../pages/ProductDetails';
import Contact from '../components/Contact'; // Agregado
import ForgotPassword from '../components/ForgotPasswords'; // Asegúrate de que la ruta sea correcta
import ResetPassword from '../components/ResetPassword';

const RouterApp = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product/:id" element={<ProductDetails />} />

        {/* NUEVAS RUTAS DE CONTRASEÑA */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />


        {/* Rutas de Mercado Pago */}
        <Route path="/pago-exitoso" element={<PaymentSuccess />} />
        <Route path="/pago-pendiente" element={<PaymentPending />} />
        <Route path="/carrito" element={<Home />} />

        {/* Bloque protegido Admin */}
        <Route element={<ProtectedRoute />}>
          {/* Aquí es donde gestionas las ventas y exportas a Excel */}
          <Route path="/admin" element={<AdminDashboard />} />
          {/* Aquí es donde cargas los productos nuevos */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default RouterApp;