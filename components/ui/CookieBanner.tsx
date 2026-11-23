"use client";

import React, { useEffect, useState } from "react";
import { Cookie } from "lucide-react";

const COOKIE_CONSENT_KEY = "ryomixed-cookie-consent";

interface CookieBannerProps {
  onOpenPrivacy?: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenPrivacy }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!saved) {
        const frame = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(frame);
      }
    } catch {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
  }, []);

  const handleChoice = (choice: "accepted" | "essential") => {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
      document.cookie = `${COOKIE_CONSENT_KEY}=${choice}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignorar si el navegador restringe almacenamiento
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-5 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-md lg:bottom-7 lg:left-7 lg:max-w-xl z-[95] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-2xl p-4 sm:p-5 lg:p-6 shadow-2xl text-[var(--text-primary)]"
    >
      <div className="flex items-start gap-3.5 lg:gap-4">
        <div className="p-2.5 lg:p-3 rounded-xl bg-[var(--accent)]/12 text-[var(--accent)] shrink-0 mt-0.5">
          <Cookie className="w-4 h-4 lg:w-5 lg:h-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm lg:text-base font-bold tracking-tight">
            Uso de cookies
          </p>
          <p className="text-xs lg:text-[13px] text-[var(--text-muted)] leading-relaxed mt-1 lg:mt-1.5">
            Utilizamos cookies y almacenamiento local para recordar tus preferencias (como el tema visual) y mejorar tu experiencia en RyoMixed.
            {onOpenPrivacy && (
              <>
                {" "}
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  className="underline hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Ver política
                </button>
              </>
            )}
          </p>

          <div className="flex items-center justify-end gap-2.5 mt-3.5 lg:mt-4">
            <button
              type="button"
              onClick={() => handleChoice("essential")}
              className="px-3.5 py-2 lg:px-4 lg:py-2 rounded-xl text-xs font-semibold border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
            >
              Solo esenciales
            </button>
            <button
              type="button"
              onClick={() => handleChoice("accepted")}
              className="px-4 py-2 lg:px-5 lg:py-2 rounded-xl text-xs font-semibold bg-[var(--accent)] text-white hover:opacity-90 transition-opacity cursor-pointer"
            >
              Aceptar cookies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};