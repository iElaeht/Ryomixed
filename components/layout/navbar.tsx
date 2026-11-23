"use client";

import React, { useState, useEffect, useRef } from "react";
import { Zap, Info, Sparkles, Coffee, Menu, X } from "lucide-react";
import AnunciosModal from "./AnunciosModal";
import AboutModal from "./AboutModal";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

interface NavProps {
  onOpenAbout?: () => void;
  onOpenAnuncios?: () => void;
}

const Navbar: React.FC<NavProps> = ({ onOpenAbout, onOpenAnuncios }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const [isAnunciosOpen, setIsAnunciosOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const scrollPositionRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (isMobileMenuOpen || isThemeOpen) return;
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileMenuOpen, isThemeOpen]);

  // Bloquea el scroll del fondo manteniendo la posición exacta de scroll
  useEffect(() => {
    const isAnyOpen = isMobileMenuOpen || isThemeOpen;
    if (!isAnyOpen) {
      return;
    }

    const scrollY = scrollPositionRef.current || window.scrollY;
    const prevBodyPosition = document.body.style.position;
    const prevBodyTop = document.body.style.top;
    const prevBodyLeft = document.body.style.left;
    const prevBodyRight = document.body.style.right;
    const prevBodyWidth = document.body.style.width;
    const prevBodyOverflow = document.body.style.overflow;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsThemeOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.position = prevBodyPosition;
      document.body.style.top = prevBodyTop;
      document.body.style.left = prevBodyLeft;
      document.body.style.right = prevBodyRight;
      document.body.style.width = prevBodyWidth;
      document.body.style.overflow = prevBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.scrollTo(0, scrollY);
    };
  }, [isMobileMenuOpen, isThemeOpen]);

  const closeOverlays = () => {
    setIsMobileMenuOpen(false);
    setIsThemeOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleToggleMobileMenu = () => {
    if (!isMobileMenuOpen && !isThemeOpen) {
      scrollPositionRef.current = window.scrollY;
    }
    const next = !isMobileMenuOpen;
    setIsMobileMenuOpen(next);
    if (next) {
      setIsThemeOpen(false);
    }
  };

  const handleThemeOpenChange = (open: boolean) => {
    if (open && !isMobileMenuOpen && !isThemeOpen) {
      scrollPositionRef.current = window.scrollY;
    }
    setIsThemeOpen(open);
    if (open) {
      setIsMobileMenuOpen(false);
    }
  };

  const scrollToTop = () => {
    closeOverlays();
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleOpenAbout = () => {
    closeOverlays();
    if (onOpenAbout) {
      onOpenAbout();
    } else {
      setIsAboutOpen(true);
    }
  };

  const handleOpenAnuncios = () => {
    closeOverlays();
    if (onOpenAnuncios) {
      onOpenAnuncios();
    } else {
      setIsAnunciosOpen(true);
    }
  };

  const menuItems = (
    <div className="flex flex-col gap-1.5">
      <a
        href="https://ko-fi.com/elaehtdev"
        target="_blank"
        rel="noopener noreferrer"
        onClick={closeMobileMenu}
        className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-[var(--bg-elevated)]/80 text-[var(--text-primary)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Coffee className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold tracking-wide">
            Apoyar proyecto
          </span>
        </div>
        <Zap className="w-3.5 h-3.5 text-[var(--accent)]" />
      </a>

      <button
        type="button"
        onClick={handleOpenAnuncios}
        className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-[var(--bg-elevated)]/80 text-[var(--text-primary)] transition-colors w-full cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-[var(--accent-secondary)]" />
          <span className="text-xs font-semibold tracking-wide">
            Novedades
          </span>
        </div>
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-secondary)] animate-pulse" />
      </button>

      <button
        type="button"
        onClick={handleOpenAbout}
        className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-[var(--bg-elevated)]/80 text-[var(--text-primary)] transition-colors w-full cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <Info className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-xs font-semibold tracking-wide">
            Sobre nosotros
          </span>
        </div>
      </button>
    </div>
  );

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[90] lg:hidden transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {/* Menú móvil centrado cuando el navbar está desplazado (isScrolled) */}
      {isMobileMenuOpen && isScrolled && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[130] lg:hidden w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/98 backdrop-blur-2xl p-3.5 shadow-2xl"
        >
          <div className="flex items-center justify-between px-3 pb-2.5 mb-2 border-b border-[var(--border-subtle)]">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Menú
            </span>
            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Cerrar menú"
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {menuItems}
        </div>
      )}

      <header
        className={`sticky top-0 z-[100] w-full transition-all duration-500 ease-out ${
          isScrolled ? "pt-3 sm:pt-4 px-3 sm:px-6" : "pt-0 px-0"
        }`}
      >
        <nav
          className={`mx-auto transition-all duration-500 ease-out relative z-[101] ${
            isScrolled
              ? "max-w-5xl rounded-2xl sm:rounded-full bg-[var(--bg-surface)]/90 backdrop-blur-xl border border-[var(--border-subtle)] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.35)] px-4 sm:px-6 py-2.5"
              : "max-w-7xl rounded-none bg-transparent border-b border-transparent px-5 sm:px-8 py-5"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            {/* LOGO MINIMALISTA */}
            <div
              onClick={scrollToTop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") scrollToTop();
              }}
              className="flex items-center gap-2.5 group cursor-pointer select-none active:scale-95 transition-transform shrink-0"
            >
              <div
                className="p-1.5 sm:p-2 rounded-xl transition-transform duration-500 group-hover:rotate-12"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent), var(--accent-secondary))",
                }}
              >
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-current" />
              </div>
              <span className="text-lg sm:text-xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter leading-none">
                Ryo<span className="text-[var(--accent)]">Mixed</span>
              </span>
            </div>

            {/* MENÚ DESKTOP (>= 1024px) */}
            <div className="hidden lg:flex items-center gap-1.5">
              <a
                href="https://ko-fi.com/elaehtdev"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Apoyar en Ko-fi"
                className="group flex items-center px-3 py-2 rounded-full text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]/80 transition-all duration-300"
              >
                <Coffee className="w-4 h-4 text-amber-400 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                <span className="max-w-0 overflow-hidden opacity-0 -translate-x-1.5 whitespace-nowrap group-hover:max-w-[90px] group-focus-visible:max-w-[90px] group-hover:opacity-100 group-focus-visible:opacity-100 group-hover:translate-x-2 group-focus-visible:translate-x-2 transition-all duration-300 ease-out">
                  Apoyar
                </span>
              </a>

              <button
                type="button"
                onClick={handleOpenAnuncios}
                aria-label="Novedades"
                className="group flex items-center px-3 py-2 rounded-full text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]/80 transition-all duration-300 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[var(--accent-secondary)] shrink-0 transition-transform duration-300 group-hover:scale-110" />
                <span className="max-w-0 overflow-hidden opacity-0 -translate-x-1.5 whitespace-nowrap group-hover:max-w-[110px] group-focus-visible:max-w-[110px] group-hover:opacity-100 group-focus-visible:opacity-100 group-hover:translate-x-2 group-focus-visible:translate-x-2 transition-all duration-300 ease-out">
                  Novedades
                </span>
              </button>

              <button
                type="button"
                onClick={handleOpenAbout}
                aria-label="Sobre nosotros"
                className="group flex items-center px-3 py-2 rounded-full text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]/80 transition-all duration-300 cursor-pointer"
              >
                <Info className="w-4 h-4 text-[var(--accent)] shrink-0 transition-transform duration-300 group-hover:scale-110" />
                <span className="max-w-0 overflow-hidden opacity-0 -translate-x-1.5 whitespace-nowrap group-hover:max-w-[130px] group-focus-visible:max-w-[130px] group-hover:opacity-100 group-focus-visible:opacity-100 group-hover:translate-x-2 group-focus-visible:translate-x-2 transition-all duration-300 ease-out">
                  Sobre nosotros
                </span>
              </button>

              <div className="w-px h-4 bg-[var(--border-subtle)] mx-2" />

              <ThemeSwitcher
                variant="desktop"
                isNavbarScrolled={isScrolled}
                onOpenChange={handleThemeOpenChange}
              />
            </div>

            {/* CONTROLES MOBILE Y TABLET (< 1024px) */}
            <div className="flex lg:hidden items-center gap-2 shrink-0">
              <div className="hidden sm:block">
                <ThemeSwitcher
                  variant="desktop"
                  forceClose={isMobileMenuOpen}
                  isNavbarScrolled={isScrolled}
                  inlinePanel
                  onOpenChange={handleThemeOpenChange}
                />
              </div>
              <div className="sm:hidden">
                <ThemeSwitcher
                  variant="compact"
                  forceClose={isMobileMenuOpen}
                  isNavbarScrolled={isScrolled}
                  inlinePanel
                  onOpenChange={handleThemeOpenChange}
                />
              </div>

              <button
                type="button"
                onClick={handleToggleMobileMenu}
                aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={isMobileMenuOpen}
                className="p-2 bg-transparent border-none text-[var(--text-primary)] hover:text-[var(--accent)] active:scale-90 transition-all cursor-pointer"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Panel desplegable ancho cuando estamos arriba (!isScrolled) */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
              !isScrolled && (isMobileMenuOpen || isThemeOpen)
                ? "max-h-96 opacity-100 pt-4 pb-2 mt-3 border-t border-[var(--border-subtle)]"
                : "max-h-0 opacity-0 pointer-events-none"
            }`}
          >
            {isMobileMenuOpen ? (
              menuItems
            ) : (
              <ThemeSwitcher
                variant="mobile"
                isNavbarScrolled={isScrolled}
                onSelectTheme={closeOverlays}
              />
            )}
          </div>
        </nav>
      </header>

      {!onOpenAnuncios && (
        <AnunciosModal
          isOpen={isAnunciosOpen}
          onClose={() => setIsAnunciosOpen(false)}
        />
      )}

      {!onOpenAbout && (
        <AboutModal
          isOpen={isAboutOpen}
          onClose={() => setIsAboutOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;