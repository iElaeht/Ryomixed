"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Toast, ToastData, ToastVariant } from "@/components/ui/Toast";

interface ShowToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastData[];
  showToast: (options: ShowToastOptions) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DURATION_BY_VARIANT: Record<ToastVariant, number> = {
  success: 3000,
  info: 3000,
  warning: 10000,
  error: 10000,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismissToast = useCallback((id: string) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      title,
      description,
      variant = "info",
      duration,
    }: ShowToastOptions) => {
      const resolvedDuration = duration ?? DURATION_BY_VARIANT[variant];
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const nextToast: ToastData = {
        id,
        title,
        description,
        variant,
        duration: resolvedDuration,
      };

      setToasts((prev) => [...prev.slice(-3), nextToast]);

      timersRef.current[id] = setTimeout(() => {
        dismissToast(id);
      }, resolvedDuration);
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Contenedor superior, debajo del Navbar */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed top-20 sm:top-24 right-4 sm:right-6 z-[200] flex flex-col gap-2.5 w-[calc(100vw-2rem)] max-w-sm pointer-events-none"
      >
        {toasts.map((item) => (
          <Toast key={item.id} toast={item} onDismiss={dismissToast} />
        ))}
      </div>

      <style>{`
        @keyframes toastShrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>");
  }
  return ctx;
}