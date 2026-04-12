import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Video, 
  Loader2, 
  CheckCircle2, 
  Music,
  ImageIcon,
  Layers,
  Check
} from 'lucide-react';

interface TikTokData {
  type: 'video' | 'photos';
  title: string;
  sanitizedTitle: string;
  author: string;
  thumbnail: string;
  urls: string[];
  audioUrl?: string;
}

interface TikTokFlowProps {
  data: TikTokData;
  originalUrl: string;
}

const TikTokFlow: React.FC<TikTokFlowProps> = ({ data, originalUrl }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'audio'>('content');
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  
  const contentBtnRef = useRef<HTMLButtonElement>(null);
  const audioBtnRef = useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Seleccionar todas las fotos por defecto si es un álbum
  useEffect(() => {
    if (data.type === 'photos') {
      setSelectedImages(data.urls.map((_, i) => i));
    }
  }, [data]);

  useEffect(() => {
    const activeBtn = activeTab === 'content' ? contentBtnRef.current : audioBtnRef.current;
    if (activeBtn) {
      setIndicatorStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth
      });
    }
  }, [activeTab]);

  const toggleImage = (index: number) => {
    setSelectedImages(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleDownload = async () => {
    if (!originalUrl || isDownloading) return;
    setIsDownloading(true);

    try {
      if (activeTab === 'audio' || data.type === 'video') {
        const resourceUrl = activeTab === 'audio' ? data.audioUrl : data.urls[0];
        if (!resourceUrl) throw new Error("No se encontró la URL del recurso");
        await triggerSingleDownload(resourceUrl, activeTab === 'audio' ? 'mp3' : 'mp4');
      } else {
        // Descarga múltiple para fotos
        for (const index of selectedImages) {
          await triggerSingleDownload(data.urls[index], 'jpg', `_img_${index + 1}`);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const triggerSingleDownload = async (url: string, ext: string, suffix = '') => {
    // LÓGICA DINÁMICA DE URL (Igual que en YouTubeFlow)
    const isLocal = window.location.hostname === 'localhost';
    const apiUrl = isLocal 
      ? "http://localhost:4000/api/tiktok/download" 
      : "https://ryomixed-production.up.railway.app/api/tiktok/download";

    const params = new URLSearchParams({
      url: url,
      title: data.sanitizedTitle + suffix,
      type: ext === 'mp3' ? 'audio' : 'video'
    });

    const response = await fetch(`${apiUrl}?${params.toString()}`);
    
    if (!response.ok) throw new Error('Error al procesar la descarga en el servidor');

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${data.sanitizedTitle}${suffix}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="w-full max-w-5xl bg-[#0d0d0d]/95 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      
      {/* HEADER DE INFORMACIÓN */}
      <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-pink-500/5 to-transparent">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-pink-600 rounded-2xl shadow-lg shadow-pink-900/40 relative">
            {data.type === 'photos' ? (
              <div className="relative">
                <ImageIcon className="text-white w-6 h-6" />
                <Layers className="text-pink-200/50 w-3 h-3 absolute -top-1.5 -right-1.5" />
              </div>
            ) : (
              <Video className="text-white w-6 h-6 fill-current" />
            )}
            
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0d0d0d] flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white stroke-[4px]" />
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-black text-white tracking-tight line-clamp-1">{data.title}</h2>
            <p className="text-sm text-pink-500 font-bold uppercase tracking-[0.2em]">@{data.author}</p>
          </div>
        </div>

        {/* TABS */}
        <div className="relative flex p-1.5 bg-white/5 rounded-2xl border border-white/10 w-fit">
          <button 
            ref={contentBtnRef}
            onClick={() => setActiveTab('content')}
            className={`relative z-10 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'content' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {data.type === 'photos' ? 'Galería HD' : 'Video MP4'}
          </button>
          <button 
            ref={audioBtnRef}
            onClick={() => setActiveTab('audio')}
            className={`relative z-10 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'audio' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Audio MP3
          </button>
          <div 
            className="absolute h-[calc(100%-12px)] top-1.5 bg-pink-600 rounded-xl transition-all duration-300 shadow-lg shadow-pink-900/40"
            style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row min-h-[450px]">
        {/* ÁREA DE CONTENIDO */}
        <div className="flex-grow p-8 bg-black/20">
          {activeTab === 'content' ? (
            data.type === 'photos' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {data.urls.map((url, i) => (
                  <div 
                    key={i} 
                    onClick={() => toggleImage(i)}
                    className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer group transition-all duration-500 ${selectedImages.includes(i) ? 'ring-4 ring-pink-600 scale-[0.96]' : 'opacity-40 hover:opacity-100 hover:scale-[1.02]'}`}
                  >
                    <img src={url} className="w-full h-full object-cover" alt={`TikTok ${i}`} />
                    <div className={`absolute inset-0 bg-pink-600/20 transition-opacity ${selectedImages.includes(i) ? 'opacity-100' : 'opacity-0'}`} />
                    <div className={`absolute top-3 right-3 p-1.5 rounded-full shadow-xl transition-all ${selectedImages.includes(i) ? 'bg-pink-600 scale-110' : 'bg-black/60 opacity-0 group-hover:opacity-100'}`}>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="relative group max-w-sm w-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
                  <img src={data.thumbnail} className="w-full object-cover" alt="Video Preview" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="p-4 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
                      <Video className="w-8 h-8 text-white fill-current" />
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
              <div className="w-24 h-24 bg-pink-600/10 rounded-full flex items-center justify-center animate-pulse">
                <Music className="w-12 h-12 text-pink-600" />
              </div>
              <div className="text-center">
                <p className="text-white font-black uppercase tracking-widest text-xs">Audio Original Detectado</p>
                <p className="text-white/40 text-[10px] mt-2 uppercase">320kbps • HQ Extract</p>
              </div>
            </div>
          )}
        </div>

        {/* PANEL LATERAL */}
        <div className="w-full md:w-80 p-8 border-l border-white/5 bg-white/[0.02] flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Configuración</h3>
            
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/60 uppercase">Formato:</span>
                <span className="text-[10px] font-black text-pink-500 uppercase">{activeTab === 'audio' ? 'MP3' : data.type === 'photos' ? 'JPG' : 'MP4'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/60 uppercase">Archivos:</span>
                <span className="text-[10px] font-black text-white uppercase">
                  {activeTab === 'audio' || data.type === 'video' ? '1' : selectedImages.length}
                </span>
              </div>
            </div>

            {data.type === 'photos' && activeTab === 'content' && (
               <p className="text-[9px] text-white/40 leading-relaxed text-center italic">
                 Haz clic en las fotos para seleccionarlas.
               </p>
            )}
          </div>

          <button 
            onClick={handleDownload}
            disabled={isDownloading || (data.type === 'photos' && activeTab === 'content' && selectedImages.length === 0)}
            className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 ${
              isDownloading 
              ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
              : 'bg-pink-600 hover:bg-pink-500 text-white shadow-2xl shadow-pink-900/40 active:scale-95'
            }`}
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isDownloading ? 'Bajando...' : 'Descargar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TikTokFlow;