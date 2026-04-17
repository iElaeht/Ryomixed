import { create } from "youtube-dl-exec";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, "../../");

const isProduction = process.env.NODE_ENV === 'production';
const cookiesPath = path.join(rootPath, "cookies.txt");
const instaCookiesPath = path.join(rootPath, "instagramCook.txt");

export class YouTubeService {
  private ffmpegPath: string | undefined;
  private ytdl: any;

  constructor() {
    this.syncCookiesFromEnv(); // <-- Nueva función para Railway
    this.setupFFmpeg();
    this.setupYtdl();
  }

  /**
   * Crea los archivos .txt físicamente si existen las variables en Railway.
   * Esto evita tener que subir los archivos al repositorio.
   */
  private syncCookiesFromEnv() {
    if (process.env.YOUTUBE_COOKIES) {
      fs.writeFileSync(cookiesPath, process.env.YOUTUBE_COOKIES);
      console.log("🍪 [RyoMixed]: Archivo cookies.txt generado desde Env Var.");
    }
    if (process.env.INSTAGRAM_COOKIES) {
      fs.writeFileSync(instaCookiesPath, process.env.INSTAGRAM_COOKIES);
      console.log("📸 [RyoMixed]: Archivo instagramCook.txt generado desde Env Var.");
    }
  }

  /**
   * Localiza el binario de FFmpeg según el sistema operativo y entorno.
   */
  private setupFFmpeg() {
    const isWin = process.platform === "win32";
    if (isProduction) {
      // Ruta estándar en Railway según tu setup
      this.ffmpegPath = path.join(rootPath, "bin", "ffmpeg");
      console.log(`🚀 RyoStyle Engine: FFmpeg (Prod) detectado.`);
    } else {
      try {
        this.ffmpegPath = execSync(isWin ? "where ffmpeg" : "which ffmpeg")
          .toString().trim().split("\r\n")[0];
        console.log(`🚀 RyoStyle Engine: FFmpeg (Local) detectado.`);
      } catch (e) {
        console.warn("⚠️ [YouTubeService]: FFmpeg no encontrado localmente.");
      }
    }
  }

  /**
   * Inicializa yt-dlp vinculando el binario correcto desde node_modules.
   */
  private setupYtdl() {
    const isWin = process.platform === "win32";
    const binPath = path.join(
      rootPath,
      "node_modules",
      "youtube-dl-exec",
      "bin",
      isWin ? "yt-dlp.exe" : "yt-dlp",
    );
    this.ytdl = create(binPath);
  }

  private sanitize(title: string): string {
    const safeTitle = title || "video_ryomixed";
    return safeTitle.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_") || "video";
  }

  async getInfo(url: string) {
    if (!url) throw new Error("URL no proporcionada");

    const options: any = {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noPlaylist: true,
      addHeader: ["Accept-Language: es-ES,es;q=0.9"],
    };

    if (fs.existsSync(cookiesPath)) {
      options.cookies = cookiesPath;
      console.log("🍪 [YouTube]: Usando cookies.txt");
    }

    try {
      const output: any = await this.ytdl(url.trim(), options);
      const rawTitle = output.title || "YouTube Video";

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
        title: rawTitle,
        sanitizedTitle: this.sanitize(rawTitle),
        author: output.uploader || "YouTube Artist",
        thumbnail: output.thumbnail || "",
        duration: Number(output.duration || 0),
        formats: formats,
      };
    } catch (error: any) {
      console.error("🔴 [YouTube GetInfo Error]:", error.message);
      if (error.message.includes("confirm you are not a bot")) {
        throw new Error("Detección de bot: Actualiza la variable YOUTUBE_COOKIES en Railway.");
      }
      throw new Error("No se pudo obtener información del video.");
    }
  }

  async execDownload(url: string, formatId: string, res: any) {
    const tempFileName = `ryo_tmp_${Date.now()}.mp4`;
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
      
      const subprocess = this.ytdl.exec(url.trim(), options);
      if (subprocess.stdout) subprocess.stdout.pipe(res);
      return subprocess;
    } 
    else {
      options.output = tempPath;
      options.format = `${formatId}+bestaudio[ext=m4a]/bestvideo+bestaudio/best`;
      options.mergeOutputFormat = 'mp4';

      try {
        await this.ytdl(url.trim(), options);

        res.download(tempPath, (err: any) => {
          if (err) console.error("🔴 Error en descarga:", err);
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        });
      } catch (error: any) {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        console.error("🔴 [YouTube Exec Error]:", error.message);
        throw error;
      }
    }
  }
}