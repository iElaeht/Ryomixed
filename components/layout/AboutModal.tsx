// components/layout/AboutModal.tsx
"use client";

import React, { useEffect } from 'react';
import { X, ShieldCheck, Zap, Heart, Sparkles } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
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
        className="relative w-full max-w-lg bg-[#0d1117]/95 border border-white/10 rounded-2xl sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Luces de ambiente decorativas */}
        <div className="absolute -top-24 -right-24 w-40 h-40 bg-blue-600/20 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-40 h-40 bg-purple-600/10 blur-[60px] rounded-full pointer-events-none" />

        {/* Header Fijo */}
        <div className="px-5 py-4 sm:p-6 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600/20 p-2 rounded-xl">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tighter uppercase italic">
              RYO<span className="text-blue-600">MIXED</span>
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Área de Contenido con Scroll Independiente */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-8 space-y-5 sm:space-y-6">
          
          {/* Mensaje de Bienvenida */}
          <div className="bg-gradient-to-b from-white/[0.05] to-transparent rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-white/5">
            <p className="text-sm sm:text-base font-bold text-white mb-3">
              ¡Hola tú, que nos encontraste! 👋
            </p>
            <div className="space-y-3 text-[11px] sm:text-xs text-gray-400 leading-relaxed font-medium">
              <p>
                Hice este sistema pensando en que necesitas un conversor, pero no solo de una sola plataforma. Me basé en la necesidad de que tú puedas pedir como <span className="text-blue-400 font-bold">YouTube</span>, <span className="text-pink-400 font-bold">TikTok</span> o <span className="text-green-400 font-bold">Instagram</span>.
              </p>
              <p>
                En un futuro agregaremos más plataformas para que puedas tener una experiencia <span className="text-white font-bold italic">MultiFuncional</span>. Espero que te agrade nuestro sistema <span className="text-blue-500 font-bold">"RyoMixed"</span>.
              </p>
            </div>
          </div>

          {/* Tarjetas de Seguridad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="group p-4 bg-[#121821] border border-white/5 rounded-2xl hover:border-green-500/30 transition-colors">
              <div className="flex items-center gap-2.5 mb-2">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Privacidad</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400 leading-snug">Sistema protegido. No solicitamos información personal. Tu anonimato es prioridad.</p>
            </div>

            <div className="group p-4 bg-[#121821] border border-white/5 rounded-2xl hover:border-blue-500/30 transition-colors">
              <div className="flex items-center gap-2.5 mb-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Seguridad</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400 leading-snug">Sin registros obligatorios. Los datos se procesan y nunca se almacenan en servidores.</p>
            </div>
          </div>

          {/* Firma del Desarrollador */}
          <div className="pt-1 pb-1 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 group">
              <span className="text-xs sm:text-sm text-gray-400">Hecho con</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20 group-hover:scale-125 transition-transform animate-pulse" />
              <span className="text-white text-xs sm:text-sm font-black italic tracking-[0.15em]">ELAEHTDEV</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}