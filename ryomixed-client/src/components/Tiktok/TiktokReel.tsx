import React, { useState } from 'react';
import { 
  Download, Video, Loader2, Music, FileVideo, ShieldCheck, 
  FileAudio, Zap
} from 'lucide-react';

import { API_CONFIG } from '../../config/api.config';
import type { TikTokMedia } from '../../types/tiktok';

interface TiktokReelProps {
  data: TikTokMedia;
}

const TiktokReel: React.FC<TiktokReelProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [loadingType, setLoadingType] = useState<'video' | 'audio' | null>(null);

  // Validación: ¿Existe audio disponible?
  const hasAudio = Boolean(data.audioUrl && data.audioUrl.length > 0);

  const formatDuration = (seconds?: number): string => {
    if (!seconds || seconds <= 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = (type: 'video' | 'audio') => {
    const mediaUrl = type === 'video' ? data.urls[0] : data.audioUrl;
    if (!mediaUrl || loadingType) return;
    
    setLoadingType(type);

    const params = new URLSearchParams({
      url: mediaUrl, 
      title: data.sanitizedTitle,
      type: type 
    });

    const downloadUrl = `${API_CONFIG.endpoints.tiktok('/download')}?${params.toString()}`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `${data.sanitizedTitle}.${type === 'video' ? 'mp4' : 'mp3'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setLoadingType(null), 4000);
  };

  const proxiedThumbnail = `${API_CONFIG.BASE_URL}/api/proxy/image?url=${encodeURIComponent(data.thumbnail)}`;

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#0d0d0d]/95 backdrop-blur-2xl border border-white/5 rounded-[2rem] md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in-95 duration-500 my-4">
      
      {/* PANEL IZQUIERDO: Visual */}
      <div className="w-full md:w-[45%] p-6 md:p-12 bg-black/40 flex flex-col border-b md:border-b-0 md:border-r border-white/5 relative overflow-hidden">
        
        <div className={`absolute -top-24 -left-24 w-64 h-64 blur-[120px] rounded-full opacity-20 transition-colors duration-700 ${activeTab === 'video' ? 'bg-cyan-500' : 'bg-pink-600'}`} />

        <div className="relative z-10 mb-6 md:mb-8 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'video' ? 'bg-cyan-500' : 'bg-pink-500'}`} />
            <span className="text-[10px] md:text-xs font-black text-white/40 uppercase tracking-[0.3em]">@{data.author}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white leading-[1.1] italic tracking-tighter line-clamp-2">
            {data.title}
          </h2>
        </div>

        <div className="relative z-10 mt-auto flex justify-center items-center py-4">
          <div className={`absolute inset-0 blur-[45px] opacity-30 scale-90 transition-colors duration-700 ${activeTab === 'video' ? 'bg-cyan-500' : 'bg-pink-600'}`} />
          
          <div className={`relative w-full max-w-[180px] md:max-w-[260px] rounded-[1.5rem] md:rounded-[2.2rem] overflow-hidden border transition-all duration-700 aspect-[9/16] shadow-2xl ${activeTab === 'video' ? 'border-cyan-500/30' : 'border-pink-500/30'}`}>
            <img 
              src={proxiedThumbnail} 
              className={`w-full h-full object-cover transition-all duration-1000 ${activeTab === 'audio' ? 'scale-110 blur-xl opacity-20' : 'opacity-100'}`} 
              alt="TikTok Preview" 
            />
            {activeTab === 'audio' && (
               <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-500">
                  <div className="p-5 md:p-7 bg-black/40 rounded-full border border-pink-500/20 backdrop-blur-2xl">
                    <Music className="w-8 h-8 md:w-12 md:h-12 text-pink-500 animate-pulse" />
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* PANEL DERECHO: Controles */}
      <div className="w-full md:w-[55%] flex flex-col bg-white/[0.01]">
        
        {/* Selector Segmentado: Solo se muestra si hay Audio */}
        <div className="border-b border-white/5 bg-black/40 p-4 md:p-5">
          <div className="relative flex p-1 bg-white/5 rounded-xl md:rounded-2xl border border-white/5">
            {/* Si no hay audio, el botón ocupa el 100% o simplemente no mostramos el selector */}
            {hasAudio ? (
              <>
                <div 
                  className={`absolute inset-y-1 rounded-lg md:rounded-xl transition-all duration-500 ease-out ${
                    activeTab === 'video' 
                    ? 'left-1 w-[calc(50%-0.5rem)] bg-white' 
                    : 'left-[calc(50%+0.5rem)] w-[calc(50%-0.5rem)] bg-pink-600'}`} 
                />
                <button 
                  onClick={() => setActiveTab('video')}
                  className={`relative flex-1 py-3 md:py-4 flex items-center justify-center gap-2 font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] z-10 transition-colors duration-500 ${activeTab === 'video' ? 'text-black' : 'text-white/40'}`}
                >
                  <Video className="w-3.5 h-3.5" /> Reel
                </button>
                <button 
                  onClick={() => setActiveTab('audio')}
                  className={`relative flex-1 py-3 md:py-4 flex items-center justify-center gap-2 font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] z-10 transition-colors duration-500 ${activeTab === 'audio' ? 'text-white' : 'text-white/40'}`}
                >
                  <Music className="w-3.5 h-3.5" /> Audio
                </button>
              </>
            ) : (
              <div className="w-full py-3 md:py-4 flex items-center justify-center gap-3 font-black text-[10px] text-white/60 uppercase tracking-[0.4em]">
                <Video className="w-4 h-4 text-cyan-500" /> Modo Video Activo
              </div>
            )}
          </div>
        </div>

        <div className="p-6 md:p-10 flex-grow flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-white/20 flex items-center gap-2">
              <ShieldCheck className={`w-3.5 h-3.5 ${activeTab === 'video' ? 'text-cyan-500' : 'text-pink-500'}`} /> 
              Configuración de Extracción
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[8px] font-bold text-white/30 uppercase block mb-1">Formato</span>
                  <span className={`text-[10px] md:text-[12px] font-black uppercase ${activeTab === 'video' ? 'text-cyan-400' : 'text-pink-500'}`}>
                    {activeTab === 'video' ? 'MP4 / HD' : 'MP3 / HQ'}
                  </span>
                </div>
                <div className="p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[8px] font-bold text-white/30 uppercase block mb-1">Calidad</span>
                  <span className="text-[10px] md:text-[12px] font-black text-white uppercase italic">
                    {activeTab === 'video' ? 'No WM' : '320 KBPS'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-bold text-white/30 uppercase block mb-1">Duración</span>
                  <span className="text-[10px] md:text-[12px] font-black text-white tracking-widest">
                    {data.duration ? formatDuration(data.duration) : "00:00"}
                  </span>
                </div>
                <Zap className={`w-4 h-4 ${activeTab === 'video' ? 'text-cyan-500' : 'text-pink-500'} animate-pulse`} />
              </div>

              <div className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] bg-gradient-to-br border transition-all duration-700 ${activeTab === 'video' ? 'from-cyan-500/10 to-transparent border-cyan-500/20' : 'from-pink-500/10 to-transparent border-pink-500/20'}`}>
                <div className="flex items-center gap-3 bg-black/60 p-3 md:p-4 rounded-xl border border-white/5">
                  {activeTab === 'video' ? <FileVideo className="w-4 h-4 text-cyan-500 shrink-0" /> : <FileAudio className="w-4 h-4 text-pink-500 shrink-0" />}
                  <span className="text-[9px] md:text-[11px] text-white/80 font-mono truncate">
                    {data.sanitizedTitle}.{activeTab === 'video' ? 'mp4' : 'mp3'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => handleDownload(activeTab)}
            disabled={!!loadingType}
            className={`w-full py-5 md:py-7 rounded-[1.5rem] md:rounded-[2.2rem] font-black text-[10px] md:text-[12px] uppercase tracking-[0.4em] md:tracking-[0.6em] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.97] ${
              loadingType 
              ? 'bg-white/5 text-white/10 border border-white/5' 
              : activeTab === 'video' 
                ? 'bg-white text-black hover:bg-cyan-400' 
                : 'bg-pink-600 text-white hover:bg-pink-500'
            }`}
          >
            {loadingType ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {loadingType ? 'Procesando...' : `Descargar ${activeTab === 'video' ? 'Video' : 'Audio'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TiktokReel;