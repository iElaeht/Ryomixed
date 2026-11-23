"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-[var(--bg-elevated)]/85 border border-[var(--border-subtle)]/40 ${className}`}
    />
  );
};

export const AppLoadingSkeleton: React.FC = () => {
  return (
    <div
      aria-label="Cargando aplicación"
      className="w-full max-w-4xl mx-auto px-4 pt-12 md:pt-16 pb-20 flex flex-col items-center text-center"
    >
      {/* Badge superior */}
      <Skeleton className="h-6 w-40 rounded-full mb-5" />

      {/* Título hero */}
      <Skeleton className="h-11 sm:h-14 w-3/4 max-w-xl mb-3 rounded-2xl" />
      <Skeleton className="h-11 sm:h-14 w-1/2 max-w-md mb-5 rounded-2xl" />

      {/* Subtítulo */}
      <Skeleton className="h-4 w-full max-w-md mb-2 rounded-lg" />
      <Skeleton className="h-4 w-2/3 max-w-xs mb-10 rounded-lg" />

      {/* Barra de búsqueda */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row items-center gap-3 mb-6">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-12 sm:h-14 w-full sm:w-36 rounded-2xl shrink-0" />
      </div>

      {/* Botón principal */}
      <Skeleton className="h-12 w-52 rounded-2xl" />
    </div>
  );
};

interface TiktokResultSkeletonProps {
  mode?: "video" | "gallery";
}

export const TiktokResultSkeleton: React.FC<TiktokResultSkeletonProps> = ({
  mode = "video",
}) => {
  return (
    <div
      aria-label="Cargando resultado de TikTok"
      className="w-full max-w-4xl mx-auto rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-xl p-5 sm:p-7 shadow-xl text-left"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Columna izquierda: autor, título y vista previa */}
        <div className="md:col-span-5 flex flex-col gap-3.5">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-5 w-full rounded-lg" />
          <Skeleton className="h-5 w-4/5 rounded-lg" />

          {mode === "gallery" ? (
            <div className="grid grid-cols-2 gap-2.5 mt-1">
              <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
              <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
            </div>
          ) : (
            <Skeleton className="aspect-[9/15] max-h-[380px] w-full rounded-2xl mt-1" />
          )}
        </div>

        {/* Columna derecha: pestañas, especificaciones y descarga */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2.5">
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>

          <Skeleton className="h-4 w-44 rounded-lg mt-1" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>

          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-2xl mt-2" />
        </div>
      </div>
    </div>
  );
};