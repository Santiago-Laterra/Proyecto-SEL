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
    <footer className="bg-white py-[52.8px] font-proxima">

      {/* Margen lateral exacto de 160.4px */}
      <div className="mx-5 md:mx-[160.4px]">

        {/* Título FAQs: 25px, Serif, sin línea abajo */}
        <h2 className="text-[20px] font-proxima-nova mb-5 text-slate-800 tracking-tight">
          FAQs
        </h2>

        <div className="flex flex-col border-t border-gray-300">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-300 py-6">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center text-left group"
              >
                {/* Preguntas: 16px, Normal y Proxima */}
                <span className="text-[16px] font-normal text-slate-800">
                  {faq.q}
                </span>

                {/* Flecha finita estilo minimalista */}
                {openIndex === index ? (
                  <ChevronUp size={18} strokeWidth={1} className="text-stone-950" />
                ) : (
                  <ChevronDown size={18} strokeWidth={1} className="text-stone-950" />
                )}
              </button>

              {/* Respuesta: 15px */}
              {openIndex === index && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-300">
                  <p className="text-[15px] font-normal text-gray-500 leading-relaxed max-w-3xl">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Redes y Copyright centrado al final */}
        <div className="mt-24 flex flex-col items-center gap-6">
          <a
            href="https://www.instagram.com/aylensantoro"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-slate-900 transition-colors"
          >
            <Instagram size={20} strokeWidth={1.2} />
          </a>

          <div className="text-[10px] text-gray-700 uppercase tracking-[0.3em]">
            © 2026 Soleyah - Arte & Diseño
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;