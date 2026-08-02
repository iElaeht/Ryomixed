// ryomixed/app/page.tsx
import Link from "next/link";
import { Download, Sparkles, ArrowRight, Video, Youtube, Instagram } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-[#0b1120] min-h-screen text-white flex flex-col justify-between selection:bg-sky-500 selection:text-neutral-950">
      
      {/* 1. Navbar Superior con el botón al convertidor */}
      <header className="w-full border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-extrabold text-lg tracking-wide">
          <span className="bg-sky-500 text-neutral-950 p-1.5 rounded-lg">
            <Download size={20} />
          </span>
          <span>RyoMixed</span>
        </div>

        <Link
          href="/convert"
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-sky-500/20"
        >
          <span>Ir al Convertidor</span>
          <ArrowRight size={15} />
        </Link>
      </header>

      {/* 2. Contenido Principal / Mostrador de Información */}
      <main className="flex-grow flex items-center justify-center p-6 md:p-8">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6 animate-in fade-in duration-500">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sky-400 text-xs font-semibold">
            <Sparkles size={14} />
            <span>Versión 2.0 - Todo en uno (TikTok, YouTube, Instagram)</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-2xl leading-tight">
            Descarga tu contenido favorito sin límites y de forma{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
              Rápida
            </span>
          </h1>

          <p className="text-neutral-400 text-sm md:text-base max-w-xl">
            Bienvenido de nuevo a RyoMixed. Estamos rediseñando la plataforma desde cero, unificada directamente en la nube para procesar enlaces multimedia con la máxima eficiencia.
          </p>

          {/* Tarjetas de plataformas soportadas (Empezando por TikTok) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mt-6">
            <div className="flex flex-col items-center p-5 bg-white/[0.02] border border-white/10 rounded-2xl gap-2 hover:border-sky-500/40 transition-all">
              <Video className="text-sky-400 mb-1" size={28} />
              <h3 className="font-bold text-sm">TikTok</h3>
              <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-500/20">
                ¡Disponible ahora!
              </span>
            </div>

            <div className="flex flex-col items-center p-5 bg-white/[0.02] border border-white/10 rounded-2xl gap-2 opacity-60">
              <Youtube className="text-red-400 mb-1" size={28} />
              <h3 className="font-bold text-sm">YouTube</h3>
              <span className="text-[10px] text-neutral-400 font-semibold px-2 py-0.5 rounded-full bg-neutral-800/50 border border-neutral-700/20">
                Próximamente
              </span>
            </div>

            <div className="flex flex-col items-center p-5 bg-white/[0.02] border border-white/10 rounded-2xl gap-2 opacity-60">
              <Instagram className="text-pink-400 mb-1" size={28} />
              <h3 className="font-bold text-sm">Instagram</h3>
              <span className="text-[10px] text-neutral-400 font-semibold px-2 py-0.5 rounded-full bg-neutral-800/50 border border-neutral-700/20">
                Próximamente
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/convert"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-sky-500 hover:bg-sky-400 text-neutral-950 font-extrabold text-sm rounded-2xl transition-all shadow-xl shadow-sky-500/20 hover:scale-105"
            >
              <span>Comenzar a descargar</span>
              <ArrowRight size={18} />
            </Link>
          </div>

        </div>
      </main>

      {/* 3. Footer Inferior */}
      <footer className="w-full border-t border-white/10 px-6 py-6 text-center text-xs text-neutral-500 max-w-7xl mx-auto">
        <p>RyoMixed 2.0 • Diseñado para alto rendimiento en Vercel.</p>
      </footer>

    </div>
  );
}