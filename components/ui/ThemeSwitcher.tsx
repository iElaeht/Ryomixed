"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

interface ThemeSwitcherProps {
  variant?: "desktop" | "compact" | "mobile";
  open?: boolean;
  forceClose?: boolean;
  isNavbarScrolled?: boolean;
  inlinePanel?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelectTheme?: () => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = "desktop",
  open,
  forceClose = false,
  isNavbarScrolled = false,
  inlinePanel = false,
  onOpenChange,
  onSelectTheme,
}) => {
  const { theme, currentTheme, themes, setTheme } = useTheme();
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = typeof open === "boolean";
  const isOpen = isControlled ? open : internalOpen;

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onOpenChangeRef = useRef(onOpenChange);
  const onSelectThemeRef = useRef(onSelectTheme);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  useEffect(() => {
    onSelectThemeRef.current = onSelectTheme;
  }, [onSelectTheme]);

  const setOpenState = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChangeRef.current?.(next);
  };

  // Cierra el selector si el padre lo solicita (por ejemplo, al abrir el menú móvil)
  useEffect(() => {
    if (!forceClose || !isOpen) return;

    const frame = requestAnimationFrame(() => {
      if (!isControlled) {
        setInternalOpen(false);
      }
      onOpenChangeRef.current?.(false);
    });

    return () => cancelAnimationFrame(frame);
  }, [forceClose, isOpen, isControlled]);

  // Cierre por clic fuera o tecla Escape (solo para dropdowns flotantes)
  useEffect(() => {
    if (!isOpen || variant === "mobile" || inlinePanel) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      if (containerRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;

      setOpenState(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenState(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  });

  // Centra el tema activo únicamente dentro del contenedor de lista sin mover la ventana
  useEffect(() => {
    if (!isOpen && variant !== "mobile") return;

    const frame = requestAnimationFrame(() => {
      const listEl = listRef.current;
      const selectedEl = optionRefs.current[theme];
      if (listEl && selectedEl) {
        const targetTop =
          selectedEl.offsetTop -
          listEl.clientHeight / 2 +
          selectedEl.clientHeight / 2;
        listEl.scrollTop = Math.max(0, targetTop);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen, theme, variant]);

  const handleToggle = () => {
    setOpenState(!isOpen);
  };

  const handleChoose = (nextId: typeof theme) => {
    setTheme(nextId);
    if (!isControlled) {
      setInternalOpen(false);
    }
    onSelectThemeRef.current?.();
    onOpenChangeRef.current?.(false);
  };

  const renderOptionsList = (maxHeightClass = "max-h-64") => (
    <>
      <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        <span>Apariencia</span>
        <span>{themes.length}</span>
      </div>

      <div
        ref={listRef}
        className={`flex flex-col gap-0.5 ${maxHeightClass} overflow-y-auto no-scrollbar overscroll-contain`}
      >
        {themes.map((item) => {
          const isSelected = item.id === theme;
          return (
            <button
              key={item.id}
              ref={(el) => {
                optionRefs.current[item.id] = el;
              }}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => handleChoose(item.id)}
              className={`flex items-center justify-between gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-[var(--accent)]/14 text-[var(--text-primary)]"
                  : "text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]/80"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex items-center justify-center gap-1 w-8 h-5 rounded-md border border-black/15 shrink-0"
                  style={{ backgroundColor: item.preview.bg }}
                  aria-hidden="true"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.preview.accent }}
                  />
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.preview.secondary }}
                  />
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] truncate">
                    {item.description}
                  </div>
                </div>
              </div>

              {isSelected && (
                <Check className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </>
  );

  // Panel ancho integrado en flujo cuando el navbar está arriba en móvil/tablet
  if (variant === "mobile") {
    return (
      <div
        role="listbox"
        aria-label="Temas disponibles"
        className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 p-2 shadow-xl"
      >
        {renderOptionsList("max-h-60")}
      </div>
    );
  }

  const useInlineTopExpansion = inlinePanel && !isNavbarScrolled;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Seleccionar tema visual"
        className={`group flex items-center justify-between gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 hover:bg-[var(--bg-elevated)] hover:border-[var(--accent)]/50 text-[var(--text-primary)] transition-all duration-200 cursor-pointer ${
          variant === "compact"
            ? "px-2.5 py-1.5 text-xs"
            : "px-3.5 py-1.5 text-xs"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="flex items-center -space-x-1 shrink-0"
            aria-hidden="true"
          >
            <span
              className="w-3 h-3 rounded-full ring-1 ring-black/20"
              style={{ backgroundColor: currentTheme.preview.accent }}
            />
            <span
              className="w-3 h-3 rounded-full ring-1 ring-black/20"
              style={{ backgroundColor: currentTheme.preview.secondary }}
            />
          </span>

          {variant !== "compact" && (
            <span className="font-semibold tracking-tight truncate">
              {currentTheme.name}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !useInlineTopExpansion && (
        <div
          role="listbox"
          aria-label="Temas disponibles"
          className={`z-[120] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/98 backdrop-blur-2xl p-2 shadow-2xl ${
            isNavbarScrolled
              ? "fixed top-20 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-sm lg:absolute lg:top-full lg:left-auto lg:right-0 lg:translate-x-0 lg:mt-2.5 lg:w-80"
              : "absolute right-0 mt-2.5 w-72 sm:w-80 max-w-[calc(100vw-2rem)]"
          }`}
        >
          {renderOptionsList("max-h-64")}
        </div>
      )}
    </div>
  );
};