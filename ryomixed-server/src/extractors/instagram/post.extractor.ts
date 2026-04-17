import { exec } from 'child_process';
import { promisify } from 'util';
// @ts-ignore
import instagramGetUrl from 'instagram-url-direct';

const execPromise = promisify(exec);

/**
 * Sanitizador de nombres de archivo consistente con ReelExtractor
 */
const sanitizeForFile = (text: string, id: string): string => {
    if (!text || text.trim().length === 0) return `ig_${id}`;
    let clean = text
        .split('\n')[0]
        .replace(/#/g, '')
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") 
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .replace(/_{2,}/g, '_')
        .substring(0, 45);
    return clean || `ig_${id}`;
};

/**
 * Extractor híbrido: Usa una librería rápida para enlaces y yt-dlp para thumbnails.
 * Ideal para carruseles de fotos y posts rápidos.
 */
export const extractInstagramPost = async (url: string) => {
    const cleanUrl = url.split('?')[0];
    const postID = cleanUrl.split('/').filter(Boolean).pop() || `IG_${Date.now()}`;
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

    console.log(`🚀 [Híbrido]: Procesando Post ID: ${postID}`);

    let allMedia: any[] = [];
    let mainTitle = "";

    // PASO 1: Obtención rápida de enlaces directos
    try {
        const fetcher = (instagramGetUrl as any).instagramGetUrl || instagramGetUrl;
        const results = await fetcher(cleanUrl);
        
        if (results && results.url_list) {
            mainTitle = results.title || "";
            results.url_list.forEach((link: string) => {
                const isVideo = link.includes('.mp4') || link.toLowerCase().includes('video');
                allMedia.push({
                    url: link,
                    type: isVideo ? 'video' : 'image',
                    ext: isVideo ? 'mp4' : 'jpg',
                    source: 'fallback'
                });
            });
        }
    } catch (e) {
        console.warn(`⚠️ [Híbrido]: Ayudante rápido falló.`);
    }

    // PASO 2: Enriquecimiento con yt-dlp (Buscamos thumbnail oficial y duración)
    let ytDlpThumbnail = "";
    let ytDlpDuration = 0;

    if (allMedia.length > 0) {
        try {
            const cmd = `yt-dlp --dump-json --no-warnings --no-check-certificate "${cleanUrl}"`;
            const { stdout } = await execPromise(cmd);
            if (stdout) {
                const rawData = JSON.parse(stdout);
                ytDlpThumbnail = rawData.thumbnail || "";
                ytDlpDuration = rawData.duration || 0;
            }
        } catch (error) {
            console.log(`❌ [Híbrido]: yt-dlp bloqueado, usando thumbnails directas.`);
        }
    }

    if (allMedia.length === 0) throw new Error("No se pudo obtener el contenido del post.");

    const cleanTitle = sanitizeForFile(mainTitle, postID);
    const isCarousel = allMedia.length > 1;

    // PASO 3: Normalización y Proxy de imagen
    const finalMedia = allMedia.map((item, index) => {
        // Priorizamos la miniatura de yt-dlp si está disponible
        const thumbUrl = (index === 0 && ytDlpThumbnail) ? ytDlpThumbnail : item.url;
        const itemSuffix = isCarousel ? `_${index + 1}` : '';

        return {
            ...item,
            filename: `${cleanTitle}${itemSuffix}`,
            duration: ytDlpDuration,
            // Aplicamos el proxy para evitar el 403 en el frontend
            thumbnail: `${BACKEND_URL}/api/instagram/proxy/image?url=${encodeURIComponent(thumbUrl)}`
        };
    });

    return {
        platform: 'instagram',
        type: isCarousel ? 'carousel' : (finalMedia[0].type === 'video' ? 'video' : 'photo'),
        title: mainTitle || `Instagram Post ${postID}`,
        sanitizedTitle: cleanTitle,
        author: "Instagram User",
        thumbnail: finalMedia[0].thumbnail,
        media: finalMedia,
        duration: ytDlpDuration,
        originalUrl: cleanUrl
    };
};