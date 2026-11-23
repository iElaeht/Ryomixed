"use client";

import React, { useEffect, useRef } from "react";
import {
  X,
  Sparkles,
  Rocket,
  Palette,
  Layers,
  type LucideIcon,
} from "lucide-react";

interface UpdateItem {
  version: string;
  date: string;
  title: string;
  description: string;
  highlights: string[];
  type: "feature" | "fix" | "update";
  icon: LucideIcon;
  accentMode: "primary" | "secondary";
}

const UPDATES: UpdateItem[] = [
  {
    version: "v2.1.0",
    date: "23 de Noviembre, 2026",
    title: "Refinamiento Móvil, Navegación Rápida y Skeletons Globales",
    description:
      "Mejoras de interacción en dispositivos móviles y escritorio, reinicio automático al tope al recargar, aviso de cookies adaptable y skeletons unificados para la web y los resultados de TikTok.",
    highlights: [
      "Corrección de selección de temas en el panel superior del navbar en móvil y tablet",
      "PullToRefresh fluido y botón Volver arriba cuadrado y adaptable en móvil, tablet y PC",
      "Reinicio de scroll a la parte superior al recargar y aviso de cookies con soporte para políticas",
      "Skeletons globales reutilizables para carga de aplicación y resultados de TikTok",
    ],
    type: "update",
    icon: Layers,
    accentMode: "primary",
  },
  {
    version: "v2.0.0",
    date: "23 de Noviembre, 2026",
    title: "Rediseño Visual, 9 Temas y Arquitectura Modular",
    description:
      "Renovación integral de la interfaz de RyoMixed enfocada en fluidez, diseño adaptable a los temas y una base preparada para escalar a nuevas redes sociales.",
    highlights: [
      "Sistema de 9 temas con persistencia y selector con auto-scroll al tema activo",
      "Navbar minimalista flotante al hacer scroll y hero con transición blur-slide",
      "Buscador general con barra de progreso integrada en el botón y toasts (5s / 10s)",
    ],
    type: "feature",
    icon: Palette,
    accentMode: "secondary",
  },
  {
    version: "v1.0.0",
    date: "Febrero 2026",
    title: "Génesis del Proyecto (TikTok Engine)",
    description:
      "Inicia el despliegue del motor original centrado exclusivamente en TikTok. El inicio de la descarga rápida, limpia, sin anuncios y optimizada para el procesamiento de videos.",
    highlights: [
      "Extracción directa sin marcas de agua",
      "Interfaz enfocada en velocidad y simplicidad",
    ],
    type: "update",
    icon: Rocket,
    accentMode: "primary",
  },
];

interface AnunciosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AnunciosModal({ isOpen, onClose }: AnunciosModalProps) {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (!isOpen) return;

    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyLeft = body.style.left;
    const prevBodyRight = body.style.right;
    const prevBodyWidth = body.style.width;
    const prevBodyOverflow = body.style.overflow;

    const currentScrollY =
      body.style.position === "fixed" && body.style.top
        ? Math.abs(parseInt(body.style.top, 10)) || 0
        : window.scrollY;

    scrollYRef.current = currentScrollY;

    html.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${currentScrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.left = prevBodyLeft;
      body.style.right = prevBodyRight;
      body.style.width = prevBodyWidth;
      body.style.overflow = prevBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.scrollTo(0, scrollYRef.current);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/55 backdrop-blur-md overscroll-none transition-opacity"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="anuncios-modal-title"
        className="relative w-full max-w-xl bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-elevated)]/50">
          <div className="flex items-center gap-3.5">
            <div
              className="p-2.5 rounded-2xl text-white shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent), var(--accent-secondary))",
              }}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2
                id="anuncios-modal-title"
                className="text-base sm:text-lg font-black tracking-tight text-[var(--text-primary)]"
              >
                Historial de RyoMixed
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] font-medium">
                Registro de versiones y mejoras del sistema
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar historial de novedades"
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent hover:border-[var(--border-subtle)] transition-all cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Contenido con línea de tiempo limpia */}
        <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar p-6 sm:p-7 space-y-7">
          {UPDATES.map((update, idx) => {
            const Icon = update.icon;
            const isPrimary = update.accentMode === "primary";
            const isLast = idx === UPDATES.length - 1;

            return (
              <div key={update.version} className="relative pl-9">
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[13px] top-8 bottom-[-28px] w-px bg-[var(--border-subtle)]"
                  />
                )}

                <div
                  className="absolute left-0 top-0.5 w-7 h-7 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center shadow-sm"
                  style={{
                    color: isPrimary
                      ? "var(--accent)"
                      : "var(--accent-secondary)",
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/45 p-4 sm:p-5 space-y-2.5 hover:border-[var(--accent)]/40 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border"
                      style={{
                        color: isPrimary
                          ? "var(--accent)"
                          : "var(--accent-secondary)",
                        borderColor: isPrimary
                          ? "color-mix(in srgb, var(--accent) 35%, transparent)"
                          : "color-mix(in srgb, var(--accent-secondary) 35%, transparent)",
                        backgroundColor: isPrimary
                          ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                          : "color-mix(in srgb, var(--accent-secondary) 12%, transparent)",
                      }}
                    >
                      {update.version}
                    </span>
                    <span className="text-[11px] font-medium text-[var(--text-muted)]">
                      {update.date}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-snug">
                    {update.title}
                  </h3>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {update.description}
                  </p>

                  <ul className="pt-1 space-y-1.5">
                    {update.highlights.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2 text-[11px] text-[var(--text-primary)]/90"
                      >
                        <span
                          className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: isPrimary
                              ? "var(--accent)"
                              : "var(--accent-secondary)",
                          }}
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pie del modal */}
        <div className="px-6 py-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <span>RyoMixed • RyoTeams</span>
          <button
            type="button"
            onClick={onClose}
            className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}