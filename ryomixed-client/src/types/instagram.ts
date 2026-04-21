export interface InstagramMedia {
  url: string;
  thumbnail: string;
  type: 'video' | 'image';
  ext: string;
  index?: number;
  filename: string;
  customFileName?: string; 
  duration?: number; 
}

export interface InstagramData {
  platform: 'instagram';
  type: 'video' | 'photo' | 'carousel';
  title: string;
  sanitizedTitle: string; 
  author: string;
  thumbnail: string;
  duration?: number;
  media: InstagramMedia[];
  originalUrl: string;
}