import React from 'react';
import { Heart, Shield, Zap, Globe } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  // Duplicamos la lista para crear el efecto de scroll infinito real
  const platforms = ["Instagram", "TikTok", "YouTube", "Twitter", "Facebook", "Threads"];
  const infinitePlatforms = [...platforms, ...platforms];

  return (
    <footer className="mt-20 border-t border-white/5 bg-[#070707] py-12 sm:py-16 px-6 relative overflow-hidden">
      {/* Línea de brillo superior decorativa */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto">
        {/* GRID PRINCIPAL: 1 columna en móvil, 3 en escritorio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 items-center">
          
          {/* COLUMNA 1: IDENTIDAD */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div className="flex items-center gap-2 group cursor-default">
              <span className="text-2xl font-black tracking-tighter text-white uppercase italic transition-all group-hover:tracking-normal">
                Ryo<span className="text-blue-500">Mixed</span>
              </span>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-xs text-center md:text-left font-medium">
              Tu centro de descarga multimedia de última generación. <br />
              <span className="text-blue-500/50 font-bold">Rápido. Privado. Seguro.</span>
            </p>
          </div>

          {/* COLUMNA 2: CARRUSEL MULTIPLATAFORMA (Responsivo) */}
          <div className="flex flex-col items-center justify-center space-y-6">
             <span className="text-[8px] sm:text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Soporte Multiplataforma</span>
             
             {/* Contenedor con máscara de desvanecimiento lateral */}
             <div className="w-full max-w-[250px] overflow-hidden mask-fade-edges relative h-4">
                <div className="flex gap-8 animate-scroll-x absolute whitespace-nowrap">
                   {infinitePlatforms.map((p, i) => (
                     <span key={i} className="text-[10px] font-bold text-gray-600 uppercase tracking-widest hover:text-blue-500 transition-colors cursor-default inline-block">
                       {p}
                     </span>
                   ))}
                </div>
             </div>

             <div className="flex gap-6 mt-2 opacity-50">
                <Zap className="w-3.5 h-3.5 text-blue-500 hover:scale-125 transition-transform" />
                <Shield className="w-3.5 h-3.5 text-blue-500 hover:scale-125 transition-transform" />
                <Globe className="w-3.5 h-3.5 text-blue-500 hover:scale-125 transition-transform" />
             </div>
          </div>

          {/* COLUMNA 3: LEGAL Y AUTORÍA */}
          <div className="flex flex-col items-center md:items-end space-y-5">
            <div className="text-center md:text-right">
                <p className="text-[10px] text-gray-600 max-w-[200px] sm:max-w-xs italic leading-tight font-medium">
                    RyoMixed no aloja archivos en sus servidores. 
                    Contenido procesado vía stream directo.
                </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-1.5">
                <p className="text-white/40 text-[10px] sm:text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                  Hecho con <Heart className="w-3 h-3 text-blue-500 fill-blue-500/20 animate-pulse" /> por RyoMixed
                </p>
                <p className="text-gray-700 text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter">
                  © 2024 - {currentYear} • ALL RIGHTS RESERVED
                </p>
            </div>
          </div>

        </div>

        {/* DETALLE FINAL DE DECORACIÓN */}
        <div className="mt-12 flex justify-center opacity-20">
            <div className="flex gap-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-white transition-all hover:bg-blue-500 hover:scale-150" />
                ))}
            </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll-x {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-x {
          animation: scroll-x 20s linear infinite;
        }
        .mask-fade-edges {
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
      `}</style>
    </footer>
  );
};

export default Footer;