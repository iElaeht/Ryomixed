"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Images,
  Music,
  Sparkles,
  Download,
  FileText,
  Zap,
  User,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  Layers,
  Maximize2,
  X,
} from "lucide-react";
import { TikTokContentData } from "./TiktokResult";
import { useToast } from "@/components/providers/ToastProvider";

interface TikTokGalleryResultProps {
  data: TikTokContentData;
}

const DOWNLOAD_PROGRESS_DURATION_MS = 8000;
const PRELOAD_CONCURRENCY = 3;

function generateRandomId(length = 7): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    const idx = Math.floor(Math.random() * chars.length);
    result += chars[idx];
  }
  return result;
}

function sanitizeTitleForFileName(rawTitle?: string): string {
  if (!rawTitle) return "";
  const withoutTags = rawTitle.replace(/#[\w\u00C0-\u024F]+/g, " ");
  const normalized = withoutTags
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32)
    .replace(/_+$/g, "");

  return normalized;
}

export default function TikTokGalleryResult({ data }: TikTokGalleryResultProps) {
  const { showToast } = useToast();
  const images = useMemo(
    () => (Array.isArray(data.images) ? data.images.filter(Boolean) : []),
    [data.images]
  );

  const audioUrl = useMemo(
    () => data.audioUrl || data.musicUrl || "",
    [data.audioUrl, data.musicUrl]
  );
  const hasAudio = Boolean(audioUrl);

  const [activeTab, setActiveTab] = useState<"images" | "audio">("images");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cachedImageUrls, setCachedImageUrls] = useState<Record<string, string>>(
    {}
  );
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const blobUrlsRef = useRef<string[]>([]);
  const thumbsTrackRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const fallbackId = useMemo(
    () => generateRandomId(7),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  const baseFileName = useMemo(() => {
    const cleanTitle = sanitizeTitleForFileName(data.title);
    if (cleanTitle) return cleanTitle;
    return activeTab === "images"
      ? `Ryomixed_galeria_${fallbackId}`
      : `Ryomixed_audioo_${fallbackId}`;
  }, [data.title, activeTab, fallbackId]);

  const activeImageUrl = images[selectedIndex] || "";
  const activeDisplaySrc = activeImageUrl
    ? cachedImageUrls[activeImageUrl] || ""
    : "";

  const estimatedFileName = useMemo(() => {
    if (activeTab === "audio") {
      return `${baseFileName}.mp3`;
    }
    if (images.length === 1) {
      return `${baseFileName}.jpg`;
    }
    return `${baseFileName}_0${selectedIndex + 1} (${images.length} fotos).jpg`;
  }, [activeTab, baseFileName, images.length, selectedIndex]);

  // Carga cada imagen una sola vez por búsqueda con concurrencia limitada y guarda su blob URL en memoria
  useEffect(() => {
    setActiveTab("images");
    setSelectedIndex(0);
    setBrokenImages({});
    setIsLightboxOpen(false);
    setCachedImageUrls({});

    blobUrlsRef.current.forEach((url) => window.URL.revokeObjectURL(url));
    blobUrlsRef.current = [];

    if (images.length === 0) return;

    let cancelled = false;

    const preloadGalleryImages = async () => {
      const nextMap: Record<string, string> = {};
      const createdBlobs: string[] = [];
      let cursor = 0;

      const worker = async () => {
        while (!cancelled) {
          const idx = cursor;
          cursor += 1;
          if (idx >= images.length) break;

          const imgUrl = images[idx];
          try {
            const proxyUrl = `/api/proxy?url=${encodeURIComponent(imgUrl)}`;
            const res = await fetch(proxyUrl);
            if (!res.ok) throw new Error("Failed to fetch image");
            const blob = await res.blob();
            if (cancelled) return;
            const objectUrl = window.URL.createObjectURL(blob);
            createdBlobs.push(objectUrl);
            nextMap[imgUrl] = objectUrl;
            setCachedImageUrls((prev) => ({ ...prev, [imgUrl]: objectUrl }));
          } catch {
            if (!cancelled) {
              setBrokenImages((prev) => ({ ...prev, [idx]: true }));
            }
          }
        }
      };

      const workers = Array.from(
        { length: Math.min(PRELOAD_CONCURRENCY, images.length) },
        () => worker()
      );
      await Promise.all(workers);

      if (cancelled) {
        createdBlobs.forEach((url) => window.URL.revokeObjectURL(url));
        return;
      }

      blobUrlsRef.current = createdBlobs;
      setCachedImageUrls((prev) => ({ ...prev, ...nextMap }));
    };

    preloadGalleryImages();

    return () => {
      cancelled = true;
      blobUrlsRef.current.forEach((url) => window.URL.revokeObjectURL(url));
      blobUrlsRef.current = [];
    };
  }, [images]);

  // Bloquea el scroll del body cuando el modal de imagen está abierto
  useEffect(() => {
    if (!isLightboxOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  // Centra suavemente la miniatura activa al cambiar de foto
  useEffect(() => {
    const activeThumb = thumbRefs.current[selectedIndex];
    activeThumb?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selectedIndex]);

  // Navegación por teclado cuando está abierto el modal de imagen
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft" && images.length > 1) {
        setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight" && images.length > 1) {
        setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, images.length]);

  useEffect(() => {
    if (!downloading) {
      setDownloadProgress(0);
      return;
    }

    const startTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(94, (elapsed / DOWNLOAD_PROGRESS_DURATION_MS) * 94);
      setDownloadProgress(pct);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [downloading]);

  const remainingSeconds = Math.max(
    1,
    Math.ceil(
      ((100 - downloadProgress) / 100) *
        (DOWNLOAD_PROGRESS_DURATION_MS / 1000)
    )
  );

  const triggerSingleFileDownload = async (
    fileUrl: string,
    fileName: string
  ) => {
    const proxyDownloadUrl = `/api/proxy?url=${encodeURIComponent(
      fileUrl
    )}&filename=${encodeURIComponent(fileName)}&download=1`;

    const response = await fetch(proxyDownloadUrl);
    if (!response.ok) {
      throw new Error("No se pudo obtener el archivo desde el servidor.");
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  };

  const handleDownloadCurrent = async () => {
    if (downloading) return;

    if (activeTab === "audio") {
      if (!audioUrl) {
        showToast({
          title: "Audio no disponible",
          description: "Esta publicación no cuenta con una pista de audio.",
          variant: "error",
        });
        return;
      }

      setDownloading(true);
      setDownloadProgress(5);

      try {
        const audioFileName = `${baseFileName}.mp3`;
        await triggerSingleFileDownload(audioUrl, audioFileName);
        setDownloadProgress(100);
        showToast({
          title: "Descarga completada",
          description: `Se descargó ${audioFileName}.`,
          variant: "success",
        });
      } catch (error: unknown) {
        showToast({
          title: "Error al descargar",
          description:
            error instanceof Error
              ? error.message
              : "No se pudo descargar la pista de audio.",
          variant: "error",
        });
      } finally {
        setTimeout(() => {
          setDownloading(false);
          setDownloadProgress(0);
        }, 250);
      }
      return;
    }

    if (!activeImageUrl) {
      showToast({
        title: "Imagen no disponible",
        description: "No se encontró una imagen válida para descargar.",
        variant: "error",
      });
      return;
    }

    setDownloading(true);
    setDownloadProgress(5);

    try {
      const singleFileName = `${baseFileName}_${selectedIndex + 1}.jpg`;
      await triggerSingleFileDownload(activeImageUrl, singleFileName);
      setDownloadProgress(100);
      showToast({
        title: "Descarga completada",
        description: `Se descargó ${singleFileName}.`,
        variant: "success",
      });
    } catch (error: unknown) {
      showToast({
        title: "Error al descargar",
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un problema al descargar la imagen.",
        variant: "error",
      });
    } finally {
      setTimeout(() => {
        setDownloading(false);
        setDownloadProgress(0);
      }, 250);
    }
  };

  const handleDownloadAllImages = async () => {
    if (downloading || images.length === 0) return;

    setDownloading(true);
    setDownloadProgress(5);

    let downloadedCount = 0;

    try {
      for (let i = 0; i < images.length; i += 1) {
        const imgUrl = images[i];
        if (!imgUrl) continue;
        const fileName = `${baseFileName}_${i + 1}.jpg`;
        await triggerSingleFileDownload(imgUrl, fileName);
        downloadedCount += 1;
        setDownloadProgress(Math.min(96, ((i + 1) / images.length) * 96));
      }

      setDownloadProgress(100);
      showToast({
        title: "Galería descargada",
        description: `Se descargaron ${downloadedCount} de ${images.length} imágenes.`,
        variant: "success",
      });
    } catch (error: unknown) {
      showToast({
        title: "Descarga incompleta",
        description:
          error instanceof Error
            ? error.message
            : `Se descargaron ${downloadedCount} imágenes antes de ocurrir un error.`,
        variant: "error",
      });
    } finally {
      setTimeout(() => {
        setDownloading(false);
        setDownloadProgress(0);
      }, 250);
    }
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const scrollThumbnailsBy = (direction: "left" | "right") => {
    const track = thumbsTrackRef.current;
    if (!track) return;
    const offset = direction === "left" ? -160 : 160;
    track.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <>
      <div className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center transition-colors">
        {/* Columna izquierda: Visor externo con flechas minimalistas y tira deslizable */}
        <div className="lg:col-span-5 flex flex-col gap-4 justify-between h-full border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] pb-6 lg:pb-0 lg:pr-8">
          <div className="space-y-2 text-left">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
              style={{
                color: "var(--accent)",
                backgroundColor:
                  "color-mix(in srgb, var(--accent) 12%, transparent)",
                borderColor:
                  "color-mix(in srgb, var(--accent) 28%, transparent)",
              }}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">@{data.author || "creador"}</span>
            </div>

            <h2 className="text-sm sm:text-base md:text-lg font-bold text-[var(--text-primary)] leading-snug line-clamp-3">
              {data.title || "Galería de TikTok sin marca de agua"}
            </h2>
          </div>

          {/* Contenedor externo para flechas sin fondo en hover */}
          <div className="group/viewer relative w-full max-w-[260px] sm:max-w-[290px] mx-auto flex items-center justify-center">
            {images.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Imagen anterior"
                className="hidden sm:flex items-center justify-center sm:absolute sm:-left-8 md:-left-9 top-1/2 -translate-y-1/2 p-1.5 bg-transparent border-none text-[var(--text-muted)] hover:text-[var(--accent)] opacity-0 group-hover/viewer:opacity-100 focus-visible:opacity-100 transition-all duration-200 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Imagen principal clickeable para abrir modal */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                if (activeDisplaySrc && !brokenImages[selectedIndex]) {
                  setIsLightboxOpen(true);
                }
              }}
              onKeyDown={(e) => {
                if (
                  (e.key === "Enter" || e.key === " ") &&
                  activeDisplaySrc &&
                  !brokenImages[selectedIndex]
                ) {
                  e.preventDefault();
                  setIsLightboxOpen(true);
                }
              }}
              aria-label="Ampliar imagen en vista modal"
              className="group/img relative w-44 sm:w-52 md:w-56 aspect-[3/4] rounded-2xl overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-lg flex items-center justify-center cursor-zoom-in"
            >
              {activeDisplaySrc && !brokenImages[selectedIndex] ? (
                <>
                  <img
                    src={activeDisplaySrc}
                    alt={`Imagen ${selectedIndex + 1} de ${images.length}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-[1.02]"
                    onError={() =>
                      setBrokenImages((prev) => ({
                        ...prev,
                        [selectedIndex]: true,
                      }))
                    }
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-[var(--bg-surface)]/80 text-[var(--text-primary)] border border-[var(--border-subtle)] opacity-0 group-hover/img:opacity-100 transition-opacity duration-200"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </span>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-[var(--text-muted)] p-4 text-center">
                  <ImageOff className="w-7 h-7 opacity-75" />
                  <span className="text-[11px] font-medium">
                    {brokenImages[selectedIndex]
                      ? "Imagen no disponible"
                      : "Cargando vista previa..."}
                  </span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                aria-label="Imagen siguiente"
                className="hidden sm:flex items-center justify-center sm:absolute sm:-right-8 md:-right-9 top-1/2 -translate-y-1/2 p-1.5 bg-transparent border-none text-[var(--text-muted)] hover:text-[var(--accent)] opacity-0 group-hover/viewer:opacity-100 focus-visible:opacity-100 transition-all duration-200 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Tira de miniaturas con deslizamiento lateral */}
          {images.length > 1 && (
            <div className="flex items-center gap-1.5 max-w-[260px] sm:max-w-[290px] w-full mx-auto">
              <button
                type="button"
                onClick={() => scrollThumbnailsBy("left")}
                aria-label="Deslizar miniaturas a la izquierda"
                className="p-1 bg-transparent border-none text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div
                ref={thumbsTrackRef}
                className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
              >
                {images.map((img, idx) => {
                  const isCurrent = idx === selectedIndex;
                  const thumbSrc = cachedImageUrls[img];
                  return (
                    <button
                      key={`${img}-${idx}`}
                      ref={(el) => {
                        thumbRefs.current[idx] = el;
                      }}
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      aria-label={`Ver imagen ${idx + 1}`}
                      className={`w-10 h-12 rounded-lg overflow-hidden border bg-[var(--bg-elevated)] transition-all shrink-0 cursor-pointer ${
                        isCurrent
                          ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30 scale-105"
                          : "border-[var(--border-subtle)] opacity-65 hover:opacity-100"
                      }`}
                    >
                      {thumbSrc ? (
                        <img
                          src={thumbSrc}
                          alt={`Miniatura ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => scrollThumbnailsBy("right")}
                aria-label="Deslizar miniaturas a la derecha"
                className="p-1 bg-transparent border-none text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Columna derecha: Selector, especificaciones y descarga */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6 h-full">
          {/* Pestañas Imágenes / Audio */}
          <div className="grid grid-cols-2 gap-1.5 bg-[var(--bg-elevated)] p-1.5 rounded-2xl border border-[var(--border-subtle)]">
            <button
              type="button"
              disabled={downloading}
              onClick={() => setActiveTab("images")}
              style={
                activeTab === "images"
                  ? {
                      background:
                        "linear-gradient(135deg, var(--accent), var(--accent-secondary))",
                    }
                  : undefined
              }
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all cursor-pointer disabled:opacity-60 ${
                activeTab === "images"
                  ? "text-white shadow-md"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Images className="w-4 h-4 shrink-0" />
              <span>Imágenes ({images.length})</span>
            </button>

            <button
              type="button"
              disabled={downloading || !hasAudio}
              onClick={() => {
                if (hasAudio) setActiveTab("audio");
              }}
              style={
                activeTab === "audio"
                  ? {
                      background:
                        "linear-gradient(135deg, var(--accent), var(--accent-secondary))",
                    }
                  : undefined
              }
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                activeTab === "audio"
                  ? "text-white shadow-md"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Music className="w-4 h-4 shrink-0" />
              <span>Audio (MP3)</span>
            </button>
          </div>

          {/* Especificaciones */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--accent-secondary)] text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Especificaciones del contenido</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="bg-[var(--bg-elevated)]/70 border border-[var(--border-subtle)] rounded-2xl p-3 flex sm:flex-col items-center justify-between sm:justify-center text-center gap-1">
                <span className="text-[11px] text-[var(--text-muted)] font-medium">
                  Formato
                </span>
                <span className="text-xs sm:text-sm font-bold text-[var(--accent-secondary)]">
                  {activeTab === "images" ? "JPG" : "MP3"}
                </span>
              </div>

              <div className="bg-[var(--bg-elevated)]/70 border border-[var(--border-subtle)] rounded-2xl p-3 flex sm:flex-col items-center justify-between sm:justify-center text-center gap-1">
                <span className="text-[11px] text-[var(--text-muted)] font-medium">
                  Selección
                </span>
                <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                  {activeTab === "images"
                    ? `${selectedIndex + 1} de ${images.length}`
                    : "Pista original"}
                </span>
              </div>

              <div className="bg-[var(--bg-elevated)]/70 border border-[var(--border-subtle)] rounded-2xl p-3 flex sm:flex-col items-center justify-between sm:justify-center text-center gap-1">
                <span className="text-[11px] text-[var(--text-muted)] font-medium">
                  Calidad
                </span>
                <span className="text-xs sm:text-sm font-bold text-[var(--accent)]">
                  {activeTab === "images"
                    ? "Original sin marca"
                    : "Máxima audio"}
                </span>
              </div>
            </div>

            {/* Nombre de archivo */}
            <div className="bg-[var(--bg-elevated)]/70 border border-[var(--border-subtle)] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="p-2.5 rounded-xl border shrink-0"
                  style={{
                    color: "var(--accent-secondary)",
                    backgroundColor:
                      "color-mix(in srgb, var(--accent-secondary) 12%, transparent)",
                    borderColor:
                      "color-mix(in srgb, var(--accent-secondary) 28%, transparent)",
                  }}
                >
                  <FileText className="w-4 h-4" />
                </span>
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-[11px] text-[var(--text-muted)] font-medium">
                    Nombre de archivo
                  </span>
                  <span className="text-xs font-semibold text-[var(--text-primary)] truncate font-mono">
                    {estimatedFileName}
                  </span>
                </div>
              </div>

              <Zap className="w-4 h-4 text-[var(--accent-secondary)] shrink-0" />
            </div>
          </div>

          {/* Acciones de descarga */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleDownloadCurrent}
              disabled={downloading}
              style={
                downloading
                  ? undefined
                  : {
                      background:
                        "linear-gradient(135deg, var(--accent), var(--accent-secondary))",
                    }
              }
              className={`relative overflow-hidden flex-1 py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 shadow-lg flex items-center justify-center ${
                downloading
                  ? "bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] cursor-wait"
                  : "text-white tracking-wide hover:opacity-95 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              }`}
            >
              {downloading && (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 transition-[width] duration-75 ease-linear opacity-35"
                  style={{
                    width: `${downloadProgress}%`,
                    background:
                      "linear-gradient(90deg, var(--accent), var(--accent-secondary))",
                  }}
                />
              )}

              {downloading ? (
                <span className="relative z-10 flex items-center justify-between w-full gap-3">
                  <span className="truncate font-semibold">Descargando...</span>
                  <span className="font-mono text-xs font-bold text-[var(--accent-secondary)] shrink-0">
                    ~{remainingSeconds}s
                  </span>
                </span>
              ) : (
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  <Download className="w-4 h-4 shrink-0" />
                  <span>
                    {activeTab === "images"
                      ? `Descargar foto ${selectedIndex + 1}`
                      : "Descargar audio MP3"}
                  </span>
                </span>
              )}
            </button>

            {activeTab === "images" && images.length > 1 && (
              <button
                type="button"
                onClick={handleDownloadAllImages}
                disabled={downloading}
                className="py-3.5 sm:py-4 px-5 rounded-2xl font-semibold text-xs sm:text-sm bg-[var(--bg-elevated)] hover:border-[var(--accent)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Layers className="w-4 h-4 text-[var(--accent-secondary)] shrink-0" />
                <span>Descargar todas ({images.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de vista ampliada (Lightbox) */}
      {isLightboxOpen && activeDisplaySrc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Vista ampliada de imagen ${selectedIndex + 1}`}
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[88vh] flex flex-col items-center justify-center gap-4"
          >
            <div className="w-full flex items-center justify-between text-xs text-[var(--text-primary)] bg-[var(--bg-surface)]/90 border border-[var(--border-subtle)] px-4 py-2.5 rounded-2xl">
              <span className="font-semibold truncate">
                {data.title || `@${data.author || "creador"}`} •{" "}
                <span className="text-[var(--accent-secondary)]">
                  {selectedIndex + 1} / {images.length}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                aria-label="Cerrar vista ampliada"
                className="p-1.5 bg-transparent border-none text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex items-center justify-center w-full">
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Imagen anterior"
                  className="p-2 bg-transparent border-none text-white/75 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
              )}

              <img
                src={activeDisplaySrc}
                alt={`Imagen ${selectedIndex + 1} ampliada`}
                className="max-h-[70vh] max-w-full object-contain rounded-2xl border border-[var(--border-subtle)] shadow-2xl"
              />

              {images.length > 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Imagen siguiente"
                  className="p-2 bg-transparent border-none text-white/75 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}