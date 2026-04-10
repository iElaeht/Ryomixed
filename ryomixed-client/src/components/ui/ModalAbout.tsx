import React from 'react';
import { X, ShieldCheck, Zap, Heart, Code2, Sparkles } from 'lucide-react';

interface ModalAboutProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalAbout: React.FC<ModalAboutProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay con desenfoque profundo */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Contenido del Modal */}
      <div className="relative w-full max-w-xl bg-[#0d1117] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 overflow-hidden">
        
        {/* Decoración de fondo sutil */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full" />
        
        {/* Botón Cerrar */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-3 mb-8">
          <div className="bg-blue-600/20 p-3 rounded-2xl mb-2">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            RYO<span className="text-blue-600">MIXED</span>
          </h2>
          <div className="h-1 w-12 bg-blue-600 rounded-full" />
        </div>

        {/* Mensaje Personalizado */}
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <div className="bg-white/5 rounded-3xl p-6 border border-white/5 relative">
            <p className="text-lg font-medium text-white mb-4">
              ¡Hola tú, que nos encontraste! 👋
            </p>
            <p className="text-sm md:text-base mb-4">
              Hice este sistema pensando en que necesitas un conversor, pero no solo de una sola plataforma. Me basé en la necesidad de que tú puedas pedir como <span className="text-blue-400 font-bold">YouTube</span> o <span className="text-pink-400 font-bold">TikTok</span>.
            </p>
            <p className="text-sm md:text-base">
              En un futuro agregaremos más plataformas para que puedas tener una experiencia <span className="text-white font-bold italic">MultiFuncional</span>. Espero que te agrade nuestro sistema <span className="text-blue-500 font-bold">"RyoMixed"</span>.
            </p>
          </div>

          {/* Sección de Seguridad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
              <ShieldCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-green-500 uppercase tracking-widest mb-1">Privacidad</p>
                <p className="text-[11px] text-gray-400">Nuestro sistema está protegido y no te pedimos nada de tu información. Puedes sentirte seguro.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
              <Zap className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-1">Seguridad</p>
                <p className="text-[11px] text-gray-400">Uso libre de registros. Tus datos nunca tocan nuestros servidores.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Firma con Icono Code2 */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5">
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Developer Signature</span>
          </div>
          
          <p className="text-sm text-gray-400 flex items-center gap-2">
            Con mucho cariño, <span className="text-white font-black italic tracking-widest">Elaehtdev</span>
            <Heart className="w-3 h-3 text-red-500 fill-current animate-pulse" />
          </p>
        </div>

        {/* Botón de cierre */}
        <button 
          onClick={onClose}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-[0_10px_20px_rgba(37,99,235,0.2)] uppercase tracking-[0.2em] text-xs"
        >
          ¡Entendido!
        </button>
      </div>
    </div>
  );
};

export default ModalAbout;