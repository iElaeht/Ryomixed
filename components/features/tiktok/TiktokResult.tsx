"use client";

import { useEffect } from "react";
import TikTokVideoResult from "./TikTokVideoResult";
import TikTokGalleryResult from "./TikTokGalleryResult";

export interface TikTokContentData {
  platform?: "tiktok";
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

const DEFAULT_PAGE_TITLE = "Ryomixed | Oficial Web";

export default function TikTokResult({ data }: TikTokResultProps) {
  const isGallery =
    data.type === "image" && Array.isArray(data.images) && data.images.length > 0;

  useEffect(() => {
    const previousTitle = document.title || DEFAULT_PAGE_TITLE;
    document.title = isGallery
      ? "TikTok Galería | Ryomixed"
      : "TikTok Video | Ryomixed";

    return () => {
      document.title = previousTitle === document.title
        ? DEFAULT_PAGE_TITLE
        : previousTitle;
    };
  }, [isGallery]);

  return (
    <section
      aria-label={isGallery ? "Resultado de galería de TikTok" : "Resultado de video de TikTok"}
      className="w-full"
    >
      {isGallery ? (
        <TikTokGalleryResult data={data} />
      ) : (
        <TikTokVideoResult data={data} />
      )}
    </section>
  );
}