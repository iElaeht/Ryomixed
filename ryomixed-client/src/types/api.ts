// src/types/api.ts

/**
 * Representa la estructura base que devuelve tu backend 
 * para cualquier plataforma (YT, TikTok, IG).
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Estados útiles para controlar la UI (Spinners, errores, etc.)
 */
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Tipos de descarga permitidos en el sistema
 */
export type DownloadType = 'video' | 'audio' | 'photos';