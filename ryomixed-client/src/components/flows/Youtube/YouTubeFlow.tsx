import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Clock, 
  Loader2, 
  CheckCircle2, 
  Music,
  // Iconos significativos que siempre existen en Lucide:
  PlaySquare, // Para YouTube (representa un reproductor de video)
  PlayCircle  // Para el autor/canal
} from 'lucide-react';

import { API_CONFIG } from '../../../config/api.config';

interface Format {
  id: string;
  label: string;
  ext: string;
  filesize?: string | null;
}

interface YouTubeData {
  title: string;
  sanitizedTitle: string;
  author: string;
  thumbnail: string;
  duration: number;
  formats: Format[];
}

interface YouTubeFlowProps {
  data: YouTubeData;
  originalUrl: string;
}

const YouTubeFlow: React.FC<YouTubeFlowProps> = ({ data, originalUrl }) => {
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [selectedFormat, setSelectedFormat] = useState<string>(data.formats[0]?.id || '');
  const [isDownloading, setIsDownloading] = useState(false);
  
  const videoBtnRef = useRef<HTMLButtonElement>(null);
  const audioBtnRef = useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeBtn = activeTab === 'video' ? videoBtnRef.current : audioBtnRef.current;
    if (activeBtn) {
      setIndicatorStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth
      });
    }
  }, [activeTab]);

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    if (!originalUrl || isDownloading) return;
    try {
      setIsDownloading(true);
      const response = await fetch(API_CONFIG.endpoints.youtube('/download'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: originalUrl.trim(),
          formatId: activeTab === 'audio' ? 'mp3' : selectedFormat,
          title: data.sanitizedTitle,
          type: activeTab
        })
      });
      if (!response.ok) throw new Error('Error');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${data.sanitizedTitle}.${activeTab === 'audio' ? 'mp3' : 'mp4'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  const proxiedThumbnail = `${API_CONFIG.BASE_URL}/api/proxy/image?url=${encodeURIComponent(data.thumbnail)}`;

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#0d0d0d]/95 backdrop-blur-2xl border border-white/5 rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl my-4">
      
      {/* PANEL IZQUIERDO */}
      <div className="w-full md:w-1/2 p-5 md:p-8 flex flex-col gap-5 bg-gradient-to-b from-red-600/5 to-transparent border-b md:border-b-0 md:border-r border-white/5">
        <div className="relative group">
          <img 
            src={proxiedThumbnail} 
            className="w-full aspect-video object-cover rounded-2xl shadow-2xl border border-white/5" 
            alt="Preview" 
          />
          
          {/* USANDO PLAY-SQUARE COMO ICONO SIGNIFICATIVO DE YOUTUBE */}
          <div className="absolute top-3 right-3 bg-red-600 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
            <PlaySquare className="w-3.5 h-3.5 text-white fill-current" />
            <span className="text-[10px] font-black uppercase tracking-tighter text-white">YouTube</span>
          </div>

          <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[11px] font-mono font-bold text-white">{formatDuration(data.duration)}</span>
          </div>
        </div>

        <div className="px-2 text-left">
          <h2 className="text-lg font-bold text-white/95 line-clamp-2 leading-tight">{data.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <PlayCircle className="w-3.5 h-3.5 text-red-600" />
            <p className="text-[11px] text-white/40 font-black uppercase tracking-widest">{data.author}</p>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO */}
      <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-black/20">
        <div>
          <div className="relative flex gap-8 mb-8 border-b border-white/5 pb-3">
            <button 
              ref={videoBtnRef}
              onClick={() => setActiveTab('video')}
              className={`text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'video' ? 'text-white' : 'text-white/20'}`}
            >
              Vídeo
            </button>
            <button 
              ref={audioBtnRef}
              onClick={() => setActiveTab('audio')}
              className={`text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'audio' ? 'text-white' : 'text-white/20'}`}
            >
              Audio MP3
            </button>
            <div 
              className="absolute bottom-[-1px] h-[2px] bg-red-600 transition-all duration-300 shadow-[0_0_15px_#ff0000]"
              style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
            />
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
            {activeTab === 'video' ? (
              data.formats.map((f) => (
                <div 
                  key={f.id}
                  onClick={() => setSelectedFormat(f.id)}
                  className={`flex items-center justify-between py-3.5 px-4 rounded-xl cursor-pointer transition-all border ${
                    selectedFormat === f.id 
                    ? 'bg-red-600/10 border-red-600/40' 
                    : 'hover:bg-white/[0.04] border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${selectedFormat === f.id ? 'bg-red-600 shadow-[0_0_8px_#ff0000]' : 'bg-white/10'}`} />
                    <div className="flex flex-col">
                      <span className={`text-[12px] font-black ${selectedFormat === f.id ? 'text-white' : 'text-white/40'}`}>
                        {f.label}
                      </span>
                      <span className="text-[9px] font-mono text-white/20 uppercase">
                        {f.ext} • {f.filesize || 'Auto'}
                      </span>
                    </div>
                  </div>
                  {selectedFormat === f.id && <CheckCircle2 className="w-4 h-4 text-red-600" />}
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center">
                <Music className="w-10 h-10 text-red-600 mb-4 opacity-80" />
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Master Audio</p>
                <p className="text-[9px] text-red-500/50 font-bold uppercase mt-1">320kbps High Fidelity</p>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className={`mt-8 w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 active:scale-95 transition-all ${
            isDownloading 
            ? 'bg-white/5 text-white/10' 
            : 'bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-900/20'
          }`}
        >
          {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isDownloading ? 'PROCESANDO...' : 'DESCARGAR AHORA'}
        </button>
      </div>
    </div>
  );
};

export default YouTubeFlow;