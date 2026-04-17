import React from 'react';
import { Heart, Shield, Zap, Globe, Coffee, Box, Camera } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const platforms = ["Instagram", "TikTok", "YouTube", "Twitter", "Facebook", "Threads"];
  const infinitePlatforms = [...platforms, ...platforms];

  return (
    <footer className="mt-20 border-t border-white/10 bg-[#0c0c0c] py-14 sm:py-20 px-6 relative overflow-hidden">
      
      {/* --- EFECTOS DE LUZ AMBIENTAL --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-6 items-start">
          
          {/* COLUMNA 1: IDENTIDAD */}
          <div className="flex flex-col items-center lg:items-start space-y-5">
            <div className="flex items-center gap-2 group cursor-default">
              <span className="text-2xl font-black tracking-tighter text-white uppercase italic transition-all group-hover:text-blue-400">
                Ryo<span className="text-blue-500">Mixed</span>
              </span>
            </div>
            <p className="text-gray-300 text-[10px] sm:text-xs leading-relaxed max-w-[220px] text-center lg:text-left font-medium">
              Tu centro de descarga multimedia de última generación. <br />
              <span className="text-blue-400 font-bold uppercase tracking-[0.2em] text-[9px]">Rápido • Privado • Seguro</span>
            </p>
          </div>

          {/* COLUMNA 2: SOPORTE */}
          <div className="flex flex-col items-center space-y-6 lg:border-l lg:border-white/10 lg:pl-6">
             <span className="text-[10px] font-black text-blue-400/80 uppercase tracking-[0.4em]">Soporte</span>
             <div className="w-full max-w-[150px] overflow-hidden mask-fade-edges relative h-5">
                <div className="flex gap-8 animate-scroll-x absolute whitespace-nowrap">
                   {infinitePlatforms.map((p, i) => (
                     <span key={i} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-blue-400 transition-colors cursor-default">
                       {p}
                     </span>
                   ))}
                </div>
             </div>
             <div className="flex gap-5 opacity-80">
                <Zap className="w-4 h-4 text-blue-500 hover:text-blue-400 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] hover:scale-110 transition-all" />
                <Shield className="w-4 h-4 text-blue-500 hover:text-blue-400 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] hover:scale-110 transition-all" />
                <Globe className="w-4 h-4 text-blue-500 hover:text-blue-400 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] hover:scale-110 transition-all" />
             </div>
          </div>

          {/* COLUMNA 3: APOYO (KO-FI) */}
          <div className="flex flex-col items-center space-y-5 lg:border-l lg:border-white/10 lg:pl-6">
            <span className="text-[10px] font-black text-blue-400/80 uppercase tracking-[0.4em]">Donaciones</span>
            <a href="https://ko-fi.com/elaehtdev" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2">
              <div className="flex items-center gap-2.5 text-gray-200 group-hover:text-white transition-all duration-300">
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-amber-500/20 border border-white/5 transition-colors">
                    <Coffee className="w-4 h-4 text-blue-400 group-hover:text-amber-400 group-hover:rotate-12 transition-all" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest">¿Te gusta RyoMixed?</span>
              </div>
              <span className="text-[9px] text-gray-400 group-hover:text-blue-400 font-bold italic tracking-wide transition-colors">
                Invítanos un café ❤️
              </span>
            </a>
          </div>

          {/* COLUMNA 4: ALIADOS (ArqKalar97) */}
          <div className="flex flex-col items-center space-y-5 lg:border-l lg:border-white/10 lg:pl-6">
            <span className="text-[10px] font-black text-blue-400/80 uppercase tracking-[0.4em]">Aliados</span>
            <a 
              href="https://www.instagram.com/arqkalar97_3d/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group flex flex-col items-center gap-2"
            >
              <div className="flex items-center gap-2.5 text-gray-200 group-hover:text-white transition-all">
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-gradient-to-tr group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all duration-500 border border-transparent group-hover:border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0)] group-hover:shadow-[0_0_15px_rgba(236,72,153,0.1)]">
                    <Box className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-all" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                  ArqKalar97
                </span>
              </div>
              <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <Camera className="w-3 h-3 text-pink-500" />
                <span className="text-[9px] text-gray-400 group-hover:text-gray-200 font-bold uppercase italic tracking-tighter transition-colors">
                  Modelado 3D
                </span>
              </div>
            </a>
          </div>

          {/* COLUMNA 5: LEGAL Y AUTORÍA */}
          <div className="flex flex-col items-center lg:items-end space-y-6 lg:border-l lg:border-white/10 lg:pl-6">
            <div className="text-center lg:text-right">
                <p className="text-[9px] text-gray-400 max-w-[150px] italic leading-tight font-medium">
                  Contenido procesado vía stream directo. <br /> No alojamos archivos.
                </p>
            </div>
            <div className="flex flex-col items-center lg:items-end gap-2">
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group cursor-default">
                  Hecho con <Heart className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20 animate-pulse group-hover:fill-blue-500 transition-all" /> por <span className="text-blue-400 group-hover:text-white transition-colors">RyoTeam's</span>
                </p>
                <p className="text-gray-500 text-[9px] font-bold uppercase tracking-tighter">
                  © {currentYear} • ALL RIGHTS RESERVED
                </p>
            </div>
          </div>

        </div>

        {/* DECORACIÓN FINAL */}
        <div className="mt-16 flex justify-center items-center gap-6 opacity-30">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="flex gap-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-blue-500/60 transition-all hover:bg-blue-400 hover:scale-150 hover:shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                ))}
            </div>
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>

      <style>{`
        @keyframes scroll-x {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-x {
          animation: scroll-x 25s linear infinite;
        }
        .mask-fade-edges {
          mask-image: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
        }
      `}</style>
    </footer>
  );
};

export default Footer;