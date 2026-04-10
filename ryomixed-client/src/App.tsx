import { useState, useEffect } from 'react';
import Nav from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import ModalAbout from './components/ui/ModalAbout';
import YouTubeFlow from './components/YouTubeFlow';
import TikTokFlow from './components/TikTokFlow';
import { Search, Loader2, ClipboardPaste } from 'lucide-react';

// Interfaz alineada con la estructura del Backend
interface RyoData {
  type: 'video' | 'photos';
  title: string;
  sanitizedTitle: string;
  author: string;
  thumbnail: string;
  duration?: number;
  urls: string[];
  audioUrl?: string;
  formats?: Array<{ id: string; label: string; ext: string }>;
}

function App() {
  const [url, setUrl] = useState('');
  const [videoData, setVideoData] = useState<RyoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Seguridad: Bloqueo de inspección para proteger el proyecto AI Mangas
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
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
    
    // Limpieza de URL: extrae solo el enlace si hay texto extra
    const cleanUrl = url.trim().split(/\s+/).find(part => part.includes('http'));
    if (!cleanUrl) return;

    setLoading(true);
    setVideoData(null); // Reset visual para evitar persistencia de datos previos

    try {
      const isYouTube = cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be');
      const endpoint = isYouTube ? '/api/youtube/info' : '/api/tiktok/info';
      
      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el servidor');
      }
      
      const responseData = await response.json();
      
      // Verificación de la propiedad 'data' que viene del backend
      if (responseData.success && responseData.data) {
        const info = responseData.data;

        const finalData: RyoData = {
          type: info.type || 'video',
          title: info.title || "Sin título",
          sanitizedTitle: info.sanitizedTitle || info.title || "AI_Mangas_Media",
          author: info.author || "Desconocido",
          thumbnail: info.thumbnail || "",
          urls: info.urls || [],
          audioUrl: info.audioUrl,
          duration: info.duration,
          formats: info.formats
        };

        setVideoData(finalData);
      } else {
        throw new Error("No se pudo obtener información válida del enlace.");
      }

    } catch (error: unknown) {
      console.error("Search Error:", error);
      if (error instanceof Error) alert(error.message);
      else alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0f1a] text-white selection:bg-blue-500/30 transition-colors duration-500">
      
      <Nav onOpenAbout={() => setIsAboutOpen(true)} />

      <main className="flex-grow flex flex-col items-center px-4 pt-10 pb-10 md:pt-16 md:pb-20">
        <div className="w-full max-w-4xl text-center flex flex-col items-center">
          
          <div className="space-y-6 mb-10">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Tus momentos, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-cyan-300">
                en tus manos.
              </span>
            </h1>
          </div>

          <form onSubmit={handleSearch} className="w-full max-w-2xl relative group mb-8">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400/50 group-focus-within:text-blue-400 transition-colors">
              <Search className="w-6 h-6" />
            </div>
            
            <input 
              type="text"
              placeholder="Pega el link de YouTube o TikTok..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-blue-950/20 border border-blue-900/30 rounded-2xl py-5 px-6 pl-14 pr-[180px] text-white placeholder:text-blue-300/20 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all text-lg shadow-[0_0_30px_rgba(0,0,0,0.3)]"
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button 
                type="button"
                onClick={handlePaste}
                className="p-2.5 rounded-xl bg-blue-900/20 hover:bg-blue-900/40 text-blue-300/50 hover:text-blue-100 transition-all active:scale-95 border border-blue-800/20"
                title="Pegar enlace"
              >
                <ClipboardPaste className="w-5 h-5" />
              </button>

              <button 
                type="submit"
                disabled={loading || !url}
                className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 disabled:bg-gray-800 disabled:text-gray-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar'}
              </button>
            </div>
          </form>

          {/* Área de resultados: Renderiza el Flow correspondiente según la URL */}
          <div className="w-full mt-4 flex justify-center">
            {videoData && (
              url.toLowerCase().includes('youtube') || url.toLowerCase().includes('youtu.be')
                ? <YouTubeFlow data={videoData} originalUrl={url} />
                : <TikTokFlow data={videoData} />
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