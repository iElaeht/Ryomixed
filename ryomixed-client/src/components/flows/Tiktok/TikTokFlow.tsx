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

// Configuración Centralizada
import { API_CONFIG } from '../../../config/api.config';

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

/**
 * COMPONENTE: TikTokFlow (@RyoMixed)
 * Maneja tanto videos individuales como álbumes de fotos (slideshows) de TikTok.
 */
const TikTokFlow: React.FC<TikTokFlowProps> = ({ data, originalUrl }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'audio'>('content');
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  
  const contentBtnRef = useRef<HTMLButtonElement>(null);
  const audioBtnRef = useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Selección automática de fotos al cargar un álbum
  useEffect(() => {
    if (data.type === 'photos') {
      setSelectedImages(data.urls.map((_, i) => i));
    }
  }, [data]);

  // Animación del indicador de pestañas (Tab System)
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

  /**
   * ORQUESTADOR DE DESCARGAS:
   * Gestiona lógica para Video, Audio y Carrusel de Imágenes.
   */
  const handleDownload = async () => {
    if (!originalUrl || isDownloading) return;
    setIsDownloading(true);

    try {
      if (activeTab === 'audio' || data.type === 'video') {
        const resourceUrl = activeTab === 'audio' ? data.audioUrl : data.urls[0];
        if (!resourceUrl) throw new Error("Recurso no disponible");
        await triggerSingleDownload(resourceUrl, activeTab === 'audio' ? 'mp3' : 'mp4');
      } else {
        // Ciclo de descarga para selección múltiple de fotos
        for (const index of selectedImages) {
          await triggerSingleDownload(data.urls[index], 'jpg', `_img_${index + 1}`);
        }
      }
    } catch (err: unknown) {
      console.error("❌ [TikTok Download Error]:", (err as Error).message);
      alert(`Error al descargar: ${(err as Error).message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Helper para disparar descargas individuales vía Backend
   */
  const triggerSingleDownload = async (url: string, ext: string, suffix = '') => {
    const downloadEndpoint = API_CONFIG.endpoints.tiktok('/download');

    const params = new URLSearchParams({
      url: url,
      title: data.sanitizedTitle + suffix,
      type: ext === 'mp3' ? 'audio' : 'video'
    });

    const response = await fetch(`${downloadEndpoint}?${params.toString()}`);
    
    if (!response.ok) throw new Error('Error en el servidor de descargas');

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${data.sanitizedTitle}${suffix}.${ext}`;
    document.body.appendChild(link);
    link.click();
    
    // Limpieza
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  };

  /**
   * Proxy de Imágenes para evitar bloqueos de TikTok (CORS/Hotlinking)
   */
  const getProxiedUrl = (url: string) => 
    `${API_CONFIG.BASE_URL}/api/proxy/image?url=${encodeURIComponent(url)}`;

  return (
    <div className="w-full max-w-5xl bg-[#0d0d0d]/95 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      
      {/* SECCIÓN: HEADER (Pink Identity) */}
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

        {/* SELECTOR DE PESTAÑAS (TABS) */}
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
        {/* PANEL PRINCIPAL: Visualización de Contenido */}
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
                    <img src={getProxiedUrl(url)} className="w-full h-full object-cover" alt={`TikTok Image ${i}`} />
                    <div className={`absolute inset-0 bg-pink-600/20 transition-opacity ${selectedImages.includes(i) ? 'opacity-100' : 'opacity-0'}`} />
                    <div className={`absolute top-3 right-3 p-1.5 rounded-full shadow-xl transition-all ${selectedImages.includes(i) ? 'bg-pink-600 scale-110' : 'bg-black/60 opacity-0 group-hover:opacity-100'}`}>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="relative group max-w-sm w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 aspect-[9/16]">
                  <img src={getProxiedUrl(data.thumbnail)} className="w-full h-full object-cover" alt="Video Preview" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="p-5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
                      <Video className="w-10 h-10 text-white fill-current" />
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
                <p className="text-white font-black uppercase tracking-[0.2em] text-xs">Audio Original Extraído</p>
                <p className="text-pink-500/50 text-[10px] mt-2 font-bold uppercase tracking-widest">320kbps • High Fidelity</p>
              </div>
            </div>
          )}
        </div>

        {/* PANEL LATERAL: Controles y Resumen */}
        <div className="w-full md:w-80 p-8 border-l border-white/5 bg-white/[0.02] flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 flex items-center gap-2">
              Panel RyoMixed
            </h3>
            
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/40 uppercase">Formato:</span>
                <span className="text-[10px] font-black text-pink-500 uppercase">{activeTab === 'audio' ? 'MP3' : data.type === 'photos' ? 'JPG' : 'MP4'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/40 uppercase">Items:</span>
                <span className="text-[10px] font-black text-white uppercase">
                  {activeTab === 'audio' || data.type === 'video' ? '1' : selectedImages.length}
                </span>
              </div>
            </div>

            {data.type === 'photos' && activeTab === 'content' && (
               <p className="text-[9px] text-white/30 leading-relaxed text-center font-bold uppercase tracking-tighter">
                 Selección inteligente activa
               </p>
            )}
          </div>

          <button 
            onClick={handleDownload}
            disabled={isDownloading || (data.type === 'photos' && activeTab === 'content' && selectedImages.length === 0)}
            className={`w-full py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 ${
              isDownloading 
              ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:shadow-lg hover:shadow-pink-600/20 text-white active:scale-95'
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