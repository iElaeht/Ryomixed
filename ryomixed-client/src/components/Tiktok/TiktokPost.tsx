import React, { useState } from 'react';
import { 
  Download, 
  Image as ImageIcon, 
  Loader2, 
  Check,
  ShieldCheck,
  Layers,
  FileCode,
  Music,
  Disc
} from 'lucide-react';

import { API_CONFIG } from '../../config/api.config';
import type { TikTokMedia } from '../../types/tiktok';

interface TiktokPostProps {
  data: TikTokMedia;
}

const TiktokPost: React.FC<TiktokPostProps> = ({ data }) => {
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'gallery' | 'audio'>('gallery');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);

  const toggleSelect = (index: number) => {
    setSelectedIndexes(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleDownloadAudio = async () => {
    if (!data.audioUrl || isDownloadingAudio) return;
    setIsDownloadingAudio(true);

    const downloadEndpoint = API_CONFIG.endpoints.tiktok('/download');
    const finalName = `${data.sanitizedTitle}_Audio`;

    const params = new URLSearchParams({
      url: data.audioUrl,
      title: finalName,
      type: 'audio'
    });

    const link = document.createElement('a');
    link.href = `${downloadEndpoint}?${params.toString()}`;
    link.setAttribute('download', `${finalName}.mp3`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setIsDownloadingAudio(false), 2000);
  };

  const handleDownloadSelected = async () => {
    if (selectedIndexes.length === 0 || isDownloading) return;
    setIsDownloading(true);

    const downloadEndpoint = API_CONFIG.endpoints.tiktok('/download');

    for (const index of selectedIndexes) {
      const imageUrl = data.urls[index];
      const finalName = `${data.sanitizedTitle}_${index + 1}`;
      const params = new URLSearchParams({
        url: imageUrl, 
        title: finalName,
        type: 'photos' 
      });

      const link = document.createElement('a');
      link.href = `${downloadEndpoint}?${params.toString()}`;
      link.setAttribute('download', `${finalName}.jpg`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    setIsDownloading(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#0d0d0d]/95 backdrop-blur-2xl border border-white/5 rounded-[2rem] md:rounded-[3rem] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-500 my-4">
      
      {/* HEADER */}
      <div className="p-6 md:p-10 border-b border-white/5 flex flex-col items-center justify-center text-center gap-3 bg-gradient-to-b from-pink-500/10 to-transparent relative">
        <div className="absolute top-0 w-full h-full bg-pink-500/5 blur-[100px] -z-10" />
        <div className="p-4 bg-pink-600 rounded-2xl shadow-[0_0_30px_rgba(219,39,119,0.3)] mb-2 animate-pulse">
           <Layers className="text-white w-6 h-6" />
        </div>
        <div className="max-w-2xl px-4">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter italic mb-1 uppercase">TikTok Gallery</h2>
          <p className="text-[10px] md:text-xs text-pink-500 font-black uppercase tracking-[0.3em]">@{data.author}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* PANEL IZQUIERDO: Siempre Galería (Mantiene UX) */}
        <div className="lg:w-2/3 p-6 md:p-8 bg-black/40 border-b lg:border-b-0 lg:border-r border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 max-h-[450px] md:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {data.urls.map((url, index) => {
              const proxiedThumb = `${API_CONFIG.BASE_URL}/api/proxy/image?url=${encodeURIComponent(url)}`;
              const isSelected = selectedIndexes.includes(index);
              return (
                <div 
                  key={index} 
                  onClick={() => toggleSelect(index)}
                  className={`group relative aspect-[3/4] rounded-2xl md:rounded-[2rem] overflow-hidden border-2 transition-all cursor-pointer ${
                    isSelected ? 'border-pink-500 scale-[0.98]' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <img src={proxiedThumb} className={`w-full h-full object-cover transition-all duration-700 ${isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-100 group-hover:scale-105'}`} alt={`TikTok ${index}`} />
                  {isSelected && (
                    <div className="absolute inset-0 bg-pink-600/10 flex items-center justify-center">
                      <div className="bg-white p-2 rounded-full shadow-2xl"><Check className="w-5 h-5 text-pink-600 stroke-[4px]" /></div>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black text-white">#{index + 1}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL DERECHO: Control dinámico */}
        <div className="lg:w-1/3 p-6 md:p-10 flex flex-col bg-white/[0.01]">
          <div className="flex-grow space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-500" /> Control Hub
              </h3>
            </div>

            {/* TABS DE SELECCIÓN (Solo si hay Audio) */}
            {data.audioUrl && (
              <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
                <button 
                  onClick={() => setActiveTab('gallery')}
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'gallery' ? 'bg-pink-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                  <ImageIcon className="w-4 h-4" /> Galería
                </button>
                <button 
                  onClick={() => setActiveTab('audio')}
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'audio' ? 'bg-pink-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                  <Music className="w-4 h-4" /> Audio
                </button>
              </div>
            )}

            {/* CONTENIDO DINÁMICO SEGÚN TAB */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {activeTab === 'gallery' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-[8px] font-bold text-white/30 uppercase block mb-1">Fotos</span>
                      <span className="text-[12px] font-black text-white">{data.urls.length}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-[8px] font-bold text-white/30 uppercase block mb-1">Calidad</span>
                      <span className="text-[12px] font-black text-pink-500 uppercase italic">HD</span>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] font-bold text-white/30 uppercase block mb-1">Selección</span>
                      <span className="text-[12px] font-black text-white uppercase">{selectedIndexes.length} Seleccionadas</span>
                    </div>
                    <Check className={`w-5 h-5 transition-colors ${selectedIndexes.length > 0 ? 'text-pink-500' : 'text-white/10'}`} />
                  </div>
                  <div className="p-5 rounded-2xl bg-pink-500/5 border border-pink-500/10 flex items-center gap-4">
                    <FileCode className="w-5 h-5 text-pink-500 shrink-0" />
                    <span className="text-[10px] text-white/70 font-mono truncate">{data.sanitizedTitle}.jpg</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 text-center">
                    <Disc className="w-12 h-12 text-pink-500 mx-auto mb-4 animate-spin-slow" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest block mb-1">Sonido Original</span>
                    <span className="text-[12px] text-pink-500 font-mono">MP3 / 320kbps</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                    <Music className="w-5 h-5 text-pink-500 shrink-0" />
                    <span className="text-[10px] text-white/70 font-mono truncate">{data.sanitizedTitle}_audio.mp3</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BOTÓN DE ACCIÓN ÚNICO SEGÚN TAB */}
          <div className="mt-10">
            {activeTab === 'gallery' ? (
              <button 
                onClick={handleDownloadSelected}
                disabled={selectedIndexes.length === 0 || isDownloading}
                className={`w-full py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-4 active:scale-[0.97] ${
                  selectedIndexes.length === 0 || isDownloading ? 'bg-white/5 text-white/10 border border-white/5' : 'bg-white text-black hover:bg-pink-500 hover:text-white'
                }`}
              >
                {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {isDownloading ? 'Bajando...' : `Bajar Fotos (${selectedIndexes.length})`}
              </button>
            ) : (
              <button 
                onClick={handleDownloadAudio}
                disabled={isDownloadingAudio}
                className="w-full py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-4 bg-pink-600 text-white hover:bg-pink-500 active:scale-[0.97] disabled:opacity-50"
              >
                {isDownloadingAudio ? <Loader2 className="w-5 h-5 animate-spin" /> : <Music className="w-5 h-5" />}
                {isDownloadingAudio ? 'Preparando...' : 'Bajar Audio'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiktokPost;