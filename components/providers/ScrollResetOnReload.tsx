"use client";

import { useEffect } from "react";

export function ScrollResetOnReload() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const scrollToTopImmediate = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };

    // Al cargar / recargar la página
    scrollToTopImmediate();
    const frame = requestAnimationFrame(scrollToTopImmediate);

    // Antes de recargar o salir de la vista, asegura que el origen sea arriba
    const handleBeforeUnload = () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
    };
  }, []);

  return null;
}