import { create } from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, '../../');
const cookiesPath = path.join(rootPath, 'cookies.txt');

// --- CORRECCIÓN DE BINARIO (WINDOWS vs LINUX) ---
const isWindows = process.platform === 'win32';
const binName = isWindows ? 'yt-dlp.exe' : 'yt-dlp';
const binPath = path.join(rootPath, 'node_modules', 'youtube-dl-exec', 'bin', binName);

const ytdl = create(binPath);

export class YouTubeService {
    private sanitize(title: string): string {
        return title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
    }

    async getInfo(url: string) {
        const options: any = {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            noPlaylist: true,
            addHeader: [
                'Accept-Language: es-ES,es;q=0.9',
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ],
            // Forzar IPv4 es vital en Render para evitar bloqueos
            forceIpv4: true 
        };

        if (fs.existsSync(cookiesPath)) options.cookies = cookiesPath;

        try {
            const output: any = await ytdl(url, options);

            const formats = (output.formats || [])
                .filter((f: any) => f.vcodec !== 'none' && f.ext === 'mp4')
                .map((f: any) => ({
                    id: f.format_id,
                    label: f.format_note || f.resolution || 'Calidad estándar',
                    ext: f.ext
                }))
                .filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.label === v.label) === i);

            return {
                type: 'youtube',
                title: output.title,
                sanitizedTitle: this.sanitize(output.title || "RyoMixed_Video"),
                author: output.uploader || 'Canal',
                thumbnail: output.thumbnail || "",
                duration: output.duration || 0,
                formats: formats
            };
        } catch (error: any) {
            console.error("🔴 Error en yt-dlp:", error.message);
            throw error;
        }
    }

    // No olvides aplicar también el 'forceIpv4' en execDownload si sigue fallando
    async execDownload(url: string, formatId: string, res: any) {
        const options: any = {
            output: '-',
            noCheckCertificates: true,
            noPlaylist: true,
            forceIpv4: true, // Añadido para la descarga
            addHeader: ['user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36']
        };

        if (fs.existsSync(cookiesPath)) options.cookies = cookiesPath;

        if (formatId === 'mp3') {
            options.extractAudio = true;
            options.audioFormat = 'mp3';
            options.format = 'bestaudio/best';
        } else {
            options.format = `${formatId}+bestaudio[ext=m4a]/best`;
        }

        const subprocess = ytdl.exec(url, options);
        if (subprocess.stdout) subprocess.stdout.pipe(res);

        res.on('close', () => {
            if (!subprocess.killed) subprocess.kill();
        });
    }
}