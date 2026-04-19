import { create } from "youtube-dl-exec";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, "../../../");

const isWin = process.platform === "win32";
const binPath = path.join(rootPath, "node_modules", "youtube-dl-exec", "bin", isWin ? "yt-dlp.exe" : "yt-dlp");
const cookiesPath = path.join(rootPath, "INSTAGRAM_COOKIES.txt");

const ytdl = create(binPath);

/**
 * Extractor especializado en Reels y contenido individual mediante yt-dlp.
 * Alta fidelidad en duración y calidad de video.
 */
export const extractInstagramVideo = async (url: string) => {
  const cleanUrl = url.trim().split('?')[0];

  const options: any = {
    dumpSingleJson: true,
    noCheckCertificates: true,
    noWarnings: true,
    ignoreErrors: true,
    noPlaylist: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    addHeader: ['Referer:https://www.instagram.com/'],
  };

  if (fs.existsSync(cookiesPath)) options.cookies = cookiesPath;

  try {
    console.log(`🎥 [yt-dlp]: Extrayendo metadatos de Reel -> ${cleanUrl}`);
    const info: any = await ytdl(cleanUrl, options);

    if (!info) throw new Error("Instagram no devolvió datos válidos.");

    const rawEntries = info.entries || info.requested_entries || [info];
    const durationInSeconds = info.duration || 0;

    // Sanitización de título compartida
    let rawTitle = info.description?.split('\n')[0] || info.title || "";
    let sanitizedForFile = rawTitle
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") 
      .replace(/#/g, '')
      .replace(/\s+/g, '_')            
      .replace(/[^a-zA-Z0-9_]/g, '')   
      .substring(0, 45) || `ig_${info.id}`;

    const media = rawEntries.map((entry: any, index: number) => {
      const isVideo = entry.vcodec !== 'none' || (entry.ext === 'mp4');
      const suffix = rawEntries.length > 1 ? `_${index + 1}` : '';
      
      let bestUrl = entry.url;
      // Buscamos el formato mp4 que contenga audio y video (no dash separado)
      if (entry.formats && isVideo) {
          const bestFormat = entry.formats.reverse().find((f: any) => 
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