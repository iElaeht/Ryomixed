import { create } from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, '../../');
const cookiesPath = path.join(rootPath, 'cookies.txt');
const binPath = path.join(rootPath, 'node_modules', 'youtube-dl-exec', 'bin', 'yt-dlp.exe');

const ytdl = create(binPath);

// Función auxiliar para limpiar el título del archivo
export const sanitizeTitle = (title: string): string => {
    return title
        .replace(/[^\w\s-]/g, '') // Quita caracteres especiales que Windows no permite
        .trim()
        .replace(/\s+/g, '_');    // Cambia espacios por guiones bajos
};

export const getVideoInfo = async (url: string) => {
    try {
        const options: any = {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            noPlaylist: true, // Corregido para evitar el crash
            addHeader: [
                'Accept-Language: es-ES,es;q=0.9',
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
            ],
        };

        if (fs.existsSync(cookiesPath)) options.cookies = cookiesPath;

        const output: any = await ytdl(url, options);
        
        // Detectamos si es TikTok o YouTube
        const isTikTok = url.includes('tiktok.com');

        // Extraemos calidades si es YouTube
        let formats: any[] = [];
        if (!isTikTok && output.formats) {
            // Filtramos solo formatos que tengan video y audio combinados o sean mp4 estándar
            // para evitar el bug de "solo audio" sin necesidad de FFmpeg complejo por ahora
            formats = output.formats
                .filter((f: any) => f.vcodec !== 'none' && f.ext === 'mp4')
                .map((f: any) => ({
                    id: f.format_id,
                    label: f.format_note || f.resolution || 'Calidad estándar',
                    ext: f.ext
                }))
                // Eliminamos duplicados de etiquetas (ej: varios 720p)
                .filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.label === v.label) === i);
        }

        console.log(`✅ Info extraída: ${output.title}`);

        return {
            title: output.title || "Video_RyoMixed",
            sanitizedTitle: sanitizeTitle(output.title || "Video_RyoMixed"),
            author: output.uploader || output.channel || 'Autor',
            thumbnail: output.thumbnail || (output.thumbnails && output.thumbnails[output.thumbnails.length - 1]?.url) || "",
            duration: output.duration || 0,
            formats: isTikTok ? [] : formats, // TikTok no necesita selector
            isTikTok
        };
    } catch (error: any) {
        console.error("❌ Error en getVideoInfo:", error.message);
        throw new Error(error.message.includes('403') ? "Error de Cookies (403)" : "Link no disponible");
    }
};

export const downloadStream = (url: string, format: string, res: any) => {
    const options: any = {
        output: '-', 
        noCheckCertificates: true,
        noWarnings: true,
        noPlaylist: true, 
    };

    if (fs.existsSync(cookiesPath)) options.cookies = cookiesPath;

    // Lógica de formatos mejorada
    if (format === 'mp3') {
        options.extractAudio = true;
        options.audioFormat = 'mp3';
        options.format = 'bestaudio/best';
    } else if (format === 'best_mp4') {
        // Opción automática para TikTok o MP4 rápido
        options.format = 'best[ext=mp4]/best';
    } else {
        // Si el usuario eligió una calidad específica del menú
        options.format = `${format}+bestaudio[ext=m4a]/best`;
    }

    const subprocess = ytdl.exec(url, options);

    if (subprocess.stdout) subprocess.stdout.pipe(res);

    subprocess.stderr?.on('data', (data) => {
        const log = data.toString();
        if (log.includes('ERROR')) console.error(`[Download Error]: ${log}`);
    });

    res.on('close', () => {
        if (!subprocess.killed) subprocess.kill();
    });

    return subprocess;
};