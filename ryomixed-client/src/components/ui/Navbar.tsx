import React, { useState, useEffect } from 'react';
import { Zap, Info, Sparkles, Coffee, Menu, X } from 'lucide-react';
import AnunciosModal from './AnunciosModal';

interface NavProps {
  onOpenAbout: () => void;
}

const Nav: React.FC<NavProps> = ({ onOpenAbout }) => {
  const [isAnunciosOpen, setIsAnunciosOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cerrar menú al hacer scroll (opcional, pero da mucha limpieza)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      if (window.scrollY > 50) setIsMobileMenuOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMobileMenu();
  };

  const handleOpenAbout = () => {
    onOpenAbout();
    closeMobileMenu();
  };

  const handleOpenAnuncios = () => {
    setIsAnunciosOpen(true);
    closeMobileMenu();
  };

  return (
    <>
      {/* OVERLAY DE CIERRE: Detecta clics fuera del menú */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] md:hidden animate-in fade-in duration-300"
          onClick={closeMobileMenu}
        />
      )}

      <nav 
        className={`w-full fixed top-0 left-0 z-[100] transition-all duration-500 ${
          isScrolled 
            ? "bg-black/80 backdrop-blur-2xl border-b border-blue-500/20 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]" 
            : "bg-transparent border-b border-white/5 py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative z-[101]">
          
          {/* LOGO */}
          <div 
            onClick={scrollToTop}
            className="flex items-center gap-2 group cursor-pointer select-none active:scale-90 transition-transform"
          >
            <div className="bg-blue-600 p-2 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:rotate-[360deg] transition-all duration-700">
              <Zap className="w-4 h-4 text-white fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">
                Ryo<span className="text-blue-500">Mixed</span>
              </span>
            </div>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-2">
            <a href="https://ko-fi.com/elaehtdev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-[0.2em] group">
              <Coffee className="w-3.5 h-3.5 text-amber-400 group-hover:animate-bounce" />
              <span>¿Apoyar?</span>
            </a>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button onClick={handleOpenAnuncios} className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-[0.2em]">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Novedades</span>
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button onClick={handleOpenAbout} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-[0.2em]">
              <Info className="w-4 h-4 text-blue-500/50" />
              <span>Info</span>
            </button>
          </div>

          {/* MOBILE BUTTON */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2.5 rounded-xl border transition-all active:scale-90 ${
              isMobileMenuOpen ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/10 text-white'
            }`}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        <div className={`md:hidden absolute inset-x-0 top-full bg-[#0d0d0d]/95 backdrop-blur-3xl border-b border-white/10 transition-all duration-500 ease-in-out overflow-hidden z-[100] ${
          isMobileMenuOpen ? 'max-h-[400px] opacity-100 shadow-[0_20px_40px_rgba(0,0,0,0.7)]' : 'max-h-0 opacity-0'
        }`}>
          <div className="p-6 flex flex-col gap-3">
            <a 
              href="https://ko-fi.com/elaehtdev" 
              className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 active:bg-white/10 transition-colors"
              onClick={closeMobileMenu}
            >
              <div className="flex items-center gap-3">
                <Coffee className="w-5 h-5 text-amber-400" />
                <span className="text-[11px] font-black text-white uppercase tracking-widest">Apoyar proyecto</span>
              </div>
              <Zap className="w-4 h-4 text-blue-500" />
            </a>

            <button 
              onClick={handleOpenAnuncios}
              className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 active:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span className="text-[11px] font-black text-white uppercase tracking-widest">Novedades</span>
              </div>
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            </button>

            <button 
              onClick={handleOpenAbout}
              className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 active:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-blue-400" />
                <span className="text-[11px] font-black text-white uppercase tracking-widest">Información</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      <div className="h-24 sm:h-32" />

      <AnunciosModal 
        isOpen={isAnunciosOpen} 
        onClose={() => setIsAnunciosOpen(false)} 
      />
    </>
  );
};

export default Nav;