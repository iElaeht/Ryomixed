import { create } from "youtube-dl-exec";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, "../../");
const cookiesPath = path.join(rootPath, "cookies.txt");

const isWin = process.platform === "win32";
const binPath = path.join(
  rootPath,
  "node_modules",
  "youtube-dl-exec",
  "bin",
  isWin ? "yt-dlp.exe" : "yt-dlp",
);

const ytdl = create(binPath);

export class YouTubeService {
  private ffmpegPath: string | undefined;

  constructor() {
    try {
      this.ffmpegPath = execSync(isWin ? "where ffmpeg" : "which ffmpeg")
        .toString().trim().split("\r\n")[0];
      console.log(`🚀 RyoStyle Engine: FFmpeg vinculado en ${this.ffmpegPath}`);
    } catch (e) {
      console.error("⚠️ FFmpeg no detectado.");
    }
  }

  private sanitize(title: string): string {
    return title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_");
  }

  /**
   * MANTENEMOS ESTA LÓGICA FIEL A LA QUE SÍ OBTIENE VISTA
   */
  async getInfo(url: string) {
    if (!url) throw new Error("URL no proporcionada");

    const options: any = {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noPlaylist: true,
      addHeader: ["Accept-Language: es-ES,es;q=0.9"],
    };

    if (fs.existsSync(cookiesPath)) options.cookies = cookiesPath;

    try {
      const output: any = await ytdl(url.trim(), options);
      
      // Mapeo que ya confirmamos que funciona para tu UI
      const formats = (output.formats || [])
        .filter((f: any) => f.vcodec !== "none" && f.ext === "mp4" && (f.format_note || f.height))
        .map((f: any) => ({
          id: f.format_id,
          label: f.format_note || `${f.height}p`,
          ext: f.ext,
          filesize: f.filesize ? `${(f.filesize / (1024 * 1024)).toFixed(1)}MB` : null,
          height: f.height || 0,
        }))
        .filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.label === v.label) === i)
        .sort((a: any, b: any) => b.height - a.height);

      return {
        type: "youtube",
        title: output.title,
        sanitizedTitle: this.sanitize(output.title || "video"),
        author: output.uploader || "Canal",
        thumbnail: output.thumbnail || "",
        duration: Number(output.duration || 0),
        formats: formats,
      };
    } catch (error: any) {
      console.error("🔴 Error en GetInfo:", error.message);
      throw new Error("No se pudo obtener la información.");
    }
  }

  /**
   * AQUÍ APLICAMOS EL "MODO BLINDADO" SOLO PARA LA DESCARGA
   */
  async execDownload(url: string, formatId: string, res: any) {
    // Nombre único para evitar el error de "un solo uso"
    const tempFileName = `ryo_download_${Date.now()}.mp4`;
    const tempPath = path.join(rootPath, tempFileName);

    const options: any = {
      noCheckCertificates: true,
      noPlaylist: true,
      ffmpegLocation: this.ffmpegPath,
    };

    if (fs.existsSync(cookiesPath)) options.cookies = cookiesPath;

    if (formatId === 'mp3') {
      options.output = '-';
      options.extractAudio = true;
      options.audioFormat = 'mp3';
      options.format = 'bestaudio/best';
      
      const subprocess = ytdl.exec(url.trim(), options);
      if (subprocess.stdout) subprocess.stdout.pipe(res);
      return subprocess;
    } else {
      // PROCESO DE VIDEO ROBUSTO
      options.output = tempPath;
      // Esta combinación asegura que FFmpeg pegue audio y video sin errores
      options.format = `${formatId}+bestaudio[ext=m4a]/bestvideo+bestaudio/best`;
      options.mergeOutputFormat = 'mp4';

      try {
        // Esperamos a que yt-dlp termine de crear el archivo físico
        await ytdl(url.trim(), options);

        // Una vez creado el archivo completo (con imagen y audio), lo enviamos
        res.download(tempPath, (err: any) => {
          if (err) console.error("🔴 Error enviando video:", err);
          
          // Borramos el temporal inmediatamente
          if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
            console.log("🧹 RyoMixed: Limpieza de temporal completada.");
          }
        });
      } catch (error: any) {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        throw error;
      }
    }
  }
}