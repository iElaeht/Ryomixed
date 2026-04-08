import ytdl from '@distube/ytdl-core';
import fs from 'fs';
import path from 'path';

export const getVideoInfo = async (url: string) => {
    try {
        // 1. Cargar las cookies desde el archivo JSON
        const cookiesPath = path.resolve(process.cwd(), 'cookies.json');
        const rawCookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf8'));

        // 2. Convertir el formato JSON de la extensión al formato que entiende ytdl
        const cookieString = rawCookies
            .map((c: any) => `${c.name}=${c.value}`)
            .join('; ');

        // 3. Hacer la petición con "identidad real"
        const info = await ytdl.getInfo(url, {
            requestOptions: {
                headers: {
                    'cookie': cookieString,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                    'Accept-Language': 'es-ES,es;q=0.9',
                }
            }
        });
        
        return {
            title: info.videoDetails.title,
            author: info.videoDetails.author.name,
            thumbnail: info.videoDetails.thumbnails.pop()?.url,
            duration: info.videoDetails.lengthSeconds,
        };
    } catch (error: any) {
        console.error("--- ERROR CON COOKIES ---");
        console.error(error.message);
        throw new Error("YouTube sigue bloqueando la petición. Verifica que no hayas cerrado sesión en el navegador.");
    }
};