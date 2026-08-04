// app/page.tsx
"use client";

import { useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import TiktokResult from "@/components/result/tiktok/TiktokResult";
import Maintenance from '@/components/layout/Maintenance';
import { Search, Loader2, ClipboardPaste, X, Code2 } from 'lucide-react';

// --- PALANCAS DE CONFIGURACIÓN ---
const IS_MAINTENANCE = false; // Cambia a true para activar la pantalla de mantenimiento
const IS_DEV_MODE = false;     // false = Bloquea inspección (Producción) | true = Permite inspección (Desarrollo)

interface TikTokData {
  platform?: 'tiktok';
  type: "video" | "image";
  title: string;
  author: string;
  cover?: string;
  downloadUrl?: string;
  images?: string[];
  musicUrl?: string;
  [key: string]: unknown;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [videoData, setVideoData] = useState<TikTokData | null>(null);
  const [loading, setLoading] = useState(false);

  // --- Lógica de Bloqueo / Protección de DevTools ---
  useEffect(() => {
    if (IS_DEV_MODE) return; 

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // --- Lógica de Animación de Títulos y Placeholder para TikTok ---
  const titlePhrases = ["te inspira.", "te hace reír.", "quieres guardar.", "te mueve."];
  const placeholderPhrases = ["TikTok..."];

  const [displayText, setDisplayText] = useState('');
  const [displayPlaceholder, setDisplayPlaceholder] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const currentTitle = titlePhrases[phraseIndex] || "";
    const currentPlaceholder = placeholderPhrases[0] || "TikTok...";
    
    const handleTyping = () => {
      if (!isDeleting) {
        const nextLength = displayText.length + 1;
        setDisplayText(currentTitle.substring(0, nextLength));
        setDisplayPlaceholder(currentPlaceholder);
        setTypingSpeed(100);
        if (displayText === currentTitle) setTimeout(() => setIsDeleting(true), 2000);
      } else {
        const nextLength = displayText.length - 1;
        setDisplayText(currentTitle.substring(0, nextLength));
        setDisplayPlaceholder(currentPlaceholder);
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

  const apiBaseUrl = useMemo(() => '', []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim().split(/\s+/).find(p => p.includes('http'));
    if (!cleanUrl) return;

    const isTikTok = cleanUrl.includes('tiktok.com') || cleanUrl.includes('vm.tiktok.com') || cleanUrl.includes('vt.tiktok.com');
    
    if (!isTikTok) {
      alert("Por favor, ingresa un enlace válido de TikTok.");
      return;
    }

    setLoading(true);
    setVideoData(null); 

    try {
      const response = await fetch(`${apiBaseUrl}/api/tiktok`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || `Error del servidor: ${response.status}`);
      }
      
      if (responseData.success && responseData.data) {
        setVideoData({
          ...responseData.data,
          platform: 'tiktok'
        });
      } else {
        throw new Error(responseData.message || "Error al procesar el enlace.");
      }
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Error desconocido al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasteClick = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        throw new Error("Portapapeles no soportado.");
      }
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err: unknown) {
      console.warn("Clipboard Error: ", err);
      alert("Para pegar en el celular usando red local, mantén presionado el cuadro de texto y selecciona 'Pegar'.");
    }
  };

  if (IS_MAINTENANCE) {
    return <Maintenance />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#070a10] text-white selection:bg-[#fe2c55] selection:text-white font-sans no-scrollbar relative">
      
      {IS_DEV_MODE && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-1.5 px-4 text-center flex items-center justify-center gap-2 text-amber-400 text-[10px] font-black uppercase tracking-widest">
          <Code2 className="w-3.5 h-3.5" />
          <span>Modo Desarrollador Activo (Inspección Permitida)</span>
        </div>
      )}

      <Navbar onOpenAbout={() => {}} />
      
      <main className="flex-grow flex flex-col items-center px-4 pt-16 md:pt-24 pb-20">
        <div className="w-full max-w-4xl text-center">
          
          <div className="mb-14 h-[110px] sm:h-[150px] flex flex-col justify-center">
            <h1 className="text-4xl xs:text-5xl md:text-7xl font-black tracking-tighter leading-[1.1]">
              Descarga lo que <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fe2c55] via-[#ff4770] to-[#25f4ee] inline-block min-h-[1.2em]">
                {displayText}
                <span className="ml-1 border-r-4 border-[#25f4ee] animate-pulse"></span>
              </span>
            </h1>
          </div>

          <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6 mb-10">
            <div className="group relative w-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#fe2c55]/20 to-[#25f4ee]/20 rounded-[1.5rem] sm:rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              
              <div className="relative flex items-center bg-[#0b0f17] backdrop-blur-xl border border-white/10 rounded-[1.5rem] sm:rounded-[2rem] p-1.5 sm:p-2 shadow-2xl">
                <input 
                  type="text"
                  placeholder={`Pega link de ${displayPlaceholder}`}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-grow bg-transparent border-none focus:ring-0 text-white py-4 sm:py-5 px-4 sm:px-6 outline-none text-sm sm:text-base transition-all placeholder:text-gray-500/60 font-medium"
                />

                {url && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setUrl('');
                      setVideoData(null);
                    }} 
                    className="p-2 text-gray-500 hover:text-white transition-colors mr-1 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                <button 
                  type="button" 
                  onClick={handlePasteClick} 
                  className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#25f4ee]/10 text-[#25f4ee] hover:bg-[#25f4ee]/20 transition-all active:scale-95 cursor-pointer border border-[#25f4ee]/20"
                >
                  <ClipboardPaste className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden xs:inline">Pegar</span>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !url.trim()} 
              className="w-full sm:w-auto bg-gradient-to-r from-[#fe2c55] to-[#ff4770] hover:opacity-90 px-10 py-4 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] flex justify-center items-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-[#fe2c55]/25 cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {loading ? 'Analizando...' : 'Buscar Contenido'}
            </button>
          </form>

          {/* Renderizado de resultados */}
          <div className="w-full flex justify-center pb-20 animate-in fade-in zoom-in-95 duration-500">
            {videoData && (
              <div className="w-full">
                <TiktokResult data={videoData} />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}