// components/results/tiktok/TikTokVideoResult.tsx
"use client";

import { useState } from "react";
import { Video, Music, Sparkles, Download, FileText, Zap, Loader2, User, Clock, ImageOff } from "lucide-react";
import { TikTokContentData } from "./TiktokResult";

interface TikTokVideoResultProps {
  data: TikTokContentData;
}

export default function TikTokVideoResult({ data }: TikTokVideoResultProps) {
  const [activeTab, setActiveTab] = useState<"video" | "audio">("video");
  const [downloading, setDownloading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Función inteligente y blindada contra CORS para descarga directa
  const handleDirectDownload = async (fileUrl: string, fileExtension: string) => {
    if (!fileUrl) return;
    setDownloading(true);

    try {
      const response = await fetch(fileUrl, { mode: "cors" });
      if (!response.ok) throw new Error("CORS or Network error");
      const blob = await response.blob();
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      
      // Limpieza exacta del título aplicando las nuevas reglas de nombres por defecto o título real
      const cleanAuthor = data.author ? data.author.replace(/[^a-zA-Z0-9]/g, "_") : "Unknown";
      let customFileName = activeTab === "video" ? `Ryomixed_Reel_${cleanAuthor}` : `Ryomixed_audio_${cleanAuthor}`;

      if (data.title && data.title.trim() !== "") {
        const sanitized = data.title.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").slice(0, 25);
        const cleanTitle = sanitized.endsWith("_") ? sanitized.slice(0, -1) : sanitized;
        customFileName = activeTab === "video" ? cleanTitle : `Ryomixed_audio_${cleanAuthor}`;
      }

      link.download = `${customFileName}.${fileExtension}`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Plan B: Si el navegador bloquea el blob, se abre de forma segura en una pestaña nueva
      const fallbackLink = document.createElement("a");
      fallbackLink.href = fileUrl;
      fallbackLink.target = "_blank";
      fallbackLink.rel = "noopener noreferrer";
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      document.body.removeChild(fallbackLink);
    } finally {
      setDownloading(false);
    }
  };

  const currentFileUrl = activeTab === "video" ? (data.downloadUrl || "") : (data.musicUrl || data.downloadUrl || "");
  const fileExtension = activeTab === "video" ? "mp4" : "mp3";

  // Generación de nombre estimado para la interfaz con las nuevas reglas
  const getEstimatedFileName = () => {
    const cleanAuthor = data.author ? data.author.replace(/[^a-zA-Z0-9]/g, "_") : "Unknown";
    
    if (activeTab === "audio") {
      return `Ryomixed_audio_${cleanAuthor}.mp3`;
    }
    
    if (data.title && data.title.trim() !== "") {
      const sanitized = data.title.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").slice(0, 25);
      const cleanTitle = sanitized.endsWith("_") ? sanitized.slice(0, -1) : sanitized;
      return `${cleanTitle}.mp4`;
    }
    
    return `Ryomixed_Reel_${cleanAuthor}.mp4`;
  };

  // Formateador de duración (si viene en segundos, ej: 45 -> 0:45)
  const formatDuration = () => {
    if (!data.duration) return "Video Corto";
    if (typeof data.duration === "string") return data.duration;
    const minutes = Math.floor(data.duration / 60);
    const seconds = data.duration % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds} min`;
  };

  return (
    <div className="w-full bg-[#0b0f17] border border-white/10 rounded-3xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in zoom-in-95 duration-300">
      
      {/* Columna Izquierda: Vista Previa y Datos */}
      <div className="lg:col-span-5 flex flex-col gap-5 justify-between h-full border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fe2c55]/10 border border-[#fe2c55]/20 text-[#fe2c55] text-xs font-bold">
            <User size={13} />
            <span>@{data.author || "Usuario"}</span>
          </div>
          <h2 className="text-base md:text-lg font-bold text-white leading-snug line-clamp-3">
            {data.title || "TikTok Video sin marca de agua"}
          </h2>
        </div>

        {/* Contenedor de la Miniatura con manejo de errores */}
        <div className="relative w-full max-w-[220px] mx-auto aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-xl flex items-center justify-center">
          {data.cover && !imageError ? (
            <img 
              src={data.cover} 
              alt="TikTok Cover" 
              className="w-full h-full object-cover"
              onError={() => setImageError(true)} 
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-neutral-500 p-4 text-center">
              <ImageOff size={32} />
              <span className="text-[10px] uppercase font-semibold">Vista previa no disponible</span>
            </div>
          )}
        </div>
      </div>

      {/* Columna Derecha: Opciones, Configuración y Descarga */}
      <div className="lg:col-span-7 flex flex-col justify-between gap-6 h-full">
        
        {/* Pestañas superiores (Reel / Audio) */}
        <div className="flex bg-neutral-950 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab("video")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activeTab === "video" 
                ? "bg-[#fe2c55] text-white shadow-lg shadow-[#fe2c55]/30" 
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Video size={16} />
            <span>REEL (MP4)</span>
          </button>
          
          <button
            onClick={() => setActiveTab("audio")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activeTab === "audio" 
                ? "bg-[#fe2c55] text-white shadow-lg shadow-[#fe2c55]/30" 
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Music size={16} />
            <span>AUDIO (MP3)</span>
          </button>
        </div>

        {/* Configuración de extracción limpia y detallada */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#25f4ee] text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Detalles del archivo</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-3 flex flex-col items-center text-center gap-1 shadow-inner">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Formato</span>
              <span className="text-xs sm:text-sm font-black text-[#25f4ee]">
                {activeTab === "video" ? "MP4 HD" : "MP3 Audio"}
              </span>
            </div>

            <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-3 flex flex-col items-center text-center gap-1 shadow-inner">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Calidad</span>
              <span className="text-xs sm:text-sm font-black text-white truncate max-w-full">
                {activeTab === "video" ? "Sin Marca" : "320kbps"}
              </span>
            </div>

            <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-3 flex flex-col items-center text-center gap-1 shadow-inner">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold flex items-center gap-1">
                <Clock size={10} /> Duración
              </span>
              <span className="text-xs sm:text-sm font-black text-amber-400">
                {formatDuration()}
              </span>
            </div>
          </div>

          <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-[#25f4ee]/10 text-[#25f4ee] rounded-xl border border-[#25f4ee]/20">
                <FileText size={18} />
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Archivo estimado</span>
                <span className="text-xs font-bold text-neutral-200 truncate max-w-[200px] sm:max-w-[260px] font-mono">
                  {getEstimatedFileName()}
                </span>
              </div>
            </div>
            <Zap size={16} className="text-[#25f4ee] animate-pulse shrink-0" />
          </div>
        </div>

        {/* Botón de Descarga Directa Principal */}
        <div>
          <button
            onClick={() => handleDirectDownload(currentFileUrl, fileExtension)}
            disabled={downloading}
            className="w-full py-4 bg-gradient-to-r from-[#fe2c55] to-[#ff4770] hover:opacity-90 disabled:opacity-50 text-white font-black text-sm rounded-2xl transition-all shadow-xl shadow-[#fe2c55]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            {downloading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>DESCARGANDO ARCHIVO...</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>{activeTab === "video" ? "DESCARGAR VIDEO MP4" : "DESCARGAR AUDIO MP3"}</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}