import React, { useState } from 'react';
import { 
  Download, 
  Image as ImageIcon, 
  Video, 
  Loader2, 
  Check,
  ShieldCheck,
  Layers,
  FileCode
} from 'lucide-react';

import { API_CONFIG } from '../../config/api.config';
import type { InstagramData } from '../../types/instagram';

interface InstagramPostProps {
  data: InstagramData;
}

const InstagramPost: React.FC<InstagramPostProps> = ({ data }) => {
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const toggleSelect = (index: number) => {
    setSelectedIndexes(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const getSelectedTypes = () => {
    if (selectedIndexes.length === 0) return "Ninguno";
    const types = new Set(selectedIndexes.map(i => data.media[i].type.toUpperCase()));
    return Array.from(types).join(' + ');
  };

  const handleDownloadSelected = async () => {
    if (selectedIndexes.length === 0 || isDownloading) return;
    setIsDownloading(true);

    const downloadEndpoint = API_CONFIG.endpoints.instagram('/download');

    for (const index of selectedIndexes) {
      const item = data.media[index];
      const finalName = item.filename || `${data.sanitizedTitle}_${index + 1}`;

      const params = new URLSearchParams({
        url: item.url, 
        title: finalName,
        type: item.type
      });

      const link = document.createElement('a');
      link.href = `${downloadEndpoint}?${params.toString()}`;
      link.setAttribute('download', `${finalName}.${item.ext}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setIsDownloading(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#0d0d0d]/95 backdrop-blur-2xl border border-white/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-500 my-4">
      
      {/* SECCIÓN: HEADER - Ajustado para móvil */}
      <div className="p-6 md:p-8 border-b border-white/5 flex flex-col items-center justify-center text-center gap-3 md:gap-4 bg-gradient-to-b from-blue-500/10 to-transparent">
        <div className="p-3 md:p-4 bg-gradient-to-tr from-blue-400 via-indigo-600 to-purple-600 rounded-xl md:rounded-2xl shadow-xl relative">
           <Layers className="text-white w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div className="max-w-2xl px-2">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight line-clamp-1 mb-1">
            Galería de Medios
          </h2>
          <p className="text-[9px] md:text-xs text-blue-400 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-80">
            CONTENIDO DE @{data.author !== 'ig_user' ? data.author : 'USER'}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* PANEL IZQUIERDO: Grilla de Selección */}
        <div className="w-full lg:w-2/3 p-4 md:p-8 bg-black/20 border-b lg:border-b-0 lg:border-r border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 max-h-[400px] md:max-h-[550px] overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
            {data.media.map((item, index) => {
              const proxiedThumb = `${API_CONFIG.BASE_URL}/api/proxy/image?url=${encodeURIComponent(item.thumbnail)}`;
              
              return (
                <div 
                  key={index} 
                  onClick={() => toggleSelect(index)}
                  className={`group relative aspect-square rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedIndexes.includes(index) 
                      ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                      : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <img 
                    src={proxiedThumb} 
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      selectedIndexes.includes(index) ? 'scale-110 opacity-100' : 'opacity-50 group-hover:opacity-100'
                    }`} 
                    alt={`Preview ${index}`} 
                  />
                  
                  {/* Tipo Icon */}
                  <div className="absolute top-2 left-2 p-1 md:p-1.5 bg-black/70 backdrop-blur-md rounded-lg border border-white/10 z-10">
                    {item.type === 'video' ? <Video className="w-3 h-3 text-white" /> : <ImageIcon className="w-3 h-3 text-white" />}
                  </div>

                  {/* Check Overlay */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                    selectedIndexes.includes(index) ? 'bg-blue-600/30 opacity-100' : 'opacity-0'
                  }`}>
                    <div className="bg-blue-500 p-1.5 md:p-2 rounded-full shadow-2xl transform scale-110">
                      <Check className="w-5 h-5 md:w-6 md:h-6 text-white stroke-[4px]" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Contador rápido para móvil */}
          <div className="mt-4 lg:hidden text-center">
             <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
               Toca las imágenes para seleccionar
             </span>
          </div>
        </div>

        {/* PANEL DERECHO: Metadata y Acción */}
        <div className="w-full lg:w-1/3 p-6 md:p-8 flex flex-col bg-white/[0.02]">
          <div className="space-y-6 flex-grow">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Control
              </h3>
              <span className="text-[9px] font-black text-blue-500/50 italic">HD Engine</span>
            </div>
            
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[8px] md:text-[9px] font-bold text-white/30 uppercase block mb-1">Formato</span>
                  <span className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase truncate block">{getSelectedTypes()}</span>
                </div>
                <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[8px] md:text-[9px] font-bold text-white/30 uppercase block mb-1">Calidad</span>
                  <span className="text-[10px] md:text-[11px] font-black text-white uppercase block">HD+</span>
                </div>
              </div>

              <div className="p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[8px] md:text-[9px] font-bold text-white/30 uppercase block mb-1">Items</span>
                  <span className="text-[10px] md:text-[11px] font-black text-blue-500 uppercase tracking-widest">
                    {selectedIndexes.length} Seleccionados
                  </span>
                </div>
                <Layers className="w-4 h-4 text-white/20" />
              </div>

              <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
                <div className="flex items-center gap-3 bg-black/50 p-3 rounded-xl border border-white/5">
                  <FileCode className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-[10px] text-white/70 font-mono truncate">
                    {selectedIndexes.length > 0 
                      ? (data.media[selectedIndexes[0]].filename || data.sanitizedTitle)
                      : data.sanitizedTitle}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleDownloadSelected}
            disabled={selectedIndexes.length === 0 || isDownloading}
            className={`mt-8 w-full py-5 md:py-6 rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.4em] md:tracking-[0.6em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 ${
              selectedIndexes.length === 0 || isDownloading
              ? 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
            }`}
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isDownloading 
              ? 'Procesando...' 
              : selectedIndexes.length > 1 
                ? `Bajar ${selectedIndexes.length} archivos` 
                : 'Descargar Selección'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstagramPost;