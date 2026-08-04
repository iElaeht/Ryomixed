// components/layout/AboutModal.tsx
"use client";

import React, { useEffect } from 'react';
import { X, ShieldCheck, Zap, Heart, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
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
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[#0d1117]/95 border border-white/10 rounded-2xl sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
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

        {/* Área de Contenido */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-8 space-y-5 sm:space-y-6">
          
          <div className="bg-gradient-to-b from-white/[0.05] to-transparent rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-white/5">
            <p className="text-sm sm:text-base font-bold text-white mb-3">
              ¡Hola tú, que nos encontraste! 👋
            </p>
            <div className="space-y-3 text-[11px] sm:text-xs text-gray-400 leading-relaxed font-medium">
              <p>
                Creamos <span className="text-blue-400 font-bold">RyoMixed</span> como un centro multimedia definitivo. Actualmente, nuestra pasarela de <span className="text-pink-400 font-bold">TikTok</span> se encuentra 100% operativa y optimizada para descargas sin marca de agua y carruseles.
              </p>
              <p>
                Las plataformas de <span className="text-blue-400 font-bold">YouTube</span> e <span className="text-green-400 font-bold">Instagram</span> están en fase de desarrollo activo y reestructuración para ofrecerte la misma calidad y estabilidad sin restricciones en el futuro.
              </p>
            </div>
          </div>

          {/* Estado de Plataformas */}
          <div className="bg-[#121821] border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Estado de Plataformas</h4>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span> TikTok
              </span>
              <span className="text-green-400 font-bold flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Disponible
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> YouTube
              </span>
              <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                <Clock className="w-3.5 h-3.5" /> En Desarrollo
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Instagram
              </span>
              <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                <Clock className="w-3.5 h-3.5" /> En Desarrollo
              </span>
            </div>
          </div>

          {/* Tarjetas de Seguridad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="group p-4 bg-[#121821] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-2.5 mb-2">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Privacidad</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400 leading-snug">Sistema protegido. No solicitamos información personal.</p>
            </div>

            <div className="group p-4 bg-[#121821] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-2.5 mb-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Seguridad</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400 leading-snug">Sin registros obligatorios ni almacenamiento de archivos.</p>
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