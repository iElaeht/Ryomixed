import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Clock, 
  Video, 
  Loader2, 
  CheckCircle2, 
  Music 
} from 'lucide-react';

// Centralización de Configuración y Tipos
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

/**
 * COMPONENTE: YouTubeFlow (@RyoMixed)
 * Gestiona la selección de formatos y la descarga de contenido de YouTube (Video/Audio).
 */
const YouTubeFlow: React.FC<YouTubeFlowProps> = ({ data, originalUrl }) => {
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [selectedFormat, setSelectedFormat] = useState<string>(data.formats[0]?.id || '');
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Referencias para la animación del indicador de pestañas
  const videoBtnRef = useRef<HTMLButtonElement>(null);
  const audioBtnRef = useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  /**
   * Efecto visual: Mueve la línea azul bajo la pestaña activa
   */
  useEffect(() => {
    const activeBtn = activeTab === 'video' ? videoBtnRef.current : audioBtnRef.current;
    if (activeBtn) {
      setIndicatorStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth
      });
    }
  }, [activeTab]);

  /**
   * Formateador de tiempo (H:MM:SS o MM:SS)
   */
  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  /**
   * ORQUESTADOR DE DESCARGA:
   * Se comunica con el backend para procesar el buffer del video o audio.
   */
  const handleDownload = async () => {
    if (!originalUrl || isDownloading) return;

    try {
      setIsDownloading(true);
      
      const downloadEndpoint = API_CONFIG.endpoints.youtube('/download');

      const response = await fetch(downloadEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: originalUrl.trim(),
          formatId: activeTab === 'audio' ? 'mp3' : selectedFormat,
          title: data.sanitizedTitle,
          type: activeTab
        })
      });

      if (!response.ok) throw new Error('Fallo en la respuesta del servidor');

      // Procesamiento del Stream de datos
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${data.sanitizedTitle}.${activeTab === 'audio' ? 'mp3' : 'mp4'}`);
      document.body.appendChild(link);
      link.click();
      
      // Limpieza de memoria
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      console.error("❌ [YouTube Download Error]:", error);
      alert("Hubo un problema al procesar el video. Intenta de nuevo.");
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Aplicamos el Proxy de imágenes para asegurar que la miniatura cargue siempre
   */
  const proxiedThumbnail = `${API_CONFIG.BASE_URL}/api/proxy/image?url=${encodeURIComponent(data.thumbnail)}`;

  return (
    <div className="w-full max-w-4xl bg-[#0d0d0d]/90 backdrop-blur-2xl border border-white/5 rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in duration-500">
      
      {/* PANEL IZQUIERDO: Visualización y Metadata */}
      <div className="w-full md:w-1/2 p-6 flex flex-col gap-5 bg-gradient-to-b from-white/[0.02] to-transparent border-b md:border-b-0 md:border-r border-white/5">
        <div className="relative group">
          <img 
            src={proxiedThumbnail} 
            className="w-full aspect-video object-cover rounded-2xl shadow-2xl border border-white/5" 
            alt="YouTube Thumbnail" 
          />
          
          <div className="absolute top-3 right-3 bg-red-600 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-lg">
            <Video className="w-3 h-3 text-white fill-current" />
            <span className="text-[10px] font-black uppercase tracking-tighter text-white">4K READY</span>
          </div>

          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-mono font-bold text-blue-400">{formatDuration(data.duration)}</span>
          </div>
        </div>

        <div className="px-2 text-left">
          <h2 className="text-lg font-bold text-white/90 line-clamp-2 mb-1 leading-snug">{data.title}</h2>
          <p className="text-xs text-blue-400/80 font-black uppercase tracking-widest">{data.author}</p>
        </div>
      </div>

      {/* PANEL DERECHO: Configuración de Salida */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-between bg-black/40">
        <div>
          {/* TABS DE SELECCIÓN */}
          <div className="relative flex gap-8 mb-8 border-b border-white/5 pb-3">
            <button 
              ref={videoBtnRef}
              onClick={() => setActiveTab('video')}
              className={`text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'video' ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
            >
              Vídeo
            </button>
            <button 
              ref={audioBtnRef}
              onClick={() => setActiveTab('audio')}
              className={`text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'audio' ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
            >
              Audio MP3
            </button>
            <div 
              className="absolute bottom-[-1px] h-[2px] bg-blue-500 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
              style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
            />
          </div>

          {/* LISTA DE FORMATOS DINÁMICA */}
          <div className="space-y-1 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar">
            {activeTab === 'video' ? (
              data.formats.map((f) => (
                <div 
                  key={f.id}
                  onClick={() => setSelectedFormat(f.id)}
                  className={`group flex items-center justify-between py-3 px-4 rounded-xl cursor-pointer transition-all border ${selectedFormat === f.id ? 'bg-blue-500/10 border-blue-500/30' : 'hover:bg-white/[0.03] border-transparent'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${selectedFormat === f.id ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-white/10'}`} />
                    <span className={`text-sm font-bold ${selectedFormat === f.id ? 'text-white' : 'text-gray-500'}`}>
                      {f.label} <span className="mx-2 text-white/5">•</span> 
                      <span className="text-[10px] font-mono opacity-40">{f.filesize || 'N/A'}</span>
                    </span>
                  </div>
                  {selectedFormat === f.id && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center animate-in zoom-in-95">
                <Music className="w-10 h-10 text-blue-500 mb-3 opacity-80" />
                <p className="text-xs font-black text-white/80 uppercase tracking-widest">Master Audio</p>
                <p className="text-[10px] text-blue-400/50 font-bold uppercase mt-1">320kbps High Fidelity</p>
              </div>
            )}
          </div>
        </div>

        {/* BOTÓN DE ACCIÓN */}
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className={`mt-8 w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all ${
            isDownloading 
            ? 'bg-white/5 text-white/20 cursor-wait' 
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-500/20 active:scale-[0.98]'
          }`}
        >
          {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isDownloading ? 'Procesando...' : 'Descargar Ahora'}
        </button>
      </div>
    </div>
  );
};

export default YouTubeFlow;