export type Theme = {
  id: string;
  name: string;
  background: string;
  cardBackground: string;
  cardBorder: string;
  textColor: string;
  subTextColor: string;
  accent: string;
  borderRadius: number;
};

export const THEMES: Theme[] = [
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    background: '#F7F7F5',
    cardBackground: '#FFFFFF',
    cardBorder: '#E5E5E0',
    textColor: '#1A1A1A',
    subTextColor: '#6B6B6B',
    accent: '#2D6A4F',
    borderRadius: 20,
  },
  {
    id: 'dark-focus',
    name: 'Dark Focus',
    background: '#111318',
    cardBackground: '#1C1F26',
    cardBorder: '#2A2E38',
    textColor: '#F2F2F2',
    subTextColor: '#9AA0AC',
    accent: '#7DA3FF',
    borderRadius: 20,
  },
  {
    id: 'warm-paper',
    name: 'Warm Paper',
    background: '#FBF3E7',
    cardBackground: '#FFFBF3',
    cardBorder: '#EAD9BE',
    textColor: '#3B2C1A',
    subTextColor: '#8A7355',
    accent: '#C97B3D',
    borderRadius: 16,
  },
  {
    id: 'ocean',
    name: 'Ocean',
    background: '#E8F4F8',
    cardBackground: '#FFFFFF',
    cardBorder: '#C7E5EE',
    textColor: '#0B3954',
    subTextColor: '#4F7C93',
    accent: '#087E8B',
    borderRadius: 24,
  },
  {
    id: 'sunset',
    name: 'Sunset',
    background: '#FFF1EA',
    cardBackground: '#FFFFFF',
    cardBorder: '#FFD6C2',
    textColor: '#5A2A27',
    subTextColor: '#A56A5B',
    accent: '#E85D4C',
    borderRadius: 18,
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
