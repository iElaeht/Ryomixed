import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-white/5 bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* MARCA Y SLOGAN */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tighter text-white uppercase italic">
                Ryo<span className="text-blue-500">Mixed</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm max-w-xs text-center md:text-left">
              Tu centro de descarga multimedia rápido, limpio y sin anuncios.
            </p>
          </div>

          {/* MENSAJE DE RESPONSABILIDAD */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-gray-600 max-w-sm text-center italic">
              RyoMixed no aloja ningún contenido en sus servidores. Los usuarios son responsables del uso que le den a los archivos descargados.
            </p>
          </div>

          {/* LINKS / SOCIAL */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex gap-4">
            </div>
            <p className="text-gray-500 text-xs flex items-center gap-1">
              Hecho con <Heart className="w-3 h-3 text-red-500 fill-current" /> por RyoMixed Team © {currentYear}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;