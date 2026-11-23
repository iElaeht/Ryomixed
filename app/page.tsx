"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/layout/navbar";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import Footer from "@/components/layout/footer";
import TiktokResult from "@/components/features/tiktok/TiktokResult";
import { TiktokResultSkeleton } from "@/components/ui/Skeleton";
import Maintenance from "@/components/layout/Maintenance";
import { SearchBar } from "@/components/ui/SearchBar";
import { HeroTitle } from "@/components/ui/HeroTitle";
import { useToast } from "@/components/providers/ToastProvider";
import {
  detectPlatform,
  extractCleanUrl,
  validateMediaUrl,
} from "@/utils/url-validator";
import {
  getSearchStatusMessages,
  SEARCH_PROGRESS_DURATION_MS,
} from "@/config/search-status";
import { Code2 } from "lucide-react";

const IS_MAINTENANCE = false;
const IS_DEV_MODE = false;
const CLIENT_FETCH_TIMEOUT_MS = 25000;

interface MediaResultData {
  platform: "tiktok";
  type: "video" | "image";
  title: string;
  author: string;
  cover?: string;
  downloadUrl?: string;
  images?: string[];
  musicUrl?: string;
  [key: string]: unknown;
}

export default function Home() {
  const { showToast } = useToast();

  const [url, setUrl] = useState("");
  const [mediaData, setMediaData] = useState<MediaResultData | null>(null);
  const [loading, setLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSubmittedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (IS_DEV_MODE) return;

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12") e.preventDefault();
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        ["I", "i", "C", "c", "J", "j"].includes(e.key)
      ) {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && ["U", "u"].includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const apiBaseUrl = useMemo(() => "", []);

  const activeStatusMessages = useMemo(() => {
    const clean = extractCleanUrl(url);
    const detected = clean ? detectPlatform(clean) : null;
    return getSearchStatusMessages(detected);
  }, [url]);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (loading) return;

      const validation = validateMediaUrl(url);
      if (!validation.isValid || !validation.cleanUrl || !validation.platform) {
        showToast({
          title: validation.errorTitle || "Enlace no válido",
          description:
            validation.errorDescription ||
            "Revisa el enlace ingresado e inténtalo de nuevo.",
          variant: "warning",
        });
        return;
      }

      // Evita lanzar exactamente la misma petición si ya está en curso
      if (lastSubmittedUrlRef.current === validation.cleanUrl && loading) {
        return;
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      lastSubmittedUrlRef.current = validation.cleanUrl;

      const timeoutId = window.setTimeout(() => {
        controller.abort();
      }, CLIENT_FETCH_TIMEOUT_MS);

      setLoading(true);
      setMediaData(null);

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/${validation.platform}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: validation.cleanUrl }),
            signal: controller.signal,
          }
        );

        const rawBody = await response.text();
        let responseData: {
          success?: boolean;
          message?: string;
          data?: MediaResultData;
        } = {};

        if (rawBody.trim()) {
          try {
            responseData = JSON.parse(rawBody);
          } catch {
            throw new Error(
              "El servidor devolvió una respuesta inesperada. Intenta nuevamente."
            );
          }
        }

        if (!response.ok) {
          throw new Error(
            responseData.message ||
              "El servidor no pudo procesar el enlace en este momento."
          );
        }

        if (
        responseData.success &&
        responseData.data &&
        validation.platform === "tiktok"
      ) {
        setMediaData({
          ...responseData.data,
          platform: "tiktok",
        });
          showToast({
            title: "Contenido listo",
            description: "El archivo se cargó correctamente.",
            variant: "success",
          });
        } else {
          throw new Error(
            responseData.message || "No se encontró contenido disponible."
          );
        }
      } catch (error: unknown) {
        const isAbortOrTimeout =
          error instanceof DOMException && error.name === "AbortError";
        const isNetworkError =
          !isAbortOrTimeout &&
          (error instanceof TypeError ||
            (error instanceof Error &&
              /fetch|network|failed/i.test(error.message)));

        showToast({
          title: isAbortOrTimeout
            ? "Tiempo de espera agotado"
            : isNetworkError
              ? "Servidor fuera de línea"
              : "No se pudo obtener el contenido",
          description: isAbortOrTimeout
            ? "La solicitud tardó demasiado. Intenta nuevamente en unos segundos."
            : isNetworkError
              ? "Parece haber una caída o fallo de red. Intenta nuevamente en unos segundos."
              : error instanceof Error
                ? error.message
                : "Ocurrió un error inesperado al conectar con el servidor.",
          variant: "error",
          duration: 10000,
        });
      } finally {
        window.clearTimeout(timeoutId);
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
        lastSubmittedUrlRef.current = null;
        setLoading(false);
      }
    },
    [apiBaseUrl, loading, showToast, url]
  );

  const handlePasteClick = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        throw new Error("Portapapeles no soportado.");
      }
      const text = (await navigator.clipboard.readText()).trim();
      if (!text) {
        showToast({
          title: "Portapapeles vacío",
          description: "Copia un enlace antes de pulsar Pegar.",
          variant: "info",
        });
        return;
      }
      setUrl(text);
      showToast({
        title: "Enlace pegado",
        description: "Listo para buscar contenido.",
        variant: "success",
      });
    } catch {
      showToast({
        title: "Pega manualmente",
        description:
          "En dispositivos móviles o red local, mantén presionado el campo y toca Pegar.",
        variant: "info",
      });
    }
  };

  if (IS_MAINTENANCE) {
    return <Maintenance />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-sans no-scrollbar relative">
      {IS_DEV_MODE && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-1.5 px-4 text-center flex items-center justify-center gap-2 text-amber-400 text-[10px] font-black uppercase tracking-widest">
          <Code2 className="w-3.5 h-3.5" />
          <span>Modo Desarrollador Activo (Inspección Permitida)</span>
        </div>
      )}
      <Navbar />
      <PullToRefresh>
        <main className="flex-grow flex flex-col items-center px-4 pt-10 md:pt-16 pb-20">
          <div className="w-full max-w-4xl text-center">
            <HeroTitle />

            <div className="mb-12">
              <SearchBar
                value={url}
                placeholder="Pega link de TikTok..."
                loading={loading}
                statusMessages={activeStatusMessages}
                progressDurationMs={SEARCH_PROGRESS_DURATION_MS}
                onChange={setUrl}
                onClear={() => {
                  abortControllerRef.current?.abort();
                  setUrl("");
                  setMediaData(null);
                }}
                onPaste={handlePasteClick}
                onSubmit={handleSearch}
              />
            </div>

            <div className="w-full flex justify-center pb-12 transition-all duration-300">
              {loading && <TiktokResultSkeleton />}
              {!loading && mediaData?.platform === "tiktok" && (
                <div className="w-full">
                  <TiktokResult data={mediaData} />
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </PullToRefresh>
    </div>
  );
}