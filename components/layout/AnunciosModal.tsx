// components/layout/AnunciosModal.tsx
"use client";

import React, { useEffect } from 'react';
import { X, Sparkles, Rocket, type LucideIcon } from 'lucide-react';

interface Update {
  version: string;
  date: string;
  title: string;
  description: string;
  type: 'feature' | 'fix' | 'update';
  icon: LucideIcon;
  iconColor: string;
}

const updates: Update[] = [
  {
    version: "v1.0.0",
    date: "Febrero 2026",
    title: "Génesis del Proyecto (TikTok Engine)",
    description: "Inicia el despliegue del motor original centrado exclusivamente en TikTok. El inicio de la descarga rápida, limpia, sin anuncios y optimizada para el procesamiento de videos.",
    type: 'update',
    icon: Rocket,
    iconColor: "text-purple-500"
  }
];

interface AnunciosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AnunciosModal({ isOpen, onClose }: AnunciosModalProps) {
  // Efecto para bloquear el scroll del fondo y escuchar la tecla Escape
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={onClose} // Cierra al hacer clic en el backdrop fuera del modal
    >
      {/* Contenedor Principal Adaptable (stopPropagation evita que clics dentro cierren el modal) */}
      <div 
        className="relative w-full max-w-lg bg-[#0d0d0d]/95 border border-white/10 rounded-2xl sm:rounded-[2.5rem] shadow-2xl shadow-blue-500/5 flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Fijo */}
        <div className="px-5 py-4 sm:p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-br from-blue-600/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-blue-600/20 rounded-xl">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tighter leading-none">Historial de Ryo</h2>
              <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Evolución del Sistema</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline Content con Scroll Independiente */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-8 space-y-6 sm:space-y-8">
          {updates.map((update, index) => {
            const IconComponent = update.icon;
            
            return (
              <div key={index} className="relative pl-7 sm:pl-9 border-l border-white/5 group">
                {/* Icono del Timeline */}
                <div className="absolute -left-[14px] sm:-left-[17px] top-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#141414] border border-white/5 flex items-center justify-center shadow-xl group-hover:border-blue-500/50 transition-colors">
                  <IconComponent className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${update.iconColor}`} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 bg-blue-500/10 rounded text-blue-400 border border-blue-500/20 uppercase tracking-widest">
                      {update.version}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-white/20 uppercase tracking-widest">{update.date}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide group-hover:text-blue-400 transition-colors">
                    {update.title}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 leading-relaxed font-medium">
                    {update.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}