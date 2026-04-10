import React, { useState } from 'react';
import { 
  Download, Clock, User, ChevronLeft, ChevronRight, 
  PlayCircle, Headphones, CheckCircle2, Settings2 
} from 'lucide-react';

interface YouTubeFlowProps {
  data: {
    title: string;
    sanitizedTitle?: string;
    author: string;
    thumbnail: string;
    duration?: number;
    formats?: Array<{ id: string; label: string; ext: string }>;
  };
  originalUrl: string;
}

const YouTubeFlow: React.FC<YouTubeFlowProps> = ({ data, originalUrl }) => {
  const [step, setStep] = useState(1);
  const [downloadType, setDownloadType] = useState<'mp4' | 'mp3' | null>(null);
  const [selectedQualityId, setSelectedQualityId] = useState('');

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    // Apuntamos a la nueva ruta modular del servidor
    const baseUrl = 'http://localhost:4000/api/youtube/download';
    
    // Si es MP3, enviamos 'mp3' como formato. 
    // Si es video, enviamos el ID específico de la calidad (ej: '137', '22').
    const finalFormat = downloadType === 'mp3' ? 'mp3' : selectedQualityId;

    const params = new URLSearchParams({
      url: originalUrl,
      format: finalFormat, 
      title: data.sanitizedTitle || data.title
    });

    const link = document.createElement('a');
    link.href = `${baseUrl}?${params.toString()}`;
    link.setAttribute('download', ''); 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-5xl bg-[#0a0f1a]/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-6 md:p-8 animate-in fade-in zoom-in-95 duration-500 shadow-2xl">
      <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-stretch">
        
        {/* LADO IZQUIERDO: PREVIEW */}
        <div className="flex flex-col gap-4 w-full lg:w-72 shrink-0">
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/40">
            <img 
              src={data.thumbnail} 
              alt={data.title} 
              className="w-full aspect-video object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1.5 border border-white/10">
              <Clock className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] font-bold font-mono text-white/90">{formatDuration(data.duration)}</span>
            </div>
          </div>
          
          <div className="space-y-1 px-1 text-left">
            <h3 className="text-lg font-black text-white leading-tight tracking-tight line-clamp-2 italic uppercase">
              {data.title}
            </h3>
            <div className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <User className="w-3 h-3 text-blue-500" />
              <span className="opacity-60 uppercase tracking-widest text-[9px] font-black">{data.author}</span>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: INTERFAZ */}
        <div className="flex-grow flex flex-col min-h-[250px] w-full">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-6">
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-black text-white">
                {step}
              </span>
              <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
                {step === 1 && "Formato"}
                {step === 2 && "Calidad"}
                {step === 3 && "Finalizar"}
              </h4>
            </div>
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)} 
                className="text-gray-500 hover:text-white transition-colors text-[9px] font-black tracking-widest uppercase flex items-center gap-1"
              >
                <ChevronLeft className="w-3 h-3" /> Volver
              </button>
            )}
          </div>

          <div className="flex-grow flex flex-col justify-center items-center lg:items-start">
            <div className="w-full max-w-sm">
              
              {/* PASO 1: MP4 o MP3 */}
              {step === 1 && (
                <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-right-4 duration-300">
                  <button 
                    onClick={() => { 
                      setDownloadType('mp4'); 
                      // Pre-seleccionamos la primera calidad disponible
                      if(data.formats?.length) setSelectedQualityId(data.formats[0].id);
                      setStep(2); 
                    }}
                    className="group flex flex-col items-center gap-3 p-5 rounded-[1.5rem] border border-white/5 bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/50 transition-all"
                  >
                    <PlayCircle className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black text-white tracking-[0.15em]">VIDEO MP4</span>
                  </button>
                  <button 
                    onClick={() => { 
                      setDownloadType('mp3'); 
                      setSelectedQualityId('mp3');
                      setStep(2); 
                    }}
                    className="group flex flex-col items-center gap-3 p-5 rounded-[1.5rem] border border-white/5 bg-white/5 hover:bg-purple-600/20 hover:border-purple-500/50 transition-all"
                  >
                    <Headphones className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black text-white tracking-[0.15em]">AUDIO MP3</span>
                  </button>
                </div>
              )}

              {/* PASO 2: Calidad */}
              {step === 2 && (
                <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Settings2 className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Ajustes {downloadType}</span>
                  </div>

                  {downloadType === 'mp4' ? (
                    <select 
                      value={selectedQualityId}
                      onChange={(e) => setSelectedQualityId(e.target.value)}
                      className="w-full bg-blue-900/10 text-white text-xs font-bold p-4 rounded-xl border border-white/10 outline-none cursor-pointer focus:border-blue-500/50"
                    >
                      {data.formats?.map((f) => (
                        <option key={f.id} value={f.id} className="bg-[#0a0f1a]">
                          {f.label} (.{f.ext})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-xl flex items-center gap-3 text-purple-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-[9px] font-black uppercase tracking-[0.1em]">Audio HQ 320kbps</span>
                    </div>
                  )}

                  <button 
                    onClick={() => setStep(3)}
                    className="w-full bg-white text-black font-black py-4 rounded-xl text-[11px] flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest"
                  >
                    Continuar <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* PASO 3: Finalizar */}
              {step === 3 && (
                <div className="space-y-6 animate-in zoom-in-95 duration-300 text-center lg:text-left">
                  <div className="space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-blue-500 mx-auto lg:mx-0" />
                    <h4 className="text-white font-black text-xl uppercase italic">¡Todo listo!</h4>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                      Tu archivo está preparado para bajar
                    </p>
                  </div>

                  <button 
                    onClick={handleDownload}
                    className="w-full group bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                  >
                    <Download className="w-5 h-5 group-hover:animate-bounce" />
                    <span className="text-[11px] tracking-widest font-black uppercase">Descargar ahora</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeFlow;