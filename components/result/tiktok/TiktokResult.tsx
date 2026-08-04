// components/result/tiktok/TiktokResult.tsx
"use client";

import { useEffect } from 'react';
import TikTokVideoResult from "./TikTokVideoResult";
import TikTokGalleryResult from "./TikTokGalleryResult";

export interface TikTokContentData {
  platform?: 'tiktok';
  type: "video" | "image";
  title: string;
  author: string;
  cover?: string;
  downloadUrl?: string;
  images?: string[];
  musicUrl?: string;
  duration?: number | string;
  [key: string]: unknown;
}

interface TikTokResultProps {
  data: TikTokContentData;
}

export default function TikTokResult({ data }: TikTokResultProps) {
  
  // --- Control dinámico del título de la pestaña ---
  useEffect(() => {
    if (data.type === "image" && data.images && data.images.length > 0) {
      document.title = "TikTok Gallery | Ryomixed";
    } else {
      document.title = "TikTok Reel | Ryomixed";
    }
  }, [data]);

  // Selector inteligente: si es de tipo imagen y cuenta con un array de fotos válido
  if (data.type === "image" && data.images && data.images.length > 0) {
    return <TikTokGalleryResult data={data} />;
  }

  // Renderizado por defecto para videos individuales o Reels
  return <TikTokVideoResult data={data} />;
}