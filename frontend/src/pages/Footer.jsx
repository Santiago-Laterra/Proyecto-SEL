import { useState } from 'react';
import { ChevronDown, ChevronUp, Instagram } from 'lucide-react';

const Footer = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: "¿Cómo recibo mi producto?", a: "¡Una vez hecho el pago te llegará un mail donde podrás descargar el archivo e imprimirlo para usar!" },
    { q: "¿Cuántas veces puedo reproducir las plantillas?", a: "Las plantillas son para un uso único y personal (no comercial) pero si querés hacerle un regalo a alguien imprimiendo 2 copias del mismo, no me enojo ;)" },
    { q: "Tengo otra duda", a: "Cualquier otra consulta podés hacerla en la sección 'Contacto' o escribiendo a mi instagram @aylensantoro" }
  ];

  return (
    // Padding vertical exacto de 52.8px
    <>
      {/* Redes y Copyright centrado al final */}
      <div className="mt-24 flex flex-col items-center gap-2 border-t border-gray-300">
        <a
          href="https://www.instagram.com/aylensantoro"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-slate-900 transition-colors"
        >
          <Instagram size={20} strokeWidth={1.2} />
        </a>

        <div className="text-[10px] text-gray-700 uppercase tracking-[0.3em] mb-2">
          © 2026 Soleyah - Arte & Diseño
        </div>
      </div>
    </>
  );
};

export default Footer;