import { Request, Response } from 'express';
import { InstagramService } from '../services/instagram.service.js';
import https from 'https';
import http from 'http';

const instagramService = new InstagramService();

/**
 * CONTROLADOR DE INSTAGRAM (@RyoMixed)
 * Incluye lógica de extracción y un proxy avanzado para evitar bloqueos de CDN.
 */
export class InstagramController {
  
  /**
   * Obtiene la información del Reel, Post o Carrusel.
   */
  async getInfo(req: Request, res: Response) {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: "URL requerida" });

    try {
      const info = await instagramService.getInfo(url);
      return res.json({ success: true, data: info });
    } catch (error: any) {
      console.error(`❌ [InstagramController GetInfo]: ${error.message}`);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Procesa la descarga directa canalizando el stream.
   */
  async download(req: Request, res: Response) {
    const { url, title, type } = req.query;

    if (!url) return res.status(400).send("Falta URL de descarga");

    try {
      // Delegamos el procesamiento pesado al Service
      await instagramService.execDownload(
        url as string, 
        res, 
        (title as string) || `RyoMixed_${Date.now()}`,
        (type as string) || 'video'
      );
    } catch (error: any) {
      console.error("❌ [InstagramController Download]:", error.message);
      if (!res.headersSent) {
        res.status(500).send("No se pudo procesar la descarga de Instagram");
      }
    }
  }

  /**
   * PROXY BLINDADO PARA IMÁGENES
   * Resuelve el error 403 Forbidden simulando cabeceras de navegador real.
   */
  async proxyImage(req: Request, res: Response) {
    const { url } = req.query;
    if (!url) return res.status(400).send("URL de imagen requerida");

    try {
      const decodedUrl = decodeURIComponent(url as string);
      const protocolHandler = decodedUrl.startsWith('https') ? https : http;

      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          'Referer': 'https://www.instagram.com/',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        },
        timeout: 15000 
      };

      protocolHandler.get(decodedUrl, options, (proxyRes) => {
        // Manejo automático de redirecciones (Muy común en CDNs de Meta)
        if (proxyRes.statusCode && proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
          req.query.url = proxyRes.headers.location;
          return this.proxyImage(req, res);
        }

        if (proxyRes.statusCode === 200) {
          // Transferimos las cabeceras de imagen para que el navegador la renderice bien
          res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/jpeg');
          res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 día de caché
          proxyRes.pipe(res);
        } else {
          console.error(`⚠️ [Proxy]: Instagram rechazó la petición (${proxyRes.statusCode}).`);
          res.status(proxyRes.statusCode || 403).send("Acceso denegado");
        }
      }).on('error', (err) => {
        console.error("❌ [Proxy Error]:", err.message);
        if (!res.headersSent) res.status(500).send("Error de red en Proxy");
      });

    } catch (error) {
      if (!res.headersSent) res.status(500).send("Error interno en el servidor");
    }
  }
}