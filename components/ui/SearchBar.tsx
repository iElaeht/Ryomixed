"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, ClipboardPaste, X } from "lucide-react";
import {
  SEARCH_PROGRESS_DURATION_MS,
  SEARCH_STATUS_BY_PLATFORM,
} from "@/config/search-status";

export interface SearchBarProps {
  value: string;
  placeholder?: string;
  submitLabel?: string;
  loading?: boolean;
  statusMessages?: readonly string[];
  progressDurationMs?: number;
  onChange: (value: string) => void;
  onClear: () => void;
  onPaste: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const MAX_INPUT_LENGTH = 2048;

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  placeholder = "Pega un enlace aquí...",
  submitLabel = "Buscar contenido",
  loading = false,
  statusMessages,
  progressDurationMs = SEARCH_PROGRESS_DURATION_MS,
  onChange,
  onClear,
  onPaste,
  onSubmit,
}) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const safeMessages = useMemo(() => {
    if (statusMessages && statusMessages.length > 0) {
      return statusMessages;
    }
    return SEARCH_STATUS_BY_PLATFORM.default;
  }, [statusMessages]);

  useEffect(() => {
    if (!loading) {
      setProgress(0);
      setMessageIndex(0);
      return;
    }

    const duration = Math.max(1000, progressDurationMs);
    const startTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const elapsed = Math.max(0, now - startTime);
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      const nextIndex = Math.min(
        safeMessages.length - 1,
        Math.floor((elapsed / duration) * safeMessages.length)
      );
      setMessageIndex(nextIndex);

      if (elapsed < duration) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [loading, progressDurationMs, safeMessages]);

  const remainingSeconds = Math.max(
    0,
    Math.ceil(((100 - progress) / 100) * (progressDurationMs / 1000))
  );

  const currentStatusText =
    safeMessages[messageIndex] ?? safeMessages[0] ?? "Procesando...";

  const handleFormSubmit = (e: React.FormEvent) => {
    if (loading || !value.trim()) {
      e.preventDefault();
      return;
    }
    onSubmit(e);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <form
        onSubmit={handleFormSubmit}
        className="w-full flex flex-col items-center gap-5"
      >
        <div className="w-full flex items-center bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus-within:border-[var(--accent)] rounded-2xl p-1.5 shadow-lg transition-colors">
          <input
            type="text"
            value={value}
            maxLength={MAX_INPUT_LENGTH}
            placeholder={placeholder}
            disabled={loading}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Enlace multimedia"
            className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 text-[var(--text-primary)] py-3.5 px-4 sm:px-5 outline-none text-sm sm:text-base placeholder:text-[var(--text-muted)] font-medium disabled:opacity-70"
          />

          <div className="flex items-center gap-1.5 pr-1 shrink-0">
            {value && !loading && (
              <button
                type="button"
                aria-label="Limpiar enlace"
                onClick={onClear}
                className="p-2.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (!loading) onPaste();
              }}
              disabled={loading}
              aria-label="Pegar enlace desde el portapapeles"
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--bg-elevated)] hover:border-[var(--accent-secondary)]/50 text-[var(--accent-secondary)] border border-[var(--border-subtle)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ClipboardPaste className="w-4 h-4 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">
                Pegar
              </span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !value.trim()}
          style={
            loading
              ? undefined
              : {
                  background:
                    "linear-gradient(135deg, var(--accent), var(--accent-secondary))",
                }
          }
          className={`relative overflow-hidden py-3.5 px-6 rounded-2xl font-bold text-xs transition-all duration-300 shadow-md flex items-center justify-center ${
            loading
              ? "w-full sm:w-96 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] cursor-wait"
              : "w-full sm:w-64 text-white uppercase tracking-[0.18em] hover:opacity-95 active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
          }`}
        >
          {loading && (
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 transition-[width] duration-75 ease-linear opacity-35"
              style={{
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg, var(--accent), var(--accent-secondary))",
              }}
            />
          )}

          {loading ? (
            <span className="relative z-10 flex items-center justify-between w-full gap-3 px-1">
              <span className="truncate font-semibold tracking-wide">
                {currentStatusText}
              </span>
              <span className="font-mono text-[11px] font-bold text-[var(--accent-secondary)] shrink-0">
                {remainingSeconds}s
              </span>
            </span>
          ) : (
            <span className="relative z-10 flex items-center justify-center gap-2.5">
              <Search className="w-4 h-4 shrink-0" />
              <span>{submitLabel}</span>
            </span>
          )}
        </button>
      </form>
    </div>
  );
};