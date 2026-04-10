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

export const sanitizeTitle = (title: string): string => {
    return title
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '_');
};

export const getVideoInfo = async (url: string) => {
    try {
        const options: any = {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            noPlaylist: true,
            addHeader: [
                'Accept-Language: es-ES,es;q=0.9',
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
            ],
        };

        if (fs.existsSync(cookiesPath)) options.cookies = cookiesPath;

        const output: any = await ytdl(url, options);
        const isTikTok = url.includes('tiktok.com');

        let formats: any[] = [];
        if (!isTikTok && output.formats) {
            formats = output.formats
                .filter((f: any) => f.vcodec !== 'none' && f.ext === 'mp4')
                .map((f: any) => ({
                    id: f.format_id,
                    label: f.format_note || f.resolution || 'Calidad estándar',
                    ext: f.ext
                }))
                .filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.label === v.label) === i);
        }

        console.log(`✅ Info extraída: ${output.title}`);

        // Retornamos el objeto EXACTO que pide RyoData en el frontend
        return {
            type: 'video', 
            title: output.title || "Video_RyoMixed",
            sanitizedTitle: sanitizeTitle(output.title || "Video_RyoMixed"),
            author: output.uploader || output.channel || 'Autor',
            thumbnail: output.thumbnail || (output.thumbnails && output.thumbnails[output.thumbnails.length - 1]?.url) || "",
            duration: output.duration || 0,
            formats: isTikTok ? [] : formats,
            urls: [url] 
        };
    } catch (error: any) {
        console.error("❌ Error en getVideoInfo:", error.message);
        throw new Error("No se pudo obtener la información del video.");
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

    if (format === 'mp3') {
        options.extractAudio = true;
        options.audioFormat = 'mp3';
        options.format = 'bestaudio/best';
    } else if (format === 'best_mp4') {
        options.format = 'best[ext=mp4]/best';
    } else {
        options.format = `${format}+bestaudio[ext=m4a]/best`;
    }

    const subprocess = ytdl.exec(url, options);
    if (subprocess.stdout) subprocess.stdout.pipe(res);

    res.on('close', () => {
        if (!subprocess.killed) subprocess.kill();
    });

    return subprocess;
};