"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  ShieldCheck,
  Zap,
  Heart,
  Sparkles,
  Clock,
  CheckCircle2,
  MessageSquare,
  Coffee,
  Copy,
  Check,
} from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONTACT_INFO = {
  githubUrl: "https://github.com/iElaeht",
  discordId: "elaeht",
  kofiUrl: "https://ko-fi.com/elaehtdev",
};

const GitHubMark: React.FC<{ className?: string }> = ({
  className = "w-4 h-4",
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const { showToast } = useToast();
  const [copiedDiscord, setCopiedDiscord] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      setCopiedDiscord(false);
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleCopyDiscord = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_INFO.discordId);
      setCopiedDiscord(true);
      showToast({
        title: "ID de Discord copiado",
        description: `Usuario "${CONTACT_INFO.discordId}" copiado al portapapeles.`,
        variant: "success",
      });
      setTimeout(() => setCopiedDiscord(false), 2500);
    } catch {
      showToast({
        title: `Discord: ${CONTACT_INFO.discordId}`,
        description: "Puedes copiar el ID directamente desde la tarjeta.",
        variant: "info",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/55 backdrop-blur-md transition-opacity"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
        className="relative w-full max-w-lg md:max-w-xl bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-44 h-44 blur-3xl rounded-full opacity-20"
          style={{ backgroundColor: "var(--accent)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 w-44 h-44 blur-3xl rounded-full opacity-20"
          style={{ backgroundColor: "var(--accent-secondary)" }}
        />

        {/* Header */}
        <div className="relative z-10 px-4 py-3.5 sm:px-6 sm:py-5 flex justify-between items-center border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className="p-2 sm:p-2.5 rounded-xl text-white shadow-sm shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent), var(--accent-secondary))",
              }}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h2
              id="about-modal-title"
              className="text-base sm:text-xl font-black text-[var(--text-primary)] tracking-tight uppercase italic truncate"
            >
              RYO<span className="text-[var(--accent)]">MIXED</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar información"
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 md:p-7 space-y-4 sm:space-y-5">
          {/* Bienvenida */}
          <div className="rounded-2xl p-4 sm:p-5 bg-[var(--bg-elevated)]/55 border border-[var(--border-subtle)]">
            <p className="text-sm sm:text-base font-bold text-[var(--text-primary)] mb-2">
              ¡Hola tú, que nos encontraste! 👋
            </p>
            <div className="space-y-2.5 text-xs text-[var(--text-muted)] leading-relaxed">
              <p>
                Creamos{" "}
                <span className="text-[var(--text-primary)] font-semibold">
                  RyoMixed
                </span>{" "}
                como un centro multimedia ágil y limpio. Actualmente, nuestra
                pasarela de{" "}
                <span className="text-[var(--accent)] font-semibold">
                  TikTok
                </span>{" "}
                está operativa y optimizada para descargas sin marca de agua y
                carruseles.
              </p>
              <p>
                Las integraciones de{" "}
                <span className="text-[var(--accent-secondary)] font-semibold">
                  YouTube
                </span>{" "}
                e{" "}
                <span className="text-[var(--accent)] font-semibold">
                  Instagram
                </span>{" "}
                están en fase de desarrollo y reestructuración para ofrecer la
                misma experiencia sin fricciones en próximas etapas.
              </p>
            </div>
          </div>

          {/* Estado de Plataformas */}
          <div className="bg-[var(--bg-elevated)]/40 border border-[var(--border-subtle)] rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
              Estado de Plataformas
            </h4>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-[var(--text-primary)] font-medium flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate">TikTok</span>
              </span>
              <span className="text-emerald-500 font-semibold flex items-center gap-1 text-[11px] shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> Disponible
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-[var(--text-primary)] font-medium flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="truncate">YouTube</span>
              </span>
              <span className="text-amber-500 font-semibold flex items-center gap-1 text-[11px] shrink-0">
                <Clock className="w-3.5 h-3.5" /> En Desarrollo
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-[var(--text-primary)] font-medium flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="truncate">Instagram</span>
              </span>
              <span className="text-amber-500 font-semibold flex items-center gap-1 text-[11px] shrink-0">
                <Clock className="w-3.5 h-3.5" /> En Desarrollo
              </span>
            </div>
          </div>

          {/* Tarjetas de Privacidad y Seguridad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-[var(--bg-elevated)]/40 border border-[var(--border-subtle)] rounded-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-[var(--accent-secondary)] shrink-0" />
                <span className="text-[10px] font-bold text-[var(--accent-secondary)] uppercase tracking-[0.18em]">
                  Privacidad
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Procesamiento directo. No solicitamos datos personales sensibles.
              </p>
            </div>

            <div className="p-4 bg-[var(--bg-elevated)]/40 border border-[var(--border-subtle)] rounded-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <Zap className="w-4 h-4 text-[var(--accent)] shrink-0" />
                <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-[0.18em]">
                  Seguridad
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Sin registros obligatorios ni almacenamiento permanente de archivos.
              </p>
            </div>
          </div>

          {/* Contacto y Apoyo (Mobile: 1 col | Tablet/Web: 3 cols) */}
          <div className="bg-[var(--bg-elevated)]/40 border border-[var(--border-subtle)] rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
              Contacto y Apoyo
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <a
                href={CONTACT_INFO.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex sm:flex-col items-center justify-between sm:justify-center gap-2 sm:gap-1.5 px-3.5 py-2.5 sm:p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-secondary)] text-[var(--text-primary)] transition-all"
              >
                <div className="flex items-center sm:flex-col gap-2 sm:gap-1.5 min-w-0">
                  <GitHubMark className="w-4 h-4 text-[var(--accent-secondary)] shrink-0" />
                  <span className="text-xs sm:text-[11px] font-semibold">
                    GitHub
                  </span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] truncate">
                  @iElaeht
                </span>
              </a>

              <button
                type="button"
                onClick={handleCopyDiscord}
                className="flex sm:flex-col items-center justify-between sm:justify-center gap-2 sm:gap-1.5 px-3.5 py-2.5 sm:p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-[var(--text-primary)] transition-all cursor-pointer"
              >
                <div className="flex items-center sm:flex-col gap-2 sm:gap-1.5 min-w-0">
                  <MessageSquare className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <span className="text-xs sm:text-[11px] font-semibold">
                    Discord
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--text-muted)]">
                  <span>{CONTACT_INFO.discordId}</span>
                  {copiedDiscord ? (
                    <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                  ) : (
                    <Copy className="w-3 h-3 shrink-0" />
                  )}
                </span>
              </button>

              <a
                href={CONTACT_INFO.kofiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex sm:flex-col items-center justify-between sm:justify-center gap-2 sm:gap-1.5 px-3.5 py-2.5 sm:p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-amber-400 text-[var(--text-primary)] transition-all"
              >
                <div className="flex items-center sm:flex-col gap-2 sm:gap-1.5 min-w-0">
                  <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs sm:text-[11px] font-semibold">
                    Ko-fi
                  </span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] truncate">
                  Apoyar
                </span>
              </a>
            </div>
          </div>

          {/* Firma */}
          <div className="pt-1 flex flex-wrap items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] text-center">
            <span>Hecho con</span>
            <Heart className="w-3.5 h-3.5 text-[var(--accent)] fill-[var(--accent)] shrink-0" />
            <span>por</span>
            <span className="font-bold text-[var(--text-primary)]">Elaeht</span>
            <span>•</span>
            <span className="font-bold text-[var(--accent)]">RyoTeams</span>
          </div>
        </div>
      </div>
    </div>
  );
}