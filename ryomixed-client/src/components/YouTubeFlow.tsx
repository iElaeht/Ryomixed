import React, { useState, useRef, useEffect } from 'react';
// Cambiamos 'Youtube' por 'Video' para evitar el error de exportación
import { 
  Download, 
  Clock, 
  Video, 
  Loader2, 
  CheckCircle2, 
  Music 
} from 'lucide-react';

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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    if (!originalUrl || isDownloading) return;

    try {
      setIsDownloading(true);
      
      // LÓGICA DINÁMICA DE URL: 
      // Detecta si estás en localhost para usar el puerto 4000, 
      // de lo contrario usa tu URL de Railway.
      const isLocal = window.location.hostname === 'localhost';
      const apiUrl = isLocal 
        ? 'http://localhost:4000' 
        : 'https://ryomixed-production.up.railway.app';

      const response = await fetch(`${apiUrl}/api/youtube/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: originalUrl.trim(),
          formatId: activeTab === 'audio' ? 'mp3' : selectedFormat,
          title: data.sanitizedTitle,
          type: activeTab
        })
      });

      if (!response.ok) throw new Error('Error en la descarga');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${data.sanitizedTitle}.${activeTab === 'audio' ? 'mp3' : 'mp4'}`);
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      console.error("Error de descarga:", error);
      alert("No se pudo procesar la descarga.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-[#0d0d0d]/90 backdrop-blur-2xl border border-white/5 rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in duration-500">
      
      {/* LADO IZQUIERDO: Miniatura e Info */}
      <div className="w-full md:w-1/2 p-6 flex flex-col gap-5 bg-gradient-to-b from-white/[0.02] to-transparent border-b md:border-b-0 md:border-r border-white/5">
        <div className="relative group">
          <img src={data.thumbnail} className="w-full aspect-video object-cover rounded-2xl shadow-2xl" alt="" />
          
          <div className="absolute top-3 right-3 bg-red-600 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-lg">
            <Video className="w-3 h-3 text-white fill-current" />
            <span className="text-[10px] font-black uppercase tracking-tighter text-white">LIVE</span>
          </div>

          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-mono font-bold text-blue-400">{formatDuration(data.duration)}</span>
          </div>
        </div>

        <div className="px-2 text-left">
          <h2 className="text-lg font-bold text-white/90 line-clamp-1 mb-1">{data.title}</h2>
          <p className="text-xs text-blue-400/80 font-semibold uppercase tracking-wider">{data.author}</p>
        </div>
      </div>

      {/* LADO DERECHO: Selector y Descarga */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-between bg-black/40">
        <div>
          <div className="relative flex gap-8 mb-8 border-b border-white/5 pb-3">
            <button 
              ref={videoBtnRef}
              onClick={() => setActiveTab('video')}
              className={`text-sm font-bold transition-all ${activeTab === 'video' ? 'text-white' : 'text-gray-500'}`}
            >
              Vídeo
            </button>
            <button 
              ref={audioBtnRef}
              onClick={() => setActiveTab('audio')}
              className={`text-sm font-bold transition-all ${activeTab === 'audio' ? 'text-white' : 'text-gray-500'}`}
            >
              Audio MP3
            </button>
            <div 
              className="absolute bottom-[-1px] h-[2px] bg-blue-500 transition-all duration-300 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
            />
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[180px] pr-2 custom-scrollbar">
            {activeTab === 'video' ? (
              data.formats.map((f) => (
                <div 
                  key={f.id}
                  onClick={() => setSelectedFormat(f.id)}
                  className={`group flex items-center justify-between py-3 px-3 rounded-xl cursor-pointer transition-all ${selectedFormat === f.id ? 'bg-blue-500/10' : 'hover:bg-white/[0.02]'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${selectedFormat === f.id ? 'bg-blue-500' : 'bg-white/10'}`} />
                    <span className={`text-sm font-medium ${selectedFormat === f.id ? 'text-white' : 'text-gray-500'}`}>
                      {f.label} <span className="mx-2 text-white/5">•</span> 
                      <span className="text-[10px] opacity-50">{f.filesize || 'Auto'}</span>
                    </span>
                  </div>
                  {selectedFormat === f.id && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                </div>
              ))
            ) : (
              <div className="py-10 flex flex-col items-center justify-center opacity-60">
                <Music className="w-8 h-8 text-blue-500 mb-2" />
                <p className="text-sm font-bold text-white">Alta Fidelidad 320kbps</p>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className={`mt-8 w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${isDownloading ? 'bg-white/5 text-gray-500' : 'bg-blue-600 text-white shadow-xl shadow-blue-900/10'}`}
        >
          {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isDownloading ? 'Sincronizando...' : 'Descargar ahora'}
        </button>
      </div>
    </div>
  );
};

export default YouTubeFlow;