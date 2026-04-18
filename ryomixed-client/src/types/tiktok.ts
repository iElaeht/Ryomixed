/**
 * TIPADO DE TIKTOK (@RyoMixed)
 * Define la estructura de datos para videos (Reels) y carruseles de fotos.
 */
export interface TikTokMedia {
  /** * 'video' para Reels individuales 
   * 'photos' para carruseles/galerías 
   */
  type: 'video' | 'photos';
  
  /** Título original o descripción del post */
  title: string;
  
  /** Título limpio y seguro para nombres de archivo */
  sanitizedTitle: string;
  
  /** Nombre o apodo del creador del contenido */
  author: string;
  
  /** URL de la imagen de portada o primera foto del carrusel */
  thumbnail: string;
  
  /** * Array de URLs de medios. 
   * Si es video: contiene un solo link (HD/No Watermark).
   * Si son fotos: contiene la lista de todas las imágenes.
   */
  urls: string[];
  
  /** URL del audio/música de fondo (opcional) */
  audioUrl?: string;

  /** * Duración total del video en segundos (opcional)
   * Se usa para mostrar el tiempo formateado en el frontend.
   */
  duration?: number; // ✅ AÑADIR ESTA LÍNEA
}