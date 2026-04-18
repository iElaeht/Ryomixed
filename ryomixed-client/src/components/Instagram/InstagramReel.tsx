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

import { API_CONFIG } from '../../config/api.config';
import type { InstagramData } from '../../types/instagram';

interface InstagramReelProps {
  data: InstagramData;
}

const InstagramReel: React.FC<InstagramReelProps> = ({ data }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const formatDuration = (seconds?: number): string => {
    if (!seconds || seconds <= 0) return "00:00";
    const totalSeconds = Math.floor(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    const directMediaUrl = data.media[0]?.url;
    if (!directMediaUrl || isDownloading) return;
    
    setIsDownloading(true);

    const params = new URLSearchParams({
      url: directMediaUrl, 
      title: data.sanitizedTitle,
      type: 'video'
    });

    const downloadUrl = `${API_CONFIG.endpoints.instagram('/download')}?${params.toString()}`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `${data.sanitizedTitle}.mp4`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setIsDownloading(false), 4000);
  };

  const proxiedThumbnail = `${API_CONFIG.BASE_URL}/api/proxy/image?url=${encodeURIComponent(data.thumbnail)}`;

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#0d0d0d]/95 backdrop-blur-2xl border border-white/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-500 my-4">
      
      {/* HEADER: Adaptado para móvil */}
      <div className="p-6 md:p-8 border-b border-white/5 flex flex-col items-center justify-center text-center gap-3 md:gap-4 bg-gradient-to-b from-purple-500/10 to-transparent">
        <div className="p-3 md:p-4 bg-gradient-to-tr from-yellow-400 via-pink-600 to-purple-600 rounded-xl md:rounded-2xl shadow-xl relative">
           <Video className="text-white w-5 h-5 md:w-6 md:h-6" />
           <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full border-[3px] md:border-4 border-[#0d0d0d] flex items-center justify-center">
             <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-white stroke-[4px]" />
           </div>
        </div>
        
        <div className="max-w-2xl px-2">
          <h2 className="text-lg md:text-2xl font-black text-white tracking-tight line-clamp-1 md:line-clamp-2 mb-1">
            {data.title || 'Instagram Reel'}
          </h2>
          <p className="text-[9px] md:text-xs text-pink-500 font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">
            BY @{data.author}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* PREVIEW: Ajustado para no colapsar en móvil */}
        <div className="w-full md:w-1/2 p-6 md:p-10 bg-black/30 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
          <div className="relative group max-w-[180px] md:max-w-[240px] w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 aspect-[9/16]">
            <img 
              src={proxiedThumbnail} 
              className="w-full h-full object-cover opacity-90 transition-all duration-700 group-hover:scale-110" 
              alt="Preview" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Play Icon Overlay (Minimalista) */}
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Video className="w-6 h-6 text-white fill-current" />
               </div>
            </div>
          </div>
        </div>

        {/* INFO Y ACCIONES */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-white/[0.01]">
          <div className="space-y-5 md:space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-500" /> Archivo Seguro
              </h3>
              <span className="text-[9px] font-black text-purple-500/50 italic tracking-widest">RyoMixed</span>
            </div>
            
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[8px] md:text-[9px] font-bold text-white/30 uppercase block mb-1">Formato</span>
                  <span className="text-[10px] md:text-[11px] font-black text-pink-500 uppercase">MP4</span>
                </div>
                <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[8px] md:text-[9px] font-bold text-white/30 uppercase block mb-1">Calidad</span>
                  <span className="text-[10px] md:text-[11px] font-black text-white uppercase">Original</span>
                </div>
              </div>

              <div className="p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[8px] md:text-[9px] font-bold text-white/30 uppercase block mb-1">Duración</span>
                  <span className="text-[10px] md:text-[11px] font-black text-white uppercase">{formatDuration(data.duration)}</span>
                </div>
                <Clock className="w-4 h-4 text-pink-500/40" />
              </div>

              <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                <div className="flex items-center gap-3 bg-black/50 p-3 rounded-xl border border-white/5">
                  <FileVideo className="w-4 h-4 text-purple-500 shrink-0" />
                  <span className="text-[10px] text-white/70 font-mono truncate">
                    {data.sanitizedTitle}.mp4
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className={`mt-6 md:mt-8 w-full py-5 md:py-6 rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.4em] md:tracking-[0.5em] transition-all flex items-center justify-center gap-3 active:scale-95 ${
              isDownloading 
              ? 'bg-white/5 text-white/10 cursor-not-allowed' 
              : 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/20'
            }`}
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isDownloading ? 'Preparando...' : 'Descargar Ahora'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstagramReel;