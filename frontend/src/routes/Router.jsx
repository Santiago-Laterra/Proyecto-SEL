import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '../pages/Header';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard'; // Importamos la nueva página
import ProtectedRoute from '../components/ProtectedRoute'; // Importamos el protector
import Footer from '../pages/Footer';
import ProductDetail from '../pages/ProductDetails'

const RouterApp = () => {
  return (
    <BrowserRouter>

      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* 🔒 BLOQUE PROTEGIDO: Todo lo que esté acá adentro requiere ser Admin */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default RouterApp;