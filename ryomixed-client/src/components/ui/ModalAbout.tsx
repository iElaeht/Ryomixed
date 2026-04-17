import React from 'react';
import { X, ShieldCheck, Zap, Heart, Sparkles } from 'lucide-react';

interface ModalAboutProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalAbout: React.FC<ModalAboutProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      {/* Contenedor Principal con Scroll */}
      <div className="relative w-full max-w-xl bg-[#0d1117] border border-white/10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Luces de ambiente decorativas */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Header Fijo */}
        <div className="p-6 sm:p-8 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 p-2 rounded-xl">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase italic">
              RYO<span className="text-blue-600">MIXED</span>
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Área de Contenido con Scroll Independiente */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 space-y-8">
          
          {/* Mensaje de Bienvenida */}
          <div className="bg-gradient-to-b from-white/[0.05] to-transparent rounded-[2rem] p-6 border border-white/5">
            <p className="text-base sm:text-lg font-bold text-white mb-4">
              ¡Hola tú, que nos encontraste! 👋
            </p>
            <div className="space-y-4 text-xs sm:text-sm text-gray-400 leading-relaxed font-medium">
              <p>
                Hice este sistema pensando en que necesitas un conversor, pero no solo de una sola plataforma. Me basé en la necesidad de que tú puedas pedir como <span className="text-blue-400 font-bold">YouTube</span> o <span className="text-pink-400 font-bold">TikTok</span>.
              </p>
              <p>
                En un futuro agregaremos más plataformas para que puedas tener una experiencia <span className="text-white font-bold italic">MultiFuncional</span>. Espero que te agrade nuestro sistema <span className="text-blue-500 font-bold">"RyoMixed"</span>.
              </p>
            </div>
          </div>

          {/* Tarjetas de Seguridad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="group p-5 bg-[#121821] border border-white/5 rounded-[1.5rem] hover:border-green-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Privacidad</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">Sistema protegido. No solicitamos información personal. Tu anonimato es prioridad.</p>
            </div>

            <div className="group p-5 bg-[#121821] border border-white/5 rounded-[1.5rem] hover:border-blue-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-blue-500" />
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Seguridad</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">Sin registros obligatorios. Los datos se procesan y nunca se almacenan en servidores.</p>
            </div>
          </div>

          {/* Firma del Desarrollador */}
          <div className="pt-4 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 group">
              <span className="text-sm text-gray-400">Hecho con</span>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20 group-hover:scale-125 transition-transform animate-pulse" />
              <span className="text-white font-black italic tracking-[0.15em]">ELAEHTDEV</span>
            </div>
          </div>
        </div>

        {/* Footer con Botón de Acción */}
        <div className="p-6 sm:p-8 bg-white/[0.02] border-t border-white/5">
          <button 
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20 uppercase tracking-[0.2em] text-[10px] sm:text-xs"
          >
            ¡Entendido!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAbout;