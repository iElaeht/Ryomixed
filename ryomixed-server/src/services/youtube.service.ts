import { create } from "youtube-dl-exec";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

const rootPath = process.cwd();
const isProduction = process.env.NODE_ENV === 'production';
const cookiesPath = path.join(rootPath, "YOUTUBE_COOKIES.txt");

export class YouTubeService {
  private ffmpegPath: string | undefined;
  private ytdl: any;

  constructor() {
    console.log(`\n--- 📺 RyoStyle YouTube Engine ---`);
    this.syncCookiesFromEnv(); 
    this.setupFFmpeg();
    this.setupYtdl();
    console.log(`----------------------------------\n`);
  }

  private syncCookiesFromEnv() {
    const youtubeCookies = process.env.YOUTUBE_COOKIES;
    if (youtubeCookies && youtubeCookies.trim().length > 0) {
      try {
        fs.writeFileSync(cookiesPath, youtubeCookies.trim());
        console.log("🍪 [YouTube]: Cookies sincronizadas desde ENV.");
      } catch (error) {
        console.error("❌ [YouTube]: Error escribiendo cookies:", error);
      }
    } else if (fs.existsSync(cookiesPath)) {
      console.log("🍪 [YouTube]: Usando archivo cookies físico.");
    }
  }

  private setupFFmpeg() {
    const isWin = process.platform === "win32";
    if (isProduction) {
      this.ffmpegPath = "ffmpeg"; 
      console.log(`🚀 [System]: FFmpeg (Production) configurado.`);
    } else {
      try {
        this.ffmpegPath = execSync(isWin ? "where ffmpeg" : "which ffmpeg")
          .toString().trim().split("\r\n")[0];
        console.log(`🚀 [System]: FFmpeg detectado en: ${this.ffmpegPath}`);
      } catch (e) {
        console.warn("⚠️ [System]: FFmpeg no encontrado localmente.");
      }
    }
  }

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
    const cleanUrl = url.trim();

    // --- SEPARACIÓN VISUAL PARA NUEVA PETICIÓN ---
    console.log(`\n--- 🔍 NUEVA SOLICITUD DE EXTRACCIÓN ---`);
    console.log(`🔗 URL: ${cleanUrl}`);

    const options: any = {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noPlaylist: true,
      addHeader: ["Accept-Language: es-ES,es;q=0.9"],
    };

    if (fs.existsSync(cookiesPath)) {
      options.cookies = cookiesPath;
    }

    try {
      const output: any = await this.ytdl(cleanUrl, options);
      const rawTitle = output.title || "YouTube Video";

      // Log con check de éxito y espacio
      console.log(`✅ Título: ${rawTitle}`);
      console.log(`---------------------------------------\n`);

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
        platform: "youtube",
        title: rawTitle,
        sanitizedTitle: this.sanitize(rawTitle),
        author: output.uploader || "YouTube Artist",
        thumbnail: output.thumbnail || "",
        duration: Number(output.duration || 0),
        formats: formats,
      };
    } catch (error: any) {
      console.error(`\n🔴 [YouTube Error]: ${error.message}\n`);
      if (error.message.includes("confirm you are not a bot")) {
        throw new Error("Detección de bot: Actualiza las Cookies.");
      }
      throw new Error("Error al analizar el contenido.");
    }
  }

  async execDownload(url: string, formatId: string, res: any) {
    const cleanUrl = url.trim();
    const tempFileName = `ryo_tmp_${Date.now()}.mp4`;
    const tempPath = path.join(rootPath, tempFileName);

    // --- LOG DE DESCARGA DETALLADO ---
    console.log(`\n📥 [DESCARGA INICIADA]`);
    console.log(`   🆔 Formato: ${formatId}`);
    console.log(`   📂 Archivo: ${tempFileName}`);

    const options: any = {
      noCheckCertificates: true,
      noPlaylist: true,
      ffmpegLocation: this.ffmpegPath,
    };

    if (fs.existsSync(cookiesPath)) options.cookies = cookiesPath;

    if (formatId === 'mp3') {
      console.log(`   🎵 Extrayendo audio MP3...`);
      options.output = '-';
      options.extractAudio = true;
      options.audioFormat = 'mp3';
      options.format = 'bestaudio/best';
      
      const subprocess = this.ytdl.exec(cleanUrl, options);
      if (subprocess.stdout) subprocess.stdout.pipe(res);
      
      subprocess.on('close', () => {
        console.log(`✅ [Stream]: Audio enviado con éxito.\n`);
      });
      return subprocess;
    } 
    else {
      console.log(`   🎬 Procesando video y audio (FFmpeg)...`);
      options.output = tempPath;
      options.format = `${formatId}+bestaudio[ext=m4a]/bestvideo+bestaudio/best`;
      options.mergeOutputFormat = 'mp4';

      try {
        await this.ytdl(cleanUrl, options);
        console.log(`   📦 Mezcla terminada. Enviando al cliente...`);

        res.download(tempPath, (err: any) => {
          if (err) {
            console.error("   🔴 Error en el envío:", err.message);
          } else {
            console.log(`✅ [Descarga]: Completada con éxito.`);
          }
          
          if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
            console.log(`🧹 [Limpiador]: Temporal borrado.\n`);
          }
        });
      } catch (error: any) {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        console.error(`\n🔴 [YouTube Exec Error]: ${error.message}\n`);
        throw error;
      }
    }
  }
}