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

export class YouTubeService {
    // Tu lógica de limpieza de títulos rescatada
    private sanitize(title: string): string {
        return title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
    }

    async getInfo(url: string) {
        const options: any = {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            noPlaylist: true,
            addHeader: ['Accept-Language: es-ES,es;q=0.9']
        };

        if (fs.existsSync(cookiesPath)) options.cookies = cookiesPath;

        const output: any = await ytdl(url, options);

        // Rescatamos y mejoramos tu lógica de filtrado de formatos
        const formats = (output.formats || [])
            .filter((f: any) => f.vcodec !== 'none' && f.ext === 'mp4')
            .map((f: any) => ({
                id: f.format_id,
                label: f.format_note || f.resolution || 'Calidad estándar',
                ext: f.ext
            }))
            // Eliminamos duplicados de etiquetas (ej: varias de 1080p)
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
    }

    // Lógica de descarga rescatada y blindada
    async execDownload(url: string, formatId: string, res: any) {
        const options: any = {
            output: '-',
            noCheckCertificates: true,
            noPlaylist: true,
        };

        if (fs.existsSync(cookiesPath)) options.cookies = cookiesPath;

        if (formatId === 'mp3') {
            options.extractAudio = true;
            options.audioFormat = 'mp3';
            options.format = 'bestaudio/best';
        } else {
            // "formatId" aquí es el ID que el usuario eligió en el frontend
            options.format = `${formatId}+bestaudio[ext=m4a]/best`;
        }

        const subprocess = ytdl.exec(url, options);
        if (subprocess.stdout) subprocess.stdout.pipe(res);

        res.on('close', () => {
            if (!subprocess.killed) subprocess.kill();
        });
    }
}