// components/results/tiktok/TikTokGalleryResult.tsx
"use client";

import { useState } from "react";
import { Images, Music, Download, CheckSquare, Square, Loader2, Layers, Check, Sliders, FileText } from "lucide-react";
import { TikTokContentData } from "./TiktokResult";

interface TikTokGalleryResultProps {
  data: TikTokContentData;
}

export default function TikTokGalleryResult({ data }: TikTokGalleryResultProps) {
  const imagesList = data.images || [];
  const [activeTab, setActiveTab] = useState<"gallery" | "audio">("gallery");
  // Por defecto se inicia con un array vacío para que todas las imágenes comiencen deseleccionadas
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null);

  const toggleSelectImage = (index: number) => {
    if (selectedImages.includes(index)) {
      setSelectedImages(selectedImages.filter((i) => i !== index));
    } else {
      setSelectedImages([...selectedImages, index]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedImages.length === imagesList.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(imagesList.map((_, index) => index));
    }
  };

  const getCleanFileName = (index: number) => {
    const cleanAuthor = data.author ? data.author.replace(/[^a-zA-Z0-9]/g, "_") : "Unknown";
    
    if (data.title && data.title.trim() !== "") {
      const sanitized = data.title.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").slice(0, 25);
      const cleanTitle = sanitized.endsWith("_") ? sanitized.slice(0, -1) : sanitized;
      return `${cleanTitle}_${index + 1}`;
    }
    
    return `Ryomixed_Gallery_${cleanAuthor}_${index + 1}`;
  };

  const getAudioFileName = () => {
    const cleanAuthor = data.author ? data.author.replace(/[^a-zA-Z0-9]/g, "_") : "Unknown";
    
    if (data.title && data.title.trim() !== "") {
      const sanitized = data.title.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").slice(0, 30);
      return sanitized.endsWith("_") ? sanitized.slice(0, -1) : sanitized;
    }
    
    return `Ryomixed_audio_${cleanAuthor}`;
  };

  // Función de descarga blindada contra bloqueos CORS de imágenes externas
  const handleDirectDownload = async (fileUrl: string, fileExtension: string, customFileName: string) => {
    if (!fileUrl) return;
    try {
      const response = await fetch(fileUrl, { mode: "cors" });
      if (!response.ok) throw new Error("CORS or Network error");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${customFileName}.${fileExtension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Plan B: Si el navegador bloquea el blob por seguridad, se abre directo en pestaña de forma segura
      const fallbackLink = document.createElement("a");
      fallbackLink.href = fileUrl;
      fallbackLink.target = "_blank";
      fallbackLink.rel = "noopener noreferrer";
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      document.body.removeChild(fallbackLink);
    }
  };

  const handleSmartDownload = async () => {
    if (selectedImages.length === 0) return;
    setDownloading(true);

    try {
      if (selectedImages.length === 1) {
        const index = selectedImages[0];
        const fileName = getCleanFileName(index);
        await handleDirectDownload(imagesList[index], "jpg", fileName);
      } else {
        setDownloadProgress({ current: 0, total: selectedImages.length });
        for (let i = 0; i < selectedImages.length; i++) {
          const index = selectedImages[i];
          const fileName = getCleanFileName(index);
          setDownloadProgress({ current: i + 1, total: selectedImages.length });
          await handleDirectDownload(imagesList[index], "jpg", fileName);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    } finally {
      setDownloading(false);
      setDownloadProgress(null);
    }
  };

  const handleAudioDownload = () => {
    if (!data.musicUrl) return;
    const audioFileName = getAudioFileName();
    handleDirectDownload(data.musicUrl, "mp3", audioFileName);
  };

  return (
    <div className="w-full bg-[#0b0f17] border border-white/10 rounded-3xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-10 shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* CABECERA PRINCIPAL TIKTOK */}
      <div className="flex flex-col items-center justify-center text-center pb-5 border-b border-white/10 gap-2.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#fe2c55] to-[#25f4ee] p-[1px] shadow-lg shadow-[#fe2c55]/20">
          <div className="w-full h-full bg-[#0b0f17] rounded-2xl flex items-center justify-center text-[#25f4ee]">
            <Layers size={22} />
          </div>
        </div>
        
        <div className="space-y-0.5">
          <h2 className="text-lg md:text-2xl font-black tracking-wider text-white uppercase">
            TIKTOK GALLERY
          </h2>
          <p className="text-xs font-bold text-[#fe2c55] tracking-widest">
            @{data.author || "Usuario"}
          </p>
        </div>
      </div>

      {/* DISTRIBUCIÓN DE DOS COLUMNAS RESPONSIVA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: Grid de Fotos */}
        <div className="lg:col-span-7 bg-[#070a10] border border-white/10 rounded-2xl md:rounded-3xl p-3.5 sm:p-5 flex flex-col gap-4">
          
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black tracking-wider text-neutral-400 uppercase flex items-center gap-2">
              <Images size={14} className="text-[#25f4ee]" />
              CARRUSEL ({imagesList.length})
            </span>
            
            <button
              onClick={toggleSelectAll}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-xs font-bold text-neutral-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm group"
            >
              {selectedImages.length === imagesList.length && imagesList.length > 0 ? (
                <CheckSquare size={15} className="text-[#25f4ee]" />
              ) : (
                <Square size={15} className="text-neutral-500 group-hover:text-[#25f4ee] transition-colors" />
              )}
              <span>{selectedImages.length === imagesList.length && imagesList.length > 0 ? "Deseleccionar" : "Seleccionar todas"}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[420px] lg:max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
            {imagesList.map((imgUrl, index) => {
              const isSelected = selectedImages.includes(index);
              return (
                <div
                  key={index}
                  onClick={() => toggleSelectImage(index)}
                  className={`group relative aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden bg-neutral-950 border-2 transition-all cursor-pointer shadow-lg ${
                    isSelected 
                      ? "border-[#fe2c55] ring-2 ring-[#fe2c55]/20 scale-[1.01]" 
                      : "border-white/10 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={imgUrl} alt={`Slide ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  
                  <div className="absolute top-2 left-2 bg-neutral-950/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-[10px] font-black text-white shadow">
                    #{index + 1}
                  </div>

                  <div className="absolute top-2 right-2 bg-neutral-950/80 backdrop-blur-md p-1 rounded-md border border-white/10">
                    {isSelected ? (
                      <CheckSquare size={14} className="text-[#fe2c55]" />
                    ) : (
                      <Square size={14} className="text-neutral-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* COLUMNA DERECHA: Control Hub */}
        <div className="lg:col-span-5 bg-[#070a10] border border-white/10 rounded-2xl md:rounded-3xl p-4 sm:p-5 flex flex-col gap-4 shadow-2xl">
          
          <div className="flex items-center gap-2 text-xs font-black tracking-widest text-neutral-400 uppercase border-b border-white/10 pb-3">
            <Sliders size={15} className="text-[#fe2c55]" />
            <span>Control Hub</span>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab("gallery")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                activeTab === "gallery" 
                  ? "bg-[#fe2c55] text-white shadow-lg shadow-[#fe2c55]/30" 
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Images size={14} />
              <span>GALERÍA</span>
            </button>
            
            {data.musicUrl && (
              <button
                onClick={() => setActiveTab("audio")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  activeTab === "audio" 
                    ? "bg-[#fe2c55] text-white shadow-lg shadow-[#fe2c55]/30" 
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Music size={14} />
                <span>AUDIO</span>
              </button>
            )}
          </div>

          {activeTab === "gallery" ? (
            <div className="flex flex-col gap-3.5">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-3 text-center flex flex-col justify-center gap-0.5 shadow-inner">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Fotos</span>
                  <span className="text-sm md:text-base font-black text-white">{imagesList.length}</span>
                </div>
                <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-3 text-center flex flex-col justify-center gap-0.5 shadow-inner">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Calidad</span>
                  <span className="text-sm md:text-base font-black text-[#25f4ee]">HD</span>
                </div>
              </div>

              <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between shadow-inner">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Selección</span>
                  <span className="text-xs font-black text-white mt-0.5">
                    {selectedImages.length} seleccionadas
                  </span>
                </div>
                <div className="w-6 h-6 rounded-full bg-[#fe2c55]/10 border border-[#fe2c55]/30 flex items-center justify-center text-[#fe2c55]">
                  <Check size={13} />
                </div>
              </div>

              {/* TÍTULO DEL ARCHIVO DINÁMICO */}
              <div className="bg-neutral-950/90 border border-white/10 rounded-2xl p-3 flex flex-col gap-1 shadow-inner">
                <span className="text-[10px] uppercase font-extrabold text-[#25f4ee] flex items-center gap-1.5 tracking-wider">
                  <FileText size={12} />
                  Título del archivo
                </span>
                <span className="text-xs text-neutral-200 truncate font-mono bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/5">
                  {data.title && data.title.trim() !== "" 
                    ? `${data.title.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").slice(0, 25)}_X` 
                    : `Ryomixed_Gallery_${data.author ? data.author.replace(/[^a-zA-Z0-9]/g, "_") : "Unknown"}_X`}
                </span>
              </div>

            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              
              <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300">Pista Musical</span>
                  <span className="text-[10px] font-black text-[#25f4ee] bg-[#25f4ee]/10 px-2 py-0.5 rounded-lg border border-[#25f4ee]/20">MP3 HD</span>
                </div>

                {/* TÍTULO DEL AUDIO DINÁMICO */}
                <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase font-extrabold text-[#25f4ee] tracking-wider flex items-center gap-1">
                    <FileText size={11} />
                    Título del archivo de audio
                  </span>
                  <span className="text-xs text-neutral-200 truncate font-mono">
                    {getAudioFileName()}.mp3
                  </span>
                </div>

              </div>

            </div>
          )}

          <div className="pt-1">
            {activeTab === "gallery" ? (
              <button
                onClick={handleSmartDownload}
                disabled={downloading || selectedImages.length === 0}
                className="w-full py-3.5 md:py-4 bg-gradient-to-r from-[#fe2c55] to-[#ff4770] hover:opacity-90 disabled:opacity-50 text-white font-black text-xs md:text-sm rounded-2xl transition-all shadow-xl shadow-[#fe2c55]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {downloading ? (
                  <>
                    <Loader2 className="animate-spin" size={17} />
                    <span>
                      {downloadProgress 
                        ? `BAJANDO ${downloadProgress.current}/${downloadProgress.total}...` 
                        : "PROCESANDO..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Download size={17} />
                    <span>
                      {selectedImages.length === 0 
                        ? "SELECCIONA AL MENOS UNA FOTO" 
                        : selectedImages.length === 1 
                          ? "BAJAR FOTO SELECCIONADA" 
                          : `BAJAR FOTOS (${selectedImages.length})`}
                    </span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleAudioDownload}
                className="w-full py-3.5 md:py-4 bg-gradient-to-r from-[#25f4ee] to-[#12b8b3] hover:opacity-90 text-neutral-950 font-black text-xs md:text-sm rounded-2xl transition-all shadow-xl shadow-[#25f4ee]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <Download size={17} />
                <span>DESCARGAR AUDIO MP3</span>
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}