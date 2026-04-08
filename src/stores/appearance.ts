import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Font Size Scaling ────────────────────────────────────────────────────
export type FontSize = "small" | "medium" | "large";

export const FONT_SCALE: Record<FontSize, number> = {
  small: 0.88,
  medium: 1,
  large: 1.15,
};

// ── Color Themes ─────────────────────────────────────────────────────────
export type ColorTheme = "default" | "ole-miss";

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  accent: string;
  dark: string;
  bgSoft: string;
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
}

const BASE_COLORS = {
  bgSoft: "#F5F3F0",
  bgCard: "#FFFFFF",
  textPrimary: "#111318",
  textSecondary: "#2D3239",
  textMuted: "#5C6370",
  border: "#C8C3BC",
};

export const COLOR_THEMES: Record<ColorTheme, ThemeColors> = {
  default: {
    ...BASE_COLORS,
    primary: "#C41E3A",
    primaryHover: "#A5182F",
    primaryLight: "#FDF2F3",
    accent: "#C41E3A",
    dark: "#0F1419",
  },
  "ole-miss": {
    ...BASE_COLORS,
    primary: "#14213D",
    primaryHover: "#0D1628",
    primaryLight: "#E8EBF0",
    accent: "#CE1126",
    dark: "#14213D",
  },
};

// ── Store ────────────────────────────────────────────────────────────────
interface AppearanceState {
  fontSize: FontSize;
  colorTheme: ColorTheme;
  compact: boolean;

  setFontSize: (size: FontSize) => void;
  setColorTheme: (theme: ColorTheme) => void;
  setCompact: (compact: boolean) => void;

  // Computed helpers
  scale: (base: number) => number;
  colors: () => ThemeColors;
}

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set, get) => ({
      fontSize: "medium",
      colorTheme: "default",
      compact: false,

      setFontSize: (fontSize) => set({ fontSize }),
      setColorTheme: (colorTheme) => set({ colorTheme }),
      setCompact: (compact) => set({ compact }),

      scale: (base: number) => Math.round(base * FONT_SCALE[get().fontSize]),
      colors: () => COLOR_THEMES[get().colorTheme],
    }),
    {
      name: "ftw-appearance",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** Drop-in replacement for BRAND.colors that respects the selected theme */
export function useBrandColors(): ThemeColors {
  const colorTheme = useAppearanceStore((s) => s.colorTheme);
  return COLOR_THEMES[colorTheme];
}
