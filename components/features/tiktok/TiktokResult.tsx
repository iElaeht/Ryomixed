"use client";

import { useEffect, useMemo } from "react";
import TikTokVideoResult from "./TikTokVideoResult";
import TikTokGalleryResult from "./TikTokGalleryResult";

export interface TikTokContentData {
  platform?: "tiktok";
  type: "video" | "image";
  title: string;
  author: string;
  cover?: string | null;
  downloadUrl?: string | null;
  hdUrl?: string | null;
  images?: string[];
  musicUrl?: string | null;
  audioUrl?: string | null;
  duration?: number | string;
  videoSize?: number | string | null;
  [key: string]: unknown;
}

interface TikTokResultProps {
  data: TikTokContentData | null | undefined;
}

const DEFAULT_PAGE_TITLE = "Ryomixed | Oficial Web";

export default function TikTokResult({ data }: TikTokResultProps) {
  const isGallery = Boolean(
    data &&
      data.type === "image" &&
      Array.isArray(data.images) &&
      data.images.length > 0
  );

  const targetTitle = isGallery
    ? "TikTok Galería | Ryomixed"
    : "TikTok Video | Ryomixed";

  const contentKey = useMemo<string>(() => {
    if (!data) return "empty";
    if (isGallery && data.images?.length) {
      return `gallery-${String(data.images[0])}-${data.images.length}`;
    }
    return `video-${String(data.downloadUrl || data.title || "item")}`;
  }, [data, isGallery]);

  useEffect(() => {
    if (!data) return;

    const previousTitle = document.title || DEFAULT_PAGE_TITLE;
    document.title = targetTitle;

    return () => {
      document.title = previousTitle;
    };
  }, [data, targetTitle]);

  if (!data) {
    return null;
  }

  return (
    <section
      aria-label={
        isGallery
          ? "Resultado de galería de TikTok"
          : "Resultado de video de TikTok"
      }
      className="w-full"
    >
      {isGallery ? (
        <TikTokGalleryResult key={contentKey} data={data} />
      ) : (
        <TikTokVideoResult key={contentKey} data={data} />
      )}
    </section>
  );
}