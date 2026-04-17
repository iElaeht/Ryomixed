import { useState, useMemo, useEffect } from 'react';
import Nav from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import ModalAbout from './components/ui/ModalAbout';
import YouTubeFlow from './components/flows/Youtube/YouTubeFlow';
import TikTokFlow from './components/flows/Tiktok/TikTokFlow';
import InstagramReel from './components/Instagram/InstagramReel';
import InstagramPost from './components/Instagram/InstagramPost';
import { Search, Loader2, ClipboardPaste, X } from 'lucide-react';
import type { InstagramData } from './types/instagram';

const RENDER_URL = 'https://ryomixed-production.up.railway.app';
const LOCAL_URL = 'http://localhost:4000';

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
  type: 'video' | 'photos';
  title: string;
  sanitizedTitle: string; 
  author: string;
  thumbnail: string;
  urls: string[];
  audioUrl?: string;
}

type RyoData = (YouTubeData | TikTokData | InstagramData) & { platform?: string };

function App() {
  const [url, setUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState(''); 
  const [videoData, setVideoData] = useState<RyoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const titlePhrases = ["te inspira.", "te hace reír.", "quieres guardar.", "te mueve."];
  const placeholderPhrases = ["YouTube...", "TikTok...", "Instagram...", "un link..."];

  const [displayText, setDisplayText] = useState('');
  const [displayPlaceholder, setDisplayPlaceholder] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const currentTitle = titlePhrases[phraseIndex] || "";
    const currentPlaceholder = placeholderPhrases[phraseIndex] || "";
    
    if (!currentTitle) return;

    const handleTyping = () => {
      if (!isDeleting) {
        const nextLength = displayText.length + 1;
        setDisplayText(currentTitle.substring(0, nextLength));
        
        const pRatio = Math.ceil((nextLength / currentTitle.length) * currentPlaceholder.length);
        setDisplayPlaceholder(currentPlaceholder.substring(0, pRatio));
        
        setTypingSpeed(100);

        if (displayText === currentTitle) {
          setTimeout(() => setIsDeleting(true), 2000); 
        }
      } else {
        const nextLength = displayText.length - 1;
        setDisplayText(currentTitle.substring(0, nextLength));
        
        const pRatio = Math.ceil((nextLength / currentTitle.length) * currentPlaceholder.length);
        setDisplayPlaceholder(currentPlaceholder.substring(0, pRatio));
        
        setTypingSpeed(50);

        if (displayText === '') {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % titlePhrases.length);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIndex]);

  const isDevMode = false;
  useEffect(() => {
    if (isDevMode) return;
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', prevent);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.ctrlKey && e.key === 'u')) e.preventDefault();
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isDevMode]);

  const apiBaseUrl = useMemo(() => window.location.hostname === 'localhost' ? LOCAL_URL : RENDER_URL, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim().split(/\s+/).find(p => p.includes('http'));
    if (!cleanUrl) return;

    const isYouTube = cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be');
    const isInstagram = cleanUrl.includes('instagram.com');
    
    setLoading(true);
    setVideoData(null); 
    setActiveUrl(cleanUrl); 

    try {
      let endpoint = '/api/tiktok/info';
      if (isYouTube) endpoint = '/api/youtube/info';
      if (isInstagram) endpoint = '/api/instagram/info';

      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl })
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);
      const responseData = await response.json();
      
      if (responseData.success && responseData.data) {
        setVideoData({
          ...responseData.data,
          platform: isYouTube ? 'youtube' : isInstagram ? 'instagram' : 'tiktok'
        });
      } else {
        throw new Error(responseData.message || "Error al procesar.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0f1a] text-white selection:bg-blue-500/30 font-sans">
      <Nav onOpenAbout={() => setIsAboutOpen(true)} />
      
      <main className="flex-grow flex flex-col items-center px-4 pt-16 md:pt-24 pb-20">
        <div className="w-full max-w-4xl text-center">
          
          <div className="mb-14 h-[110px] sm:h-[150px] flex flex-col justify-center">
            <h1 className="text-4xl xs:text-5xl md:text-7xl font-black tracking-tighter leading-[1.1]">
              Descarga lo que <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 inline-block min-h-[1.2em]">
                {displayText}
                <span className="ml-1 border-r-4 border-blue-500 animate-pulse"></span>
              </span>
            </h1>
          </div>

          <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6 mb-10">
            <div className="group relative w-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 rounded-[1.5rem] sm:rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              
              <div className="relative flex items-center bg-blue-950/20 backdrop-blur-xl border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-1.5 sm:p-2 shadow-2xl">
                <input 
                  type="text"
                  placeholder={`Pega link de ${displayPlaceholder}`}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-grow bg-transparent border-none focus:ring-0 text-white py-4 sm:py-5 px-4 sm:px-6 outline-none text-sm sm:text-base transition-all placeholder:text-gray-500/60 placeholder:italic"
                />

                {url && (
                  <button type="button" onClick={() => setUrl('')} className="p-2 text-gray-500 hover:text-white transition-colors mr-1">
                    <X className="w-5 h-5" />
                  </button>
                )}

                <button 
                  type="button" 
                  onClick={async () => {
                    const text = await navigator.clipboard.readText();
                    setUrl(text);
                  }} 
                  className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all active:scale-95"
                >
                  <ClipboardPaste className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden xs:inline">Pegar</span>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !url.trim()} 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] flex justify-center items-center gap-3 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {loading ? 'Analizando...' : 'Buscar Contenido'}
            </button>
          </form>

          <div className="w-full flex justify-center pb-20 animate-in fade-in zoom-in-95 duration-500">
            {videoData && (
              <>
                {videoData.platform === 'youtube' && <YouTubeFlow data={videoData as YouTubeData} originalUrl={activeUrl} />}
                {videoData.platform === 'tiktok' && <TikTokFlow data={videoData as TikTokData} originalUrl={activeUrl} />}
                {videoData.platform === 'instagram' && (
                  (videoData as InstagramData).media.length > 1 ? (
                    <InstagramPost data={videoData as InstagramData} />
                  ) : (
                    videoData.type === 'video' ? <InstagramReel data={videoData as InstagramData} /> : <InstagramPost data={videoData as InstagramData} />
                  )
                )}
              </>
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