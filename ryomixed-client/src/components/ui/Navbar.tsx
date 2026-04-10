import React from 'react';
import { Zap, Info } from 'lucide-react';

// 1. Definimos las props del componente
interface NavProps {
  onOpenAbout: () => void;
}

const Nav: React.FC<NavProps> = ({ onOpenAbout }) => {
  return (
    /* Eliminamos 'sticky' y 'top-0' para que no siga el scroll.
       Quitamos 'backdrop-blur-md' y '/80' ya que, al no haber contenido 
       pasando por debajo, es mejor usar el fondo sólido [#0f0f0f].
    */
    <nav className="w-full border-b border-white/10 bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <span className="text-xl font-black text-white uppercase italic tracking-tighter">
            Ryo<span className="text-blue-500">Mixed</span>
          </span>
        </div>

        {/* Botón de información */}
        <button 
          onClick={onOpenAbout} 
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest text-[10px]"
        >
          <Info className="w-4 h-4 text-blue-500" />
          <span>¿Quiénes somos?</span>
        </button>

      </div>
    </nav>
  );
};

export default Nav;