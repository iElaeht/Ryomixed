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

// Configuración y Tipado
import { API_CONFIG } from '../../config/api.config';
import type { InstagramData } from '../../types/instagram';

interface InstagramPostProps {
  data: InstagramData;
}

/**
 * COMPONENTE: InstagramPost (@RyoMixed)
 * Gestiona galerías múltiples (Carruseles) permitiendo selección individual.
 */
const InstagramPost: React.FC<InstagramPostProps> = ({ data }) => {
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  /**
   * Gestiona la selección/deselección de elementos en la grilla
   */
  const toggleSelect = (index: number) => {
    setSelectedIndexes(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  /**
   * Identifica los tipos de medios seleccionados para el feedback visual
   */
  const getSelectedTypes = () => {
    if (selectedIndexes.length === 0) return "Ninguno";
    const types = new Set(selectedIndexes.map(i => data.media[i].type.toUpperCase()));
    return Array.from(types).join(' + ');
  };

  /**
   * PROCESO DE DESCARGA:
   * Ejecuta descargas secuenciales de los elementos seleccionados.
   */
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
      
      // Pequeña pausa para no saturar el socket del navegador
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setIsDownloading(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#0d0d0d]/95 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      
      {/* SECCIÓN: HEADER (Identidad Visual Blue) */}
      <div className="p-8 border-b border-white/5 flex flex-col items-center justify-center text-center gap-4 bg-gradient-to-b from-blue-500/10 to-transparent">
        <div className="p-4 bg-gradient-to-tr from-blue-400 via-indigo-600 to-purple-600 rounded-2xl shadow-xl relative mb-2">
           <Layers className="text-white w-6 h-6" />
        </div>
        <div className="max-w-2xl">
          <h2 className="text-2xl font-black text-white tracking-tight line-clamp-2 mb-1">Selector de Galería</h2>
          <p className="text-xs text-blue-400 font-black uppercase tracking-[0.3em]">
            POST POR @{data.author !== 'ig_user' ? data.author : 'INSTAGRAM_USER'}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* PANEL IZQUIERDO: Grilla de Selección con Proxy de Imágenes */}
        <div className="lg:w-2/3 p-8 bg-black/40 border-b lg:border-b-0 lg:border-r border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {data.media.map((item, index) => {
              // Aplicamos el PROXY a cada miniatura de la galería
              const proxiedThumb = `${API_CONFIG.BASE_URL}/api/proxy/image?url=${encodeURIComponent(item.thumbnail)}`;
              
              return (
                <div 
                  key={index} 
                  onClick={() => toggleSelect(index)}
                  className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedIndexes.includes(index) 
                      ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img 
                    src={proxiedThumb} 
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      selectedIndexes.includes(index) ? 'scale-110 opacity-100' : 'opacity-60 group-hover:opacity-100'
                    }`} 
                    alt={`Preview ${index}`} 
                  />
                  
                  {/* Indicador de Tipo (Video/Foto) */}
                  <div className="absolute top-2 left-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                    {item.type === 'video' ? <Video className="w-3 h-3 text-white" /> : <ImageIcon className="w-3 h-3 text-white" />}
                  </div>

                  {/* Check de Selección */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-all ${
                    selectedIndexes.includes(index) ? 'bg-blue-600/20 opacity-100' : 'opacity-0'
                  }`}>
                    <div className="bg-blue-500 p-2 rounded-full shadow-lg">
                      <Check className="w-6 h-6 text-white stroke-[4px]" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL DERECHO: Metadata y Botón de Acción */}
        <div className="lg:w-1/3 p-8 flex flex-col justify-between bg-white/[0.01]">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-blue-500" /> Panel de Control
              </h3>
              <span className="text-[9px] font-black text-blue-500/50 italic">@RyoMixedIG</span>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[9px] font-bold text-white/40 uppercase block mb-1">Formato</span>
                  <span className="text-[11px] font-black text-blue-400 uppercase">{getSelectedTypes()}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[9px] font-bold text-white/40 uppercase block mb-1">Calidad</span>
                  <span className="text-[11px] font-black text-white uppercase">HD 1080P</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-white/40 uppercase block mb-1">Seleccionados</span>
                  <span className="text-[11px] font-black text-blue-500 uppercase">{selectedIndexes.length} Archivos</span>
                </div>
                <Layers className="w-4 h-4 text-white/20" />
              </div>

              <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
                <span className="text-[9px] font-black text-blue-400 uppercase block mb-3 tracking-widest text-center">Nombre Final</span>
                <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                  <FileCode className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-[10px] text-white/80 font-mono truncate">
                    {selectedIndexes.length > 0 
                      ? (data.media[selectedIndexes[0]].filename || data.sanitizedTitle)
                      : data.sanitizedTitle}...
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleDownloadSelected}
            disabled={selectedIndexes.length === 0 || isDownloading}
            className={`mt-8 w-full py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-3 ${
              selectedIndexes.length === 0 || isDownloading
              ? 'bg-white/5 text-white/20 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)] text-white active:scale-[0.98]'
            }`}
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isDownloading 
              ? 'Descargando...' 
              : selectedIndexes.length > 1 
                ? `Descargar (${selectedIndexes.length})` 
                : 'Descargar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstagramPost;