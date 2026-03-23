import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#111318',
    background: '#FDFBF8',
    tint: '#C41E3A',
    icon: '#687076',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#C41E3A',
    card: '#FFFFFF',
    border: '#E5E1DB',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0F1419',
    tint: '#EC6B76',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#EC6B76',
    card: '#1A1D24',
    border: '#2A2D34',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
