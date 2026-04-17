import React, { useState, useEffect } from 'react';
import { Zap, Info, Sparkles } from 'lucide-react';
import AnunciosModal from './AnunciosModal';

interface NavProps {
  onOpenAbout: () => void;
}

const Nav: React.FC<NavProps> = ({ onOpenAbout }) => {
  const [isAnunciosOpen, setIsAnunciosOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 🔄 DETECTOR DE SCROLL: Cambia el estado si el usuario baja más de 20px
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🚀 FUNCIÓN SCROLL TO TOP: Regresa al inicio con suavidad
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <nav 
        className={`w-full fixed top-0 left-0 z-[100] transition-all duration-500 ${
          isScrolled 
            ? "bg-black/60 backdrop-blur-xl border-b border-blue-500/20 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)]" 
            : "bg-transparent border-b border-white/5 py-4 sm:py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center transition-all duration-500">
          
          {/* LOGO INTERACTIVO: Click para subir */}
          <div 
            onClick={scrollToTop}
            className="flex items-center gap-2 group cursor-pointer select-none active:scale-90 transition-transform"
          >
            <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all duration-500 group-hover:rotate-[360deg]">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black text-white uppercase italic tracking-tighter leading-none">
                Ryo<span className="text-blue-500">Mixed</span>
              </span>
              {isScrolled && (
                <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest animate-in fade-in slide-in-from-left-2">
                  Ir arriba ↑
                </span>
              )}
            </div>
          </div>

          {/* ACCIONES */}
          <div className="flex items-center gap-1 sm:gap-4">
            
            {/* BOTÓN NOVEDADES */}
            <button 
              onClick={() => setIsAnunciosOpen(true)}
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-[0.2em]"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="hidden xs:inline">Novedades</span>
              
              <span className="absolute top-2 right-1 sm:right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
            </button>

            <div className="w-px h-4 bg-white/10 mx-1 hidden sm:block" />

            {/* BOTÓN ABOUT */}
            <button 
              onClick={onOpenAbout} 
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-[0.2em]"
            >
              <Info className="w-4 h-4 text-blue-500/50 shrink-0" />
              <span className="hidden md:inline">¿Quiénes somos?</span>
              <span className="md:hidden inline">Info</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Espaciador para que el contenido no empiece debajo del Nav fixed */}
      <div className="h-20 sm:h-24" />

      <AnunciosModal 
        isOpen={isAnunciosOpen} 
        onClose={() => setIsAnunciosOpen(false)} 
      />
    </>
  );
};

export default Nav;