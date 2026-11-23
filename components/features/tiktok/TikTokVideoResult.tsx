"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Video,
  Music,
  Sparkles,
  Download,
  FileText,
  Zap,
  User,
  Clock,
  ImageOff,
  HardDrive,
} from "lucide-react";
import { TikTokContentData } from "./TiktokResult";
import { useToast } from "@/components/providers/ToastProvider";

interface TikTokVideoResultProps {
  data: TikTokContentData & {
    hdUrl?: string | null;
    playHd?: string | null;
    audioUrl?: string | null;
    size?: number | string | null;
    videoSize?: number | string | null;
    audioSize?: number | string | null;
  };
}

const DOWNLOAD_PROGRESS_DURATION_MS = 8000;

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

function formatBytes(bytes?: number | string | null): string | null {
  if (bytes === null || bytes === undefined || bytes === "") return null;

  if (typeof bytes === "string") {
    const trimmed = bytes.trim();
    if (/^\d+(\.\d+)?\s*(B|KB|MB|GB)$/i.test(trimmed)) {
      return trimmed.toUpperCase();
    }
    const parsedNum = Number(trimmed);
    if (!Number.isNaN(parsedNum) && parsedNum > 0) {
      bytes = parsedNum;
    } else {
      return trimmed;
    }
  }

  if (typeof bytes === "number" && Number.isFinite(bytes) && bytes > 0) {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  }

  return null;
}

export default function TikTokVideoResult({ data }: TikTokVideoResultProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"video" | "audio">("video");
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [imageError, setImageError] = useState(false);

  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setImageError(false);
  }, [data.cover]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const fallbackIds = useMemo(
    () => ({
      video: generateRandomId(7),
      audio: generateRandomId(7),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  const bestVideoUrl = useMemo(
    () => data.hdUrl || data.playHd || data.downloadUrl || "",
    [data]
  );

  const bestAudioUrl = useMemo(
    () => data.audioUrl || data.musicUrl || data.downloadUrl || "",
    [data]
  );

  const currentFileUrl = activeTab === "video" ? bestVideoUrl : bestAudioUrl;
  const fileExtension = activeTab === "video" ? "mp4" : "mp3";

  const estimatedFileName = useMemo(() => {
    const cleanTitle = sanitizeTitleForFileName(data.title);
    if (cleanTitle) {
      return `${cleanTitle}.${fileExtension}`;
    }
    const prefix = activeTab === "video" ? "Ryomixed_video" : "Ryomixed_audioo";
    return `${prefix}_${fallbackIds[activeTab]}.${fileExtension}`;
  }, [data.title, activeTab, fileExtension, fallbackIds]);

  const initialKnownSize = useMemo(() => {
    const rawSize =
      activeTab === "video"
        ? data.videoSize ?? data.size
        : data.audioSize ?? data.size;
    return formatBytes(rawSize);
  }, [activeTab, data]);

  const [fileSizeLabel, setFileSizeLabel] = useState<string | null>(
    initialKnownSize
  );
  const [checkingSize, setCheckingSize] = useState(false);

  useEffect(() => {
    setFileSizeLabel(initialKnownSize);

    if (initialKnownSize || !currentFileUrl) {
      setCheckingSize(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    setCheckingSize(true);

    const fetchContentLength = async () => {
      try {
        const proxyHeadUrl = `/api/proxy?url=${encodeURIComponent(
          currentFileUrl
        )}`;
        const headResp = await fetch(proxyHeadUrl, {
          method: "HEAD",
          signal: controller.signal,
        });
        const lenHeader = headResp.headers.get("content-length");
        if (lenHeader && !cancelled) {
          const formatted = formatBytes(Number(lenHeader));
          if (formatted) {
            setFileSizeLabel(formatted);
            setCheckingSize(false);
            return;
          }
        }
      } catch {
        // Fallback silencioso si no se puede leer HEAD
      }

      if (!cancelled) {
        setFileSizeLabel("Al descargar");
        setCheckingSize(false);
      }
    };

    fetchContentLength();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [initialKnownSize, currentFileUrl]);

  // Barra de progreso con tiempo mientras se descarga el archivo
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

  const handleDirectDownload = async () => {
    if (downloading) return;

    if (!currentFileUrl) {
      showToast({
        title: "Archivo no disponible",
        description:
          "No se encontró una fuente válida para descargar este elemento.",
        variant: "error",
      });
      return;
    }

    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    setDownloading(true);
    setDownloadProgress(5);

    try {
      const proxyDownloadUrl = `/api/proxy?url=${encodeURIComponent(
        currentFileUrl
      )}&filename=${encodeURIComponent(estimatedFileName)}&download=1`;

      const response = await fetch(proxyDownloadUrl);
      if (!response.ok) {
        throw new Error("No se pudo obtener el archivo desde el servidor.");
      }

      const blob = await response.blob();
      const formattedBlobSize = formatBytes(blob.size);
      if (formattedBlobSize) {
        setFileSizeLabel(formattedBlobSize);
      }

      setDownloadProgress(100);

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = estimatedFileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      showToast({
        title: "Descarga completada",
        description: `Se descargó ${estimatedFileName}${
          formattedBlobSize ? ` (${formattedBlobSize})` : ""
        }.`,
        variant: "success",
      });
    } catch (error: unknown) {
      showToast({
        title: "Error al descargar",
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un problema al descargar el archivo. Intenta nuevamente.",
        variant: "error",
      });
    } finally {
      resetTimerRef.current = window.setTimeout(() => {
        setDownloading(false);
        setDownloadProgress(0);
      }, 250);
    }
  };

  const formatDuration = () => {
    if (!data.duration) return "Clip breve";
    if (typeof data.duration === "string") return data.duration;
    const minutes = Math.floor(data.duration / 60);
    const seconds = data.duration % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center transition-colors">
      {/* Columna izquierda: Vista previa y metadata */}
      <div className="lg:col-span-5 flex flex-col gap-5 justify-between h-full border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] pb-6 lg:pb-0 lg:pr-8">
        <div className="space-y-2.5 text-left">
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
            {data.title || "Publicación de TikTok sin marca de agua"}
          </h2>
        </div>

        {/* Miniatura 9:16 responsiva */}
        <div className="relative w-40 sm:w-48 md:w-52 mx-auto aspect-[9/16] rounded-2xl overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-lg flex items-center justify-center">
          {data.cover && !imageError ? (
            <img
              src={data.cover}
              alt={data.title || "Vista previa del video"}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-[var(--text-muted)] p-4 text-center">
              <ImageOff className="w-7 h-7 opacity-75" />
              <span className="text-[11px] font-medium">
                Vista previa no disponible
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Columna derecha: Selector de formato, ficha técnica y descarga */}
      <div className="lg:col-span-7 flex flex-col justify-between gap-6 h-full">
        {/* Pestañas Video / Audio */}
        <div className="grid grid-cols-2 gap-1.5 bg-[var(--bg-elevated)] p-1.5 rounded-2xl border border-[var(--border-subtle)]">
          <button
            type="button"
            disabled={downloading}
            onClick={() => setActiveTab("video")}
            style={
              activeTab === "video"
                ? {
                    background:
                      "linear-gradient(135deg, var(--accent), var(--accent-secondary))",
                  }
                : undefined
            }
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all cursor-pointer disabled:opacity-60 ${
              activeTab === "video"
                ? "text-white shadow-md"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Video className="w-4 h-4 shrink-0" />
            <span>Video (MP4)</span>
          </button>

          <button
            type="button"
            disabled={downloading}
            onClick={() => setActiveTab("audio")}
            style={
              activeTab === "audio"
                ? {
                    background:
                      "linear-gradient(135deg, var(--accent), var(--accent-secondary))",
                  }
                : undefined
            }
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all cursor-pointer disabled:opacity-60 ${
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
            <span>Especificaciones del archivo</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[var(--bg-elevated)]/70 border border-[var(--border-subtle)] rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-1">
              <span className="text-[11px] text-[var(--text-muted)] font-medium">
                Formato
              </span>
              <span className="text-xs sm:text-sm font-bold text-[var(--accent-secondary)]">
                {activeTab === "video" ? "MP4" : "MP3"}
              </span>
            </div>

            <div className="bg-[var(--bg-elevated)]/70 border border-[var(--border-subtle)] rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-1">
              <span className="text-[11px] text-[var(--text-muted)] font-medium">
                Calidad
              </span>
              <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate max-w-full">
                {activeTab === "video" ? "Máxima HD" : "Máxima audio"}
              </span>
            </div>

            <div className="bg-[var(--bg-elevated)]/70 border border-[var(--border-subtle)] rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-1">
              <span className="text-[11px] text-[var(--text-muted)] font-medium inline-flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0" />
                <span>Duración</span>
              </span>
              <span className="text-xs sm:text-sm font-bold text-[var(--accent)]">
                {formatDuration()}
              </span>
            </div>

            <div className="bg-[var(--bg-elevated)]/70 border border-[var(--border-subtle)] rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-1">
              <span className="text-[11px] text-[var(--text-muted)] font-medium inline-flex items-center gap-1">
                <HardDrive className="w-3 h-3 shrink-0" />
                <span>Peso</span>
              </span>
              <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate max-w-full">
                {checkingSize ? "..." : fileSizeLabel || "Variable"}
              </span>
            </div>
          </div>

          {/* Nombre estimado */}
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

        {/* Botón de descarga con progressbar y tiempo */}
        <button
          type="button"
          onClick={handleDirectDownload}
          disabled={downloading}
          style={
            downloading
              ? undefined
              : {
                  background:
                    "linear-gradient(135deg, var(--accent), var(--accent-secondary))",
                }
          }
          className={`relative overflow-hidden w-full py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 shadow-lg flex items-center justify-center ${
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
              <span className="truncate font-semibold">
                Descargando {activeTab === "video" ? "video" : "audio"}...
              </span>
              <span className="font-mono text-xs font-bold text-[var(--accent-secondary)] shrink-0">
                ~{remainingSeconds}s
              </span>
            </span>
          ) : (
            <span className="relative z-10 flex items-center justify-center gap-2.5">
              <Download className="w-4 h-4 shrink-0" />
              <span>
                {activeTab === "video"
                  ? "Descargar video MP4"
                  : "Descargar audio MP3"}
              </span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}