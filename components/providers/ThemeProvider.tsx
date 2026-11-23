"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DEFAULT_THEME,
  THEMES,
  THEME_STORAGE_KEY,
  ThemeConfig,
  ThemeId,
  isValidThemeId,
} from "@/config/themes";

interface ThemeContextValue {
  theme: ThemeId;
  currentTheme: ThemeConfig;
  themes: ThemeConfig[];
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const SCROLL_IDLE_TIMEOUT_MS = 1000;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const attrTheme = document.documentElement.getAttribute("data-theme");
      if (isValidThemeId(attrTheme)) {
        setThemeState(attrTheme);
        return;
      }

      try {
        const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (isValidThemeId(saved)) {
          document.documentElement.setAttribute("data-theme", saved);
          setThemeState(saved);
        } else {
          document.documentElement.setAttribute("data-theme", DEFAULT_THEME);
          setThemeState(DEFAULT_THEME);
        }
      } catch {
        document.documentElement.setAttribute("data-theme", DEFAULT_THEME);
        setThemeState(DEFAULT_THEME);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const setTheme = useCallback((nextTheme: ThemeId) => {
    setThemeState(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Ignorar errores de almacenamiento en modo privado
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    const triggerScrollActivity = () => {
      root.classList.add("is-scrolling");
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = setTimeout(() => {
        root.classList.remove("is-scrolling");
      }, SCROLL_IDLE_TIMEOUT_MS);
    };

    window.addEventListener("scroll", triggerScrollActivity, { passive: true });
    window.addEventListener("wheel", triggerScrollActivity, { passive: true });

    return () => {
      window.removeEventListener("scroll", triggerScrollActivity);
      window.removeEventListener("wheel", triggerScrollActivity);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      root.classList.remove("is-scrolling");
    };
  }, []);

  const currentTheme = useMemo(
    () => THEMES.find((t) => t.id === theme) ?? THEMES[0],
    [theme]
  );

  const value = useMemo(
    () => ({
      theme,
      currentTheme,
      themes: THEMES,
      setTheme,
    }),
    [theme, currentTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  }
  return ctx;
}