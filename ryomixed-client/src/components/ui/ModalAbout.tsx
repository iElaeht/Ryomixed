import React from 'react';
import { X, ShieldCheck, Zap, Globe } from 'lucide-react';

interface ModalAboutProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalAbout: React.FC<ModalAboutProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay - Fondo desenfocado */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Contenido del Modal */}
      <div className="relative w-full max-w-lg bg-[#141414] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Botón Cerrar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header con Icono */}
        <div className="flex flex-col items-center text-center gap-4 mb-8">
          <div className="bg-blue-600/20 p-4 rounded-2xl">
            <Zap className="w-8 h-8 text-blue-500 fill-current" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            RYO<span className="text-blue-500">MIXED</span>
          </h2>
        </div>

        {/* LA FRASE ICÓNICA */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mb-8">
          <p className="text-xl md:text-2xl font-medium text-center text-gray-200 leading-relaxed italic">
            "Transformando la forma en que guardas tus momentos favoritos de la red."
          </p>
        </div>

        {/* Puntos clave */}
        <div className="grid grid-cols-1 gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <span>Privacidad total: Sin rastreadores ni registros obligatorios.</span>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-blue-400" />
            <span>Universal: Compatible con las plataformas más populares.</span>
          </div>
        </div>

        {/* Botón de cierre inferior */}
        <button 
          onClick={onClose}
          className="w-full mt-8 bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-colors active:scale-95"
        >
          ¡Entendido!
        </button>
      </div>
    </div>
  );
};

export default ModalAbout;