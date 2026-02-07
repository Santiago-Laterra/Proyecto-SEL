import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    mensaje: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const serviceID = 'service_6nal69e';
    const templateID = 'template_6d6mnud';
    const publicKey = 'eOS0A_1QEVqtXCPhZ';

    const templateParams = {
      nombre: formData.nombre,
      apellidos: formData.apellidos,
      email: formData.email,
      mensaje: formData.mensaje,
    };

    // Usamos emailjs.send directamente desde la librería importada
    emailjs.send(serviceID, templateID, templateParams, publicKey)
      .then((result) => {
        console.log('EXITO:', result.text);
        alert("¡Mensaje enviado con éxito!");
        setFormData({ nombre: '', apellidos: '', email: '', mensaje: '' });
      })
      .catch((err) => {
        console.error('ERROR DETALLADO:', err);
        alert("No se pudo enviar el mensaje. Error: " + err.text);
      });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-6xl mx-auto px-12 py-24 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-16">

        {/* LADO IZQUIERDO: Títulos */}
        <div className="md:w-1/3">
          <h1 className="text-[32px] font-medium text-slate-900 mb-6 tracking-tight">
            Get In Touch
          </h1>
          <p className="text-slate-600 text-[15px] font-light leading-relaxed">
            Have any questions or comments? Use this form to contact me at any time.
          </p>
        </div>

        {/* LADO DERECHO: Formulario */}
        <div className="md:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Fila Nombre y Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] text-slate-900">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="border border-gray-500 rounded-md p-2 outline-none focus:border-slate-500 transition-colors"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] text-slate-900">Apellidos</label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  className="border border-gray-500 rounded-md p-2 outline-none focus:border-slate-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] text-slate-900">Dirección de correo electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border border-gray-500 rounded-md p-2 outline-none focus:border-slate-500 transition-colors w-full"
                required
              />
            </div>

            {/* Mensaje */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] text-slate-900 ">Mensaje</label>
              <textarea
                name="mensaje"
                rows="6"
                value={formData.mensaje}
                onChange={handleChange}
                className="border border-gray-500 rounded-md p-2 outline-none focus:border-slate-500 transition-colors w-full resize-none"
                required
              ></textarea>
            </div>

            {/* Botón Enviar */}
            <div className="pt-2">
              <button
                type="submit"
                className="bg-[#008060] hover:bg-[#006e52] text-white px-8 py-3 rounded-md font-medium text-[15px] transition-all duration-300"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;