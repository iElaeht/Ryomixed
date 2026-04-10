import { useState, useEffect } from 'react';
import Nav from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import ModalAbout from './components/ui/ModalAbout';
import YouTubeFlow from './components/YouTubeFlow';
import TikTokFlow from './components/TikTokFlow';
import { Search, Loader2, ClipboardPaste, Sparkles } from 'lucide-react';

// --- CONFIGURACIÓN DE URL ---
const RENDER_URL = 'https://ryomixed.onrender.com';
const LOCAL_URL = 'http://localhost:4000';

// --- INTERFACES ---
type TikTokType = 'video' | 'photos';

interface TikTokData {
  type: TikTokType;
  title: string;
  sanitizedTitle: string;
  author: string;
  thumbnail: string;
  urls: string[];
  audioUrl?: string;
}

interface RyoData extends Omit<TikTokData, 'type'> {
  type: 'youtube' | TikTokType;
  duration?: number;
  formats?: Array<{ id: string; label: string; ext: string }>;
}

function App() {
  const [url, setUrl] = useState('');
  const [videoData, setVideoData] = useState<RyoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // --- MODO DEBUG ACTIVADO ---
  useEffect(() => {
    console.log("🛠️ Modo Debug: Herramientas de desarrollador habilitadas.");
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Error al pegar:', err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Extraer la URL básica del texto
    let cleanUrl = url.trim().split(/\s+/).find(part => part.includes('http'));
    
    if (!cleanUrl) {
      alert("Por favor, ingresa una URL válida.");
      return;
    }

    // 2. --- LIMPIEZA CRÍTICA PARA YOUTUBE ---
    if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
      try {
        const urlObj = new URL(cleanUrl);
        if (urlObj.searchParams.has('v')) {
          cleanUrl = `${urlObj.origin}${urlObj.pathname}?v=${urlObj.searchParams.get('v')}`;
        }
      } catch {
        // Eliminado 'err' para evitar el error de variable no usada
        console.warn("No se pudo simplificar la URL de YouTube, se enviará original.");
      }
    }

    setLoading(true);
    setVideoData(null); 

    try {
      const isYouTube = cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be');
      const endpoint = isYouTube ? '/api/youtube/info' : '/api/tiktok/info';
      
      const baseUrl = window.location.hostname === 'localhost' ? LOCAL_URL : RENDER_URL;

      console.log(`🚀 Enviando petición a: ${baseUrl}${endpoint}`);
      console.log(`📦 Body:`, { url: cleanUrl });

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error del servidor:", errorData);
        throw new Error(errorData.message || 'Error en el servidor');
      }
      
      const responseData = await response.json();
      console.log("✅ Datos recibidos:", responseData);
      
      if (responseData.success && responseData.data) {
        const info = responseData.data;
        
        const finalData: RyoData = {
          type: isYouTube ? 'youtube' : (info.type as TikTokType || 'video'),
          title: info.title || "Sin título",
          sanitizedTitle: info.sanitizedTitle || info.title || "Ryomixed_Media",
          author: info.author || "Creador",
          thumbnail: info.thumbnail || "",
          urls: info.urls || [],
          audioUrl: info.audioUrl,
          duration: info.duration,
          formats: info.formats
        };
        setVideoData(finalData);
      } else {
        throw new Error("El servidor no devolvió datos válidos.");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error de conexión con RyoMixed";
      alert(msg);
      console.error("🔴 Detalle completo del error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0f1a] text-white selection:bg-blue-500/30">
      <Nav onOpenAbout={() => setIsAboutOpen(true)} />
      
      <main className="flex-grow flex flex-col items-center px-4 pt-10 pb-10">
        <div className="w-full max-w-4xl text-center flex flex-col items-center">
          
          <div className="space-y-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
              <Sparkles className="w-3 h-3" /> Multi-Platform Support
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              Tus momentos, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
                en tus manos.
              </span>
            </h1>
          </div>

          <form onSubmit={handleSearch} className="w-full max-w-3xl group relative mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 rounded-[2.2rem] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            
            <div className="relative flex items-center bg-blue-950/20 backdrop-blur-md border border-white/5 rounded-[2rem] p-2 pr-3 shadow-2xl overflow-hidden">
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
              
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={handlePaste} 
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/10 text-blue-400 transition-all active:scale-95 group/btn"
                >
                  <ClipboardPaste className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Pegar</span>
                </button>

                <button 
                  type="submit" 
                  disabled={loading || !url} 
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-6 md:px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar'}
                </button>
              </div>
            </div>
          </form>

          <div className="w-full mt-4 flex justify-center pb-20">
            {videoData && (
              videoData.type === 'youtube' 
                ? <YouTubeFlow data={videoData} originalUrl={url} />
                : <TikTokFlow data={videoData as TikTokData} />
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