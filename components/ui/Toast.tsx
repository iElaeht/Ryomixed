"use client";

import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const VARIANT_CONFIG: Record<
  ToastVariant,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    badgeStyle: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    badgeStyle: "bg-emerald-500/15 border-emerald-500/30",
  },
  error: {
    icon: AlertCircle,
    iconColor: "text-[var(--accent)]",
    badgeStyle: "bg-[var(--accent)]/15 border-[var(--accent)]/30",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    badgeStyle: "bg-amber-500/15 border-amber-500/30",
  },
  info: {
    icon: Info,
    iconColor: "text-[var(--accent-secondary)]",
    badgeStyle: "bg-[var(--accent-secondary)]/15 border-[var(--accent-secondary)]/30",
  },
};

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const { icon: Icon, iconColor, badgeStyle } = VARIANT_CONFIG[toast.variant];

  return (
    <div
      role="status"
      className="pointer-events-auto relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-xl text-[var(--text-primary)] shadow-2xl p-4 transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl border shrink-0 ${badgeStyle}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs font-bold leading-snug">{toast.title}</p>
          {toast.description && (
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
              {toast.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Cerrar notificación"
          className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mt-3 h-0.5 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: "100%",
            background:
              "linear-gradient(90deg, var(--accent), var(--accent-secondary))",
            animation: `toastShrink ${toast.duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};