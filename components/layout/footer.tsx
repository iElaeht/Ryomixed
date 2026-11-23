"use client";

import React from "react";
import {
  Heart,
  Coffee,
  Box,
  Camera,
  CheckCircle2,
  Clock,
} from "lucide-react";

const PLATFORMS = [
  { name: "TikTok (Disponible)", active: true },
  { name: "YouTube (Próximamente)", active: false },
  { name: "Instagram (Próximamente)", active: false },
];

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const infinitePlatforms = [...PLATFORMS, ...PLATFORMS];

  return (
    <footer className="mt-20 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] pt-12 pb-8 px-6 relative transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-[var(--border-subtle)] items-start">
          {/* COLUMNA 1: IDENTIDAD Y PLATAFORMAS */}
          <div className="flex flex-col items-center sm:items-start space-y-4">
            <span className="text-xl font-black tracking-tight text-[var(--text-primary)] uppercase italic">
              Ryo<span className="text-[var(--accent)]">Mixed</span>
            </span>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-[240px] text-center sm:text-left">
              Descarga multimedia rápida, privada y sin marcas de agua.
            </p>

            <div className="w-full max-w-[210px] overflow-hidden mask-fade-edges relative h-5">
              <div className="flex gap-8 animate-scroll-x absolute whitespace-nowrap items-center">
                {infinitePlatforms.map((platform, index) => (
                  <span
                    key={index}
                    className={`text-[11px] font-medium flex items-center gap-1.5 ${
                      platform.active
                        ? "text-[var(--accent-secondary)]"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {platform.active ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    {platform.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMNA 2: APOYO */}
          <div className="flex flex-col items-center sm:items-start space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Apoyo
            </span>
            <a
              href="https://ko-fi.com/elaehtdev"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-2.5 -ml-2.5 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <div className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--accent)] group-hover:scale-105 transition-transform">
                <Coffee className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  Invítanos un café
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  Apoya en Ko-fi
                </div>
              </div>
            </a>
          </div>

          {/* COLUMNA 3: ALIADOS */}
          <div className="flex flex-col items-center sm:items-start space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Aliados
            </span>
            <a
              href="https://www.instagram.com/arqkalar97_3d/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-2.5 -ml-2.5 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <div className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--accent-secondary)] group-hover:scale-105 transition-transform">
                <Box className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-secondary)] transition-colors">
                  ArqKalar97
                </div>
                <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  <span>Modelado 3D</span>
                </div>
              </div>
            </a>
          </div>

          {/* COLUMNA 4: PROCESAMIENTO */}
          <div className="flex flex-col items-center sm:items-start lg:items-end space-y-2.5 text-center sm:text-left lg:text-right">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Privacidad
            </span>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-[230px]">
              El contenido se procesa vía stream directo. No almacenamos
              archivos en nuestros servidores.
            </p>
          </div>
        </div>

        {/* BARRA INFERIOR: AUTORÍA Y COPYRIGHT */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <p className="flex items-center gap-1.5">
            <span>Hecho con</span>
            <Heart className="w-3.5 h-3.5 text-[var(--accent)] fill-[var(--accent)]" />
            <span>por</span>
            <span className="font-semibold text-[var(--text-primary)]">
              Elaeht
            </span>
            <span>•</span>
            <span className="font-semibold text-[var(--accent)]">
              RyoTeams
            </span>
          </p>

          <p className="text-[11px] text-[var(--text-muted)]/80">
            © {currentYear} RyoMixed. Todos los derechos reservados.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scroll-x {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-x {
          animation: scroll-x 24s linear infinite;
        }
        .mask-fade-edges {
          mask-image: linear-gradient(to right, transparent, black 18%, black 82%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 18%, black 82%, transparent);
        }
      `}</style>
    </footer>
  );
};

export default Footer;