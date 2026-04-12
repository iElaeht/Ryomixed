import { useState, useCallback, useMemo } from 'react';
import Nav from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import ModalAbout from './components/ui/ModalAbout';
import YouTubeFlow from './components/YouTubeFlow';
import TikTokFlow from './components/TikTokFlow';
import { Search, Loader2, ClipboardPaste, Sparkles } from 'lucide-react';

// --- CONFIGURACIÓN ---
const RENDER_URL = 'https://tu-proyecto.up.railway.app';
const LOCAL_URL = 'http://localhost:4000';

// --- INTERFACES ---
interface YouTubeData {
  type: 'youtube';
  title: string;
  sanitizedTitle: string; 
  author: string;
  thumbnail: string;
  duration: number; 
  formats: Array<{ id: string; label: string; ext: string; filesize?: string }>;
}

interface TikTokData {
  type: 'video' | 'photos'; // Sincronizado con tiktok.service.ts
  title: string;
  sanitizedTitle: string; 
  author: string;
  thumbnail: string;
  urls: string[];
  audioUrl?: string;
}

type RyoData = YouTubeData | TikTokData;

function App() {
  const [url, setUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState(''); 
  const [videoData, setVideoData] = useState<RyoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Base de la API dinámica (localhost para desarrollo, Render para producción)
  const apiBaseUrl = useMemo(() => 
    window.location.hostname === 'localhost' ? LOCAL_URL : RENDER_URL
  , []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Error al acceder al portapapeles:', err);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpieza de URL para evitar parámetros de rastreo innecesarios
    const cleanUrl = url.trim().split(/\s+/).find(part => part.includes('http'));
    if (!cleanUrl) return;

    const isYouTube = cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be');
    
    setLoading(true);
    setVideoData(null); 
    setActiveUrl(cleanUrl); 

    try {
      const endpoint = isYouTube ? '/api/youtube/info' : '/api/tiktok/info';

      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl })
      });

      const responseData = await response.json();
      
      if (responseData.success && responseData.data) {
        const info = responseData.data;

        // Normalización de datos para los flujos
        setVideoData({
          ...info,
          type: isYouTube ? 'youtube' : info.type,
          // Aseguramos que siempre exista un sanitizedTitle para Windows
          sanitizedTitle: info.sanitizedTitle || info.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_'),
        });
      } else {
        throw new Error(responseData.message || "No se pudo obtener la información.");
      }
    } catch (error: unknown) {
      // Manejo de errores tipado para evitar el aviso de ESLint
      const errorMessage = error instanceof Error ? error.message : "Error de conexión con el servidor.";
      console.error("🔴 [App Search Error]:", errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0f1a] text-white selection:bg-blue-500/30 overflow-x-hidden">
      <Nav onOpenAbout={() => setIsAboutOpen(true)} />
      
      <main className="flex-grow flex flex-col items-center px-6 pt-12 md:pt-16 pb-20">
        <div className="w-full max-w-4xl text-center flex flex-col items-center">
          
          {/* Header Hero */}
          <div className="space-y-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <Sparkles className="w-3 h-3" /> RyoMixed MultiPlataforma
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              Tus momentos, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
                en tus manos.
              </span>
            </h1>
          </div>

          {/* Buscador */}
          <form onSubmit={handleSearch} className="w-full max-w-3xl flex flex-col items-center gap-6 mb-12">
            <div className="group relative w-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              
              <div className="relative flex items-center bg-blue-950/20 backdrop-blur-md border border-white/5 rounded-[2rem] p-2 transition-all group-focus-within:border-blue-500/50 shadow-2xl">
                <div className="pl-5 text-blue-400/50 hidden md:block">
                  <Search className="w-6 h-6" />
                </div>
                
                <input 
                  type="text"
                  placeholder="Pega el link de YouTube o TikTok..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-grow bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-600 font-medium py-5 px-4 text-base md:text-lg outline-none"
                />
                
                <button 
                  type="button" 
                  onClick={handlePaste} 
                  className="mr-2 flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/10 text-blue-400 transition-all active:scale-95 group/btn"
                >
                  <ClipboardPaste className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Pegar</span>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !url.trim()} 
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800/50 disabled:text-gray-500 px-10 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {loading ? 'Analizando...' : 'Buscar Contenido'}
            </button>
          </form>

          {/* Renderizado de Flujos */}
          <div className="w-full mt-4 flex justify-center pb-20">
            {videoData && (
              videoData.type === 'youtube' ? (
                <YouTubeFlow data={videoData} originalUrl={activeUrl} />
              ) : (
                <TikTokFlow data={videoData} originalUrl={activeUrl} />
              )
            )}
          </div>
        </div>
      </main>

      <Footer />
      <ModalAbout isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}

export default App;