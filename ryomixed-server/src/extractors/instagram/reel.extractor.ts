import { create } from "youtube-dl-exec";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, "../../../");

const isWin = process.platform === "win32";

/**
 * CONFIGURACIÓN DE RUTAS
 * En Railway (Linux) usamos /tmp porque tenemos permisos de escritura garantizados.
 */
const binPath = path.join(rootPath, "node_modules", "youtube-dl-exec", "bin", isWin ? "yt-dlp.exe" : "yt-dlp");
const cookiesPath = isWin 
    ? path.join(rootPath, "INSTAGRAM_COOKIES.txt") 
    : path.join("/tmp", "ig_cookies.txt");

const ytdl = create(binPath);

/**
 * @function extractInstagramVideo
 * @description Extractor de alta fidelidad para Reels y Posts de Instagram.
 */
export const extractInstagramVideo = async (url: string) => {
    const cleanUrl = url.trim().split('?')[0];

    // --- 1. SINCRONIZACIÓN DE COOKIES (El corazón del Bypass en Railway) ---
    if (!isWin) {
        try {
            const envCookies = process.env.INSTAGRAM_COOKIES;
            if (envCookies) {
                // Escribimos el archivo en /tmp solo si no existe o para actualizarlo
                fs.writeFileSync(cookiesPath, envCookies);
                console.log("🍪 [Instagram]: Cookies sincronizadas en /tmp desde Railway ENV");
            } else {
                console.warn("⚠️ [Instagram]: No se encontró la variable INSTAGRAM_COOKIES en ENV");
            }
        } catch (err) {
            console.error("🔴 [Cookies Error]: No se pudo crear el archivo de cookies:", err.message);
        }
    }

    // --- 2. CONFIGURACIÓN DE OPCIONES ---
    const options: any = {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        ignoreErrors: true,
        noPlaylist: true,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        addHeader: ['Referer:https://www.instagram.com/'],
    };

    // Si el archivo de cookies existe (sea local o en /tmp), lo inyectamos
    if (fs.existsSync(cookiesPath)) {
        options.cookies = cookiesPath;
    }

    try {
        console.log(`🎥 [yt-dlp]: Extrayendo metadatos de Reel -> ${cleanUrl}`);
        const info: any = await ytdl(cleanUrl, options);

        if (!info || (!info.url && !info.entries)) {
            throw new Error("Instagram no devolvió datos válidos (Posible bloqueo o Link inválido).");
        }

        const rawEntries = info.entries || info.requested_entries || [info];
        const durationInSeconds = info.duration || 0;

        // --- 3. SANITIZACIÓN DEL TÍTULO ---
        let rawTitle = info.description?.split('\n')[0] || info.title || "";
        let sanitizedForFile = rawTitle
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") 
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '_')            
            .substring(0, 45) || `ig_${info.id}`;

        // --- 4. MAPEO DE MEDIOS ---
        const media = rawEntries.map((entry: any, index: number) => {
            const isVideo = entry.vcodec !== 'none' || (entry.ext === 'mp4') || entry.protocol === 'https';
            const suffix = rawEntries.length > 1 ? `_${index + 1}` : '';
            
            let bestUrl = entry.url;

            // Si es video, intentamos buscar el formato mp4 con mejor calidad que tenga audio+video
            if (entry.formats && isVideo) {
                const bestFormat = [...entry.formats].reverse().find((f: any) => 
                    f.ext === 'mp4' && f.vcodec !== 'none' && f.acodec !== 'none'
                );
                if (bestFormat) bestUrl = bestFormat.url;
            }

            return {
                url: bestUrl,
                type: isVideo ? 'video' : 'image',
                ext: isVideo ? 'mp4' : 'jpg',
                filename: `${sanitizedForFile}${suffix}`, 
                thumbnail: entry.thumbnail || info.thumbnail,
                duration: entry.duration || durationInSeconds 
            };
        });

        return {
            id: info.id,
            title: rawTitle || `Instagram Content ${info.id}`,
            thumbnail: info.thumbnail,
            author: info.uploader || info.uploader_id || "Instagram_User",
            sanitizedTitle: sanitizedForFile,
            duration: durationInSeconds,
            media: media,
            type: media.length > 1 ? 'carousel' : (media[0].type === 'video' ? 'video' : 'photo')
        };

    } catch (error: any) {
        console.error("🔴 [Reel Extractor Error]:", error.message);
        throw error;
    }
};