import { Instagram } from 'lucide-react';

const Footer = () => {


  return (
    // Padding vertical exacto de 52.8px
    <>
      {/* Redes y Copyright centrado al final */}
      <div className="mt-10 pt-10 flex flex-col items-center gap-4 border-t border-gray-300 w-full">
        <a
          href="https://www.instagram.com/aylensantoro"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-900 transition-colors"
        >
          <Instagram size={20} strokeWidth={1.2} />
        </a>

        <div className="text-[10px] text-gray-800 uppercase tracking-[0.3em] mb-2">
          © 2026 Soleyah - Arte & Diseño
        </div>
      </div>
    </>
  );
};

export default Footer;