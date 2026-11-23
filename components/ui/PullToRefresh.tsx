"use client";

import React, { useEffect, useRef, useState } from "react";

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh?: () => void;
  threshold?: number;
  maxPull?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  maxPull = 120,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startYRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);

  useEffect(() => {
    const isTouchDevice =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    if (!isTouchDevice) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (isRefreshing) return;
      if (document.body.style.overflow === "hidden") return;
      if (window.scrollY > 0) return;
      if (e.touches.length !== 1) return;

      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startYRef.current === null || isRefreshing) return;
      if (document.body.style.overflow === "hidden") {
        startYRef.current = null;
        return;
      }

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startYRef.current;

      if (deltaY > 0 && window.scrollY <= 0) {
        isPullingRef.current = true;
        const damped = Math.min(maxPull, deltaY * 0.55);
        setPullDistance(damped);
      } else if (deltaY < 0) {
        startYRef.current = null;
        isPullingRef.current = false;
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (startYRef.current === null) return;

      const shouldRefresh = isPullingRef.current && pullDistance >= threshold;
      startYRef.current = null;
      isPullingRef.current = false;

      if (shouldRefresh) {
        setIsRefreshing(true);
        setPullDistance(64);

        if (onRefresh) {
          onRefresh();
          setTimeout(() => {
            setIsRefreshing(false);
            setPullDistance(0);
          }, 500);
        } else {
          window.location.reload();
        }
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isRefreshing, maxPull, onRefresh, pullDistance, threshold]);

  const progressRatio = Math.min(1, pullDistance / threshold);
  const readyToRelease = progressRatio >= 1;
  const activeHeight = isRefreshing ? 64 : pullDistance > 4 ? pullDistance : 0;

  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - (isRefreshing ? 0.3 : progressRatio));

  return (
    <div className="relative w-full flex-1 flex flex-col">
      <div
        aria-hidden="true"
        className={`lg:hidden w-full overflow-hidden flex flex-col items-center justify-center ${
          isPullingRef.current && !isRefreshing
            ? ""
            : "transition-[height] duration-200 ease-out"
        }`}
        style={{ height: `${activeHeight}px` }}
      >
        <div className="flex flex-col items-center justify-center gap-1">
          <svg
            className={`w-8 h-8 -rotate-90 ${
              isRefreshing ? "animate-spin" : ""
            }`}
            viewBox="0 0 32 32"
          >
            <circle
              cx="16"
              cy="16"
              r={radius}
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth="2"
              opacity="0.4"
            />
            <circle
              cx="16"
              cy="16"
              r={radius}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>

          {(readyToRelease || isRefreshing) && (
            <span className="text-[11px] font-medium text-[var(--text-muted)] tracking-wide whitespace-nowrap">
              {isRefreshing ? "Recargando..." : "Suelta para recargar"}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
};