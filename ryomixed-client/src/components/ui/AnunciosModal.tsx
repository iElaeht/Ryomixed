import React from 'react';
import { X, Sparkles, Rocket, Zap, Bug, ShieldCheck, Globe, type LucideIcon } from 'lucide-react';

interface Update {
  version: string;
  date: string;
  title: string;
  description: string;
  type: 'feature' | 'fix' | 'update';
  // Cambiamos ReactNode por LucideIcon para manejarlo como componente
  icon: LucideIcon;
  iconColor: string;
}

const updates: Update[] = [
  {
    version: "v2.2.0",
    date: "Abril 2026",
    title: "Instagram Intelligence",
    description: "Implementación de selector de galería para posts múltiples y Reels. Se aplicaron protocolos de Privacidad y Seguridad Máxima en el procesamiento de metadatos.",
    type: 'feature',
    icon: ShieldCheck,
    iconColor: "text-emerald-500"
  },
  {
    version: "v2.1.0",
    date: "Abril 2026",
    title: "Motor de YouTube 4K",
    description: "Optimización de backend para extracciones en alta fidelidad y descargas de audio a 320kbps sin pérdida de paquetes.",
    type: 'feature',
    icon: Zap,
    iconColor: "text-blue-500"
  },
  {
    version: "v2.0.5",
    date: "Marzo 2026",
    title: "Parche Crítico TikTok",
    description: "Bypass de seguridad para errores de carga en miniaturas (CORS) y soporte para álbumes de fotos en alta resolución.",
    type: 'fix',
    icon: Bug,
    iconColor: "text-rose-500"
  },
  {
    version: "v2.0.0",
    date: "Marzo 2026",
    title: "RyoMixed: Rebranding Global",
    description: "Salto de un script simple a una Suite Multimedia. Nueva interfaz basada en Glassmorphism y arquitectura modular.",
    type: 'update',
    icon: Globe,
    iconColor: "text-blue-400"
  },
  {
    version: "v1.0.0",
    date: "Febrero 2026",
    title: "Génesis del Proyecto",
    description: "Nace el motor original centrado exclusivamente en TikTok. El inicio de la descarga rápida, limpia y sin anuncios.",
    type: 'update',
    icon: Rocket,
    iconColor: "text-purple-500"
  }
];

interface AnunciosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AnunciosModal: React.FC<AnunciosModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#0d0d0d] border border-white/10 w-full max-w-[95%] sm:max-w-lg rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-500/5 flex flex-col">
        
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-br from-blue-600/10 via-transparent to-transparent">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-blue-600/20 rounded-xl sm:rounded-2xl">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tighter leading-none">Historial de Ryo</h2>
              <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Evolución del Sistema</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all text-gray-600 hover:text-white hover:rotate-90">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Timeline Content */}
        <div className="p-6 sm:p-8 max-h-[65vh] overflow-y-auto custom-scrollbar space-y-8 sm:space-y-10">
          {updates.map((update, index) => {
            // Renderizamos el componente de icono dinámicamente
            const IconComponent = update.icon;
            
            return (
              <div key={index} className="relative pl-8 sm:pl-10 border-l border-white/5 group">
                {/* Icono del Timeline */}
                <div className="absolute -left-[14px] sm:-left-[18px] top-0 w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#141414] border border-white/5 flex items-center justify-center shadow-xl group-hover:border-blue-500/50 transition-colors">
                  <IconComponent className={`w-3.5 h-3.5 sm:w-4 h-4 ${update.iconColor}`} />
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 bg-blue-500/10 rounded text-blue-400 border border-blue-500/20 uppercase tracking-widest">
                      {update.version}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-white/20 uppercase tracking-widest">{update.date}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide group-hover:text-blue-400 transition-colors">
                    {update.title}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 leading-relaxed font-medium">
                    {update.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-white/[0.01] border-t border-white/5 flex justify-center">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-10 py-3.5 rounded-xl text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] hover:bg-blue-500/10 transition-all border border-blue-500/20 active:scale-95"
          >
            Cerrar Registro
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnunciosModal;