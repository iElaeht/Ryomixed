"use client";

import React, { useEffect, useState } from "react";

const ROTATING_PHRASES = [
  "te inspira.",
  "te hace reír.",
  "quieres guardar.",
  "te mueve.",
];

const ROTATION_INTERVAL_MS = 3200;

export const HeroTitle: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);

      const switchTimeout = setTimeout(() => {
        setIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
        setIsVisible(true);
      }, 280);

      return () => clearTimeout(switchTimeout);
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mb-10 sm:mb-12 flex flex-col items-center text-center">
      {/* Resplandor ambiental suave detrás del título */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 h-36 w-72 sm:w-96 rounded-full blur-3xl opacity-20 transition-colors duration-500"
        style={{
          background:
            "radial-gradient(circle, var(--accent) 0%, var(--accent-secondary) 70%, transparent 100%)",
        }}
      />

      {/* Título principal con transición fluida */}
      <h1 className="relative text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] text-[var(--text-primary)]">
        Descarga lo que
        <span className="block mt-1 sm:mt-2 h-[1.2em] overflow-hidden">
          <span
            className={`inline-block text-transparent bg-clip-text transition-all duration-300 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0 blur-0"
                : "opacity-0 translate-y-3 blur-[4px]"
            }`}
            style={{
              backgroundImage:
                "linear-gradient(90deg, var(--accent), var(--accent-secondary))",
            }}
          >
            {ROTATING_PHRASES[index]}
          </span>
        </span>
      </h1>

      {/* Subtítulo limpio */}
      <p className="relative mt-4 max-w-md text-xs sm:text-sm text-[var(--text-muted)] font-medium leading-relaxed">
        Pega el enlace de tu video o galería favorita y obtén el archivo listo
        en segundos.
      </p>

      {/* Nota sutil integrada al final del hero */}
      <span className="relative mt-3 text-[11px] tracking-wide text-[var(--text-muted)]/70">
        Sin marcas de agua • Procesamiento directo
      </span>
    </div>
  );
};