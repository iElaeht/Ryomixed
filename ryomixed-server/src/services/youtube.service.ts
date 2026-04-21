import { create } from "youtube-dl-exec";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

const rootPath = process.cwd();
const isProduction = process.env.NODE_ENV === 'production';
const cookiesPath = path.join(rootPath, "YOUTUBE_COOKIES.txt");

/**
 * SERVICIO DE YOUTUBE (@RyoMixed)
 * Motor encargado de la comunicación con yt-dlp y la gestión de FFmpeg.
 */
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

  /**
   * Sincroniza las cookies desde las variables de entorno (ENV) al sistema de archivos.
   * Esto permite que YouTube no nos bloquee en servidores como Railway.
   */
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
      console.log("🍪 [YouTube]: Usando archivo cookies físico existente.");
    }
  }

  /**
   * Configura la ruta del binario FFmpeg.
   * En producción, apunta a la carpeta /bin donde Ryomixed instala sus herramientas.
   */
  private setupFFmpeg() {
    const isWin = process.platform === "win32";
    if (isProduction) {
      // Ruta absoluta para los binarios descargados en Railway
      this.ffmpegPath = path.join(rootPath, "bin", isWin ? "ffmpeg.exe" : "ffmpeg"); 
      console.log(`🚀 [System]: FFmpeg (Production) configurado en: ${this.ffmpegPath}`);
    } else {
      try {
        // En local, intentamos detectar si FFmpeg está en el PATH del sistema
        this.ffmpegPath = execSync(isWin ? "where ffmpeg" : "which ffmpeg")
          .toString().trim().split("\r\n")[0];
        console.log(`🚀 [System]: FFmpeg detectado en: ${this.ffmpegPath}`);
      } catch (e) {
        console.warn("⚠️ [System]: FFmpeg no encontrado localmente.");
      }
    }
  }

  /**
   * Inicializa el ejecutable de yt-dlp desde node_modules.
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

  /**
   * Limpia el título del video de caracteres especiales para evitar errores en el sistema de archivos.
   */
  private sanitize(title: string): string {
    const safeTitle = title || "video_ryomixed";
    return safeTitle.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_") || "video";
  }

  /**
   * Extrae la información básica y los formatos disponibles del video.
   */
  async getInfo(url: string) {
    if (!url) throw new Error("URL no proporcionada");
    const cleanUrl = url.trim();

    console.log(`\n--- 🔍 NUEVA SOLICITUD DE EXTRACCIÓN ---`);
    console.log(`🔗 URL: ${cleanUrl}`);

    const options: any = {
      jsRuntimes: "node", // Necesario para descifrar firmas de YouTube
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

      console.log(`✅ Título: ${rawTitle}`);
      console.log(`---------------------------------------\n`);

      // Filtramos y ordenamos los formatos MP4 disponibles
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

  /**
   * Ejecuta el proceso de descarga. 
   * Si es MP3, hace streaming directo. Si es Video, procesa y luego envía.
   */
  async execDownload(url: string, formatId: string, res: any) {
    const cleanUrl = url.trim();
    const tempFileName = `ryo_tmp_${Date.now()}.mp4`;
    const tempPath = path.join(rootPath, tempFileName);

    console.log(`\n📥 [DESCARGA INICIADA]`);
    console.log(`   🆔 Formato: ${formatId}`);
    console.log(`   📂 Archivo: ${tempFileName}`);

    const options: any = {
      noCheckCertificates: true,
      noPlaylist: true,
      ffmpegLocation: this.ffmpegPath,
      jsRuntimes: "node",
    };

    if (fs.existsSync(cookiesPath)) options.cookies = cookiesPath;

    // --- CASO MP3 (Streaming directo) ---
    if (formatId === 'mp3') {
      console.log(`   🎵 Extrayendo audio MP3...`);
      options.output = '-'; // Salida a stdout
      options.extractAudio = true;
      options.audioFormat = 'mp3';
      options.format = 'bestaudio/best';
      
      const subprocess = this.ytdl.exec(cleanUrl, options);
      if (subprocess.stdout) subprocess.stdout.pipe(res);
      
      subprocess.on('close', () => {
        console.log(`✅ [Stream]: Audio enviado con éxito.\n`);
      });
      return subprocess; // Retornamos para permitir control desde el Controller
    } 
    // --- CASO VIDEO (Descarga, Mezcla y Envío) ---
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
          
          // Limpieza post-envío
          if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
            console.log(`🧹 [Limpiador]: Temporal borrado.\n`);
          }
        });

        // En este caso el subprocess ya terminó, pero retornamos algo compatible
        return { kill: () => {} }; 
      } catch (error: any) {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        console.error(`\n🔴 [YouTube Exec Error]: ${error.message}\n`);
        throw error;
      }
    }
  }
}