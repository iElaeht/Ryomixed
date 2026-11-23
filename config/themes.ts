export type ThemeId =
  | "dark"
  | "light"
  | "catpuccino"
  | "algodon-de-azucar"
  | "azul-violaceo-medianoche"
  | "vibraciones-lofi"
  | "manzana-mentolada"
  | "rojo-carmesi"
  | "resplandor-croma";

export type ThemeTone = "light" | "dark";

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  tone: ThemeTone;
  preview: {
    bg: string;
    surface: string;
    accent: string;
    secondary: string;
  };
}

export const DEFAULT_THEME: ThemeId = "dark";
export const THEME_STORAGE_KEY = "ryomixed-theme";

export const THEMES: ThemeConfig[] = [
  {
    id: "dark",
    name: "Dark",
    description: "Oscuro clásico con acento carmesí",
    tone: "dark",
    preview: {
      bg: "#0b0d10",
      surface: "#12161c",
      accent: "#ff2e55",
      secondary: "#2dd4bf",
    },
  },
  {
    id: "light",
    name: "Light",
    description: "Limpio y luminoso con acento azul",
    tone: "light",
    preview: {
      bg: "#f8fafc",
      surface: "#ffffff",
      accent: "#2563eb",
      secondary: "#0ea5e9",
    },
  },
  {
    id: "catpuccino",
    name: "Catpuccino",
    description: "Crema cálido con tonos café y canela",
    tone: "light",
    preview: {
      bg: "#f5efe6",
      surface: "#fbf7f2",
      accent: "#b47b56",
      secondary: "#8c5a3c",
    },
  },
  {
    id: "algodon-de-azucar",
    name: "Algodón de azúcar",
    description: "Pastel lila y rosa suave",
    tone: "light",
    preview: {
      bg: "#f7ecfb",
      surface: "#fdf7ff",
      accent: "#ec4899",
      secondary: "#a855f7",
    },
  },
  {
    id: "azul-violaceo-medianoche",
    name: "Azul violáceo medianoche",
    description: "Índigo profundo con acentos violeta",
    tone: "dark",
    preview: {
      bg: "#110f24",
      surface: "#181533",
      accent: "#8b5cf6",
      secondary: "#6366f1",
    },
  },
  {
    id: "vibraciones-lofi",
    name: "Vibraciones Lofi",
    description: "Crepúsculo malva con melocotón y lavanda",
    tone: "dark",
    preview: {
      bg: "#21172b",
      surface: "#2c1f3a",
      accent: "#e07a5f",
      secondary: "#c77dff",
    },
  },
  {
    id: "manzana-mentolada",
    name: "Manzana mentolada",
    description: "Menta fresca con acento esmeralda",
    tone: "light",
    preview: {
      bg: "#e5f6ec",
      surface: "#f4fbf7",
      accent: "#10b981",
      secondary: "#059669",
    },
  },
  {
    id: "rojo-carmesi",
    name: "Rojo carmesí",
    description: "Oscuro rubí con acento carmesí intenso",
    tone: "dark",
    preview: {
      bg: "#170b0e",
      surface: "#221015",
      accent: "#f43f5e",
      secondary: "#fb7185",
    },
  },
  {
    id: "resplandor-croma",
    name: "Resplandor croma",
    description: "Sombra iridiscente con destellos violeta y cian",
    tone: "dark",
    preview: {
      bg: "#141024",
      surface: "#1e1736",
      accent: "#c084fc",
      secondary: "#38bdf8",
    },
  },
];

export function isValidThemeId(value: string | null | undefined): value is ThemeId {
  if (!value) return false;
  return THEMES.some((theme) => theme.id === value);
}