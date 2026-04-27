import path from 'path';
import fs from 'fs';
// @ts-ignore
import instagramGetUrl from 'instagram-url-direct';

/**
 * Especialista en Carruseles de Imágenes (PostImage)
 * Objetivo: Obtener imágenes puras sin bloqueos de firma.
 */
export const extractPostImage = async (url: string) => {
    const cleanUrl = url.split('?')[0];
    const postID = cleanUrl.split('/').filter(Boolean).pop() || `IMG_${Date.now()}`;
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

    console.log(`\n--- 📸 [PostImage Extractor]: Analizando imágenes de ${postID} ---`);

    try {
        const fetcher = (instagramGetUrl as any).instagramGetUrl || instagramGetUrl;
        const results = await fetcher(cleanUrl);

        if (!results || !results.url_list) {
            throw new Error("No se encontraron imágenes en este post.");
        }

        // 1. Filtramos: Solo nos quedamos con lo que NO sea video
        const imageItems = results.url_list.filter((link: string) => {
            const isVideo = link.includes('.mp4') || link.toLowerCase().includes('video');
            return !isVideo;
        });

        if (imageItems.length === 0) {
            return null; // Si no hay imágenes, este extractor le pasa la bola al de Video
        }

        // 2. Mapeo y limpieza de URLs para el Proxy
        const media = imageItems.map((link: string, idx: number) => {
            // Limpieza de parámetros de Instagram que suelen causar 403
            // Cortamos después de la extensión si es necesario o mantenemos el link base
            const encodedUrl = encodeURIComponent(link);

            return {
                url: link,
                type: 'image',
                index: idx,
                // El preview pasa SI o SI por nuestro proxy
                thumbnail: `${BACKEND_URL}/api/instagram/proxy/image?url=${encodedUrl}`,
                filename: `image_${postID}_${idx + 1}`
            };
        });

        console.log(`✅ [PostImage]: Detectadas ${media.length} imágenes.`);

        return {
            platform: 'instagram',
            type: media.length > 1 ? 'carousel' : 'photo',
            title: results.title || `Post de Instagram ${postID}`,
            media: media,
            originalUrl: cleanUrl
        };

    } catch (error) {
        console.error(`❌ [PostImage Error]:`, error);
        throw error;
    }
    
};