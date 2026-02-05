import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Footer = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "¿Cómo recibo mi producto?",
      a: "¡Una vez hecho el pago te llegará un mail donde podrás descargar el archivo e imprimirlo para usar!"
    },
    {
      q: "¿Cuántas veces puedo reproducir las plantillas?",
      a: "Las plantillas son para un uso único y personal (no comercial) pero si querés hacerle un regalo a alguien imprimiendo 2 copias del mismo, no me enojo ;)"
    },
    {
      q: "Tengo otra duda",
      a: "Cualquier otra consulta podés hacerla en la sección 'Contacto' o escribiendo a mi instagram @aylensantoro"
    }
  ];

  return (
    <footer className="bg-white py-16 px-10 border-t border-gray-100">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-serif mb-10 text-slate-800">FAQs</h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-4">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center text-left py-2 hover:text-slate-600 transition-colors"
              >
                <span className="font-medium text-slate-800">{faq.q}</span>
                {openIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {openIndex === index && (
                <p className="mt-4 text-slate-600 leading-relaxed animate-fade-in">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-20 text-center text-xs text-slate-400 uppercase tracking-widest">
          © {new Date().getFullYear()} Soleyah - Arte & Diseño
        </div>
      </div>
    </footer>
  );
};

export default Footer;