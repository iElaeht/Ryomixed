import React, { useState } from 'react';
import { 
  Download, 
  Video, 
  Loader2, 
  Check,
  Clock,
  FileVideo,
  ShieldCheck
} from 'lucide-react';

// Configuración y Tipado
import { API_CONFIG } from '../../config/api.config';
import type { InstagramData } from '../../types/instagram';

interface InstagramReelProps {
  data: InstagramData;
}

/**
 * COMPONENTE: InstagramReel (@RyoMixed)
 * Renderiza la vista previa y gestión de descarga para Reels individuales.
 */
const InstagramReel: React.FC<InstagramReelProps> = ({ data }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  /**
   * Formatea los segundos a formato MM:SS
   */
  const formatDuration = (seconds?: number): string => {
    if (!seconds || seconds <= 0) return "00:00";
    const totalSeconds = Math.floor(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Orquestador de descarga: Llama al endpoint de descarga del backend
   */
  const handleDownload = () => {
    const directMediaUrl = data.media[0]?.url;
    if (!directMediaUrl || isDownloading) return;
    
    setIsDownloading(true);

    const params = new URLSearchParams({
      url: directMediaUrl, 
      title: data.sanitizedTitle,
      type: 'video'
    });

    // Ejecutamos la descarga apuntando al helper de Instagram en API_CONFIG
    const downloadUrl = `${API_CONFIG.endpoints.instagram('/download')}?${params.toString()}`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `${data.sanitizedTitle}.mp4`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Feedback visual temporal
    setTimeout(() => setIsDownloading(false), 4000);
  };

  /**
   * PROXY DE IMÁGENES:
   * Evita el error 403 Forbidden pasando la miniatura por nuestro servidor.
   */
  const proxiedThumbnail = `${API_CONFIG.BASE_URL}/api/proxy/image?url=${encodeURIComponent(data.thumbnail)}`;

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#0d0d0d]/95 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      
      {/* SECCIÓN: HEADER (Identidad Visual) */}
      <div className="p-8 border-b border-white/5 flex flex-col items-center justify-center text-center gap-4 bg-gradient-to-b from-purple-500/10 to-transparent">
        <div className="p-4 bg-gradient-to-tr from-yellow-400 via-pink-600 to-purple-600 rounded-2xl shadow-xl relative mb-2">
           <Video className="text-white w-6 h-6" />
           <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[#0d0d0d] flex items-center justify-center">
             <Check className="w-2.5 h-2.5 text-white stroke-[4px]" />
           </div>
        </div>
        
        <div className="max-w-2xl">
          <h2 className="text-2xl font-black text-white tracking-tight line-clamp-2 mb-1">{data.title}</h2>
          <p className="text-xs text-pink-500 font-black uppercase tracking-[0.3em]">REEL POR @{data.author}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* PANEL IZQUIERDO: Visualización (Proxy Activo) */}
        <div className="md:w-1/2 p-8 bg-black/40 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
          <div className="relative group max-w-[240px] w-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 aspect-[9/16] transform transition-transform duration-500 hover:scale-[1.02]">
            <img 
              src={proxiedThumbnail} 
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
              alt="RyoMixed IG Preview" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
        </div>

        {/* PANEL DERECHO: Metadata y Acciones */}
        <div className="md:w-1/2 p-8 flex flex-col justify-between bg-white/[0.01]">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-purple-500" /> Detalles del Archivo
              </h3>
              <span className="text-[9px] font-black text-purple-500/50 italic">@RyoMixedIG</span>
            </div>
            
            {/* Grid de Especificaciones */}
            <div className="grid grid-cols-1 gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
                  <span className="text-[9px] font-bold text-white/40 uppercase block mb-1 tracking-wider">Formato</span>
                  <span className="text-[11px] font-black text-pink-500 uppercase">MP4 VIDEO</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
                  <span className="text-[9px] font-bold text-white/40 uppercase block mb-1 tracking-wider">Calidad</span>
                  <span className="text-[11px] font-black text-white uppercase">Original HQ</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group transition-all">
                <div>
                  <span className="text-[9px] font-bold text-white/40 uppercase block mb-1 tracking-wider">Duración</span>
                  <span className="text-[11px] font-black text-white uppercase">{formatDuration(data.duration)}</span>
                </div>
                <Clock className="w-4 h-4 text-white/20 group-hover:text-pink-500 transition-colors" />
              </div>

              {/* Input decorativo del nombre de salida */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                <span className="text-[9px] font-black text-purple-400 uppercase block mb-3 tracking-widest text-center">Nombre de Salida</span>
                <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                  <FileVideo className="w-4 h-4 text-purple-500 shrink-0" />
                  <span className="text-[10px] text-white/80 break-all font-mono leading-relaxed truncate">
                    {data.sanitizedTitle}.mp4
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BOTÓN DE ACCIÓN PRINCIPAL */}
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className={`mt-8 w-full py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-3 ${
              isDownloading 
              ? 'bg-white/5 text-white/20 cursor-not-allowed' 
              : 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:shadow-[0_0_30px_-5px_rgba(219,39,119,0.4)] text-white active:scale-[0.98]'
            }`}
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isDownloading ? 'Procesando...' : 'Descargar Reel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstagramReel;