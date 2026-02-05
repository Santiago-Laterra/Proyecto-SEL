import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login'; // Importamos el Login

const RouterApp = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        {/* Aquí agregaremos después las rutas protegidas del Admin */}
      </Routes>
    </BrowserRouter>
  );
};

export default RouterApp;