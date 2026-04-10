import React, { useState } from 'react';
import { Download, Music, CheckCircle2, User, ChevronLeft, Loader2 } from 'lucide-react';

interface TikTokFlowProps {
  data: {
    type: 'video' | 'photos';
    title: string;
    sanitizedTitle: string;
    author: string;
    thumbnail: string;
    urls: string[]; // En video, el primer elemento es el link directo
    audioUrl?: string;
  };
}

const TikTokFlow: React.FC<TikTokFlowProps> = ({ data }) => {
  const [step, setStep] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<number[]>(
    data.type === 'photos' ? data.urls.map((_, i) => i) : []
  );

  const isPhotos = data.type === 'photos';

  const toggleImage = (index: number) => {
    setSelectedImages(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

const handleDownload = async (mode: 'video' | 'audio' | 'single' | 'photos') => {
    // ESTA LÓGICA DETECTA SI ESTÁS EN TU PC O EN LA NUBE
    const baseUrlApi = window.location.hostname === 'localhost' 
      ? 'http://localhost:4000' 
      : 'https://tu-url-de-render.onrender.com';

    const downloadEndpoint = `${baseUrlApi}/api/tiktok/download`;
    
    let targetUrl = data.urls[0]; 
    let downloadType: 'video' | 'audio' | 'single' | 'photos' = mode;

    if (mode === 'audio' && data.audioUrl) {
      targetUrl = data.audioUrl;
    } else if (mode === 'single' && isPhotos) {
      targetUrl = data.urls[selectedImages[0]];
      downloadType = 'photos';
    }

    setDownloading(true);

    try {
      const params = new URLSearchParams({
        url: targetUrl,
        title: data.sanitizedTitle,
        type: downloadType
      });

      const link = document.createElement('a');
      link.href = `${downloadEndpoint}?${params.toString()}`;
      link.setAttribute('download', `${data.sanitizedTitle}.${mode === 'audio' ? 'mp3' : 'mp4'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Error en la descarga:", error);
      alert("Hubo un fallo al procesar la descarga.");
    } finally {
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl bg-[#0a0f1a]/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-6 md:p-8 animate-in fade-in zoom-in-95 duration-500 shadow-2xl">
      <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-stretch">
        
        {/* LADO IZQUIERDO: PREVIEW */}
        <div className="flex flex-col gap-4 w-full lg:w-72 shrink-0">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 aspect-video shadow-inner">
            <img 
              src={data.thumbnail} 
              alt={data.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer" 
            />
            {isPhotos && (
              <div className="absolute top-2 right-2 bg-pink-600 px-2 py-0.5 rounded-lg text-[10px] font-black text-white shadow-xl">
                {data.urls.length} FOTOS
              </div>
            )}
          </div>
          
          <div className="space-y-1 px-1 text-left">
            <h3 className="text-lg font-black text-white leading-tight tracking-tight line-clamp-2 italic uppercase">
              {data.title}
            </h3>
            <div className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <User className="w-3 h-3 text-pink-500" />
              <span className="opacity-60 uppercase tracking-widest text-[9px] font-black">{data.author}</span>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: INTERFAZ */}
        <div className="flex-grow flex flex-col min-h-[300px] w-full text-left">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-[9px] font-black text-white">
                {step}
              </span>
              <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
                {step === 1 ? (isPhotos ? "Seleccionar Imágenes" : "Elegir Formato") : "Confirmar Descarga"}
              </h4>
            </div>
            {step > 1 && !downloading && (
              <button onClick={() => setStep(1)} className="text-gray-500 hover:text-white transition-colors text-[9px] font-black tracking-widest uppercase flex items-center gap-1">
                <ChevronLeft className="w-3 h-3" /> Volver
              </button>
            )}
          </div>

          <div className="flex-grow flex flex-col justify-center items-center lg:items-start">
            {step === 1 ? (
              <div className="animate-in slide-in-from-right-4 duration-300 w-full">
                {isPhotos ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                      {data.urls.map((url, index) => (
                        <div 
                          key={index}
                          onClick={() => toggleImage(index)}
                          className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                            selectedImages.includes(index) ? 'border-pink-500 scale-95' : 'border-transparent opacity-50'
                          }`}
                        >
                          <img src={url} alt="" className="w-full h-16 object-cover" referrerPolicy="no-referrer" />
                          {selectedImages.includes(index) && (
                            <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <button 
                      disabled={selectedImages.length === 0}
                      onClick={() => setStep(2)}
                      className="w-full max-w-sm bg-white text-black font-black py-3 rounded-xl text-[10px] tracking-[0.2em] uppercase hover:bg-pink-600 hover:text-white transition-all disabled:opacity-30"
                    >
                      Continuar con {selectedImages.length} items
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm w-full">
                    <button 
                      onClick={() => setStep(2)}
                      className="group flex flex-col items-center gap-3 p-5 rounded-3xl border border-white/5 bg-white/5 hover:bg-pink-600/20 hover:border-pink-500/50 transition-all"
                    >
                      <Download className="w-8 h-8 text-pink-500" />
                      <span className="text-[9px] font-black tracking-widest uppercase">Video Sin Marca</span>
                    </button>
                    <button 
                      onClick={() => handleDownload('audio')}
                      disabled={downloading}
                      className="group flex flex-col items-center gap-3 p-5 rounded-3xl border border-white/5 bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/50 transition-all disabled:opacity-50"
                    >
                      {downloading ? <Loader2 className="w-8 h-8 text-blue-500 animate-spin" /> : <Music className="w-8 h-8 text-blue-500" />}
                      <span className="text-[9px] font-black tracking-widest uppercase">Solo Audio MP3</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-sm animate-in zoom-in-95 duration-300 space-y-6 w-full text-center lg:text-left">
                <div className="space-y-2">
                  <Download className="w-10 h-10 text-pink-500 mx-auto lg:mx-0" />
                  <h4 className="text-white font-black text-2xl uppercase italic leading-none">
                    {downloading ? "Procesando..." : "¡Listo para bajar!"}
                  </h4>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                    {isPhotos ? `Pack de ${selectedImages.length} fotos` : "Video HD optimizado"}
                  </p>
                </div>
                <button 
                  disabled={downloading}
                  onClick={() => handleDownload(isPhotos ? 'single' : 'video')}
                  className="w-full bg-pink-600 hover:bg-pink-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all text-[11px] tracking-widest uppercase disabled:bg-gray-800"
                >
                  {downloading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  {downloading ? "Descargando..." : "Descargar Ahora"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TikTokFlow;