"use client";

import React, { useEffect } from "react";

export default function Maintenance() {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-6 bg-[var(--bg-page)] text-[var(--text-primary)] font-sans select-none transition-colors duration-300">
      <div
        className="absolute inset-0 bg-[size:400%_400%] animate-gradientBG opacity-40 -z-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(-45deg, var(--bg-page), var(--bg-elevated), var(--bg-surface), var(--bg-page))",
        }}
      />

      <div className="relative w-full max-w-[440px] bg-[var(--bg-surface)]/95 backdrop-blur-2xl border border-[var(--border-subtle)] rounded-[28px] p-8 sm:p-10 shadow-2xl text-center">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{
              backgroundColor: "var(--accent)",
              boxShadow: "0 0 10px var(--accent)",
            }}
          />
          <span className="text-[11px] font-black text-[var(--accent)] tracking-[0.15em] uppercase">
            OFFLINE MODE
          </span>
        </div>

        <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight mb-5">
          Mantenimiento de Sistema
        </h1>

        <div className="h-px w-10 bg-[var(--border-subtle)] mx-auto mb-6" />

        <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-8 font-medium">
          <span className="text-[var(--text-primary)] font-bold">
            RyoMixed
          </span>{" "}
          está recibiendo una actualización crítica en sus sistemas. El acceso
          está temporalmente pausado. Informaremos los avances a través de{" "}
          <span className="text-[var(--accent-secondary)] font-bold">
            @elaehtdv
          </span>
          . Agradecemos tu paciencia.
        </p>

        <div className="flex justify-between items-center pt-6 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] font-mono tracking-wider">
          <span className="font-bold">RYOMIXED ENGINE v2.0</span>
          <span className="text-[var(--accent)] font-bold">ERR_SRV_MTN</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradientBG {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradientBG {
          animation: gradientBG 12s ease infinite;
        }
      `}</style>
    </div>
  );
}