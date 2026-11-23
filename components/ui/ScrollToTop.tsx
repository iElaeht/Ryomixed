"use client";

import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

interface ScrollToTopProps {
  threshold?: number;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  threshold = 320,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Volver arriba"
      title="Volver arriba"
      className={`group fixed z-[85] bottom-14 right-4 sm:bottom-14 sm:right-6 lg:bottom-16 lg:right-8 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 backdrop-blur-xl text-[var(--text-primary)] shadow-xl hover:bg-[var(--bg-elevated)] hover:border-[var(--accent)]/60 hover:text-[var(--accent)] active:scale-95 transition-all duration-300 ease-out cursor-pointer ${
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <ArrowUp className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-200 group-hover:-translate-y-0.5" />
    </button>
  );
};