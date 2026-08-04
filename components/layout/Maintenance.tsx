// components/layout/Maintenance.tsx
"use client";

import React, { useEffect } from 'react';

export default function Maintenance() {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-6 bg-[#050505] font-sans select-none">
      {/* Fondo con movimiento sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(-45deg,#050505,#0a0f1a,#050505,#080c14)] bg-[size:400%_400%] animate-gradientBG -z-10" />
      
      <div className="relative w-full max-w-[440px] bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[28px] p-8 sm:p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] text-center">
        
        {/* Indicador de estado minimalista */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-2 h-2 bg-[#fe2c55] rounded-full shadow-[0_0_10px_#fe2c55] animate-pulse" />
          <span className="text-[11px] font-black text-[#fe2c55] tracking-[0.15em]">OFFLINE MODE</span>
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight mb-5">
          Mantenimiento de Sistema
        </h1>
        
        <div className="h-px w-10 bg-white/10 mx-auto mb-6" />
        
        <p className="text-sm text-gray-400 leading-relaxed mb-8 font-medium">
          <span className="text-white font-bold">RyoMixed</span> está recibiendo una actualización crítica en sus sistemas. El acceso está temporalmente pausado. Informaremos los avances a través de <span className="text-[#25f4ee] font-bold">@elaehtdv</span>. Agradecemos tu paciencia.
        </p>

        <div className="flex justify-between items-center pt-6 border-t border-white/5 text-[10px] text-gray-500 font-mono tracking-wider">
          <span className="font-bold">RYOMIXED ENGINE v2.0</span>
          <span className="text-[#fe2c55]/80 font-bold">ERR_SRV_MTN</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradientBG {
          animation: gradientBG 12s ease infinite;
        }
      `}</style>
    </div>
  );
}