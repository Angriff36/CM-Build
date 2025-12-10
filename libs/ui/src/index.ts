export const brandColors = {
  primary: '#f97316',
  primaryDark: '#c2410c',
  slate: '#0f172a',
  sand: '#f5f1eb'
} as const;

export type BrandColorToken = keyof typeof brandColors;

export const spacingScale = [0, 4, 8, 12, 16, 20, 24, 32];

export const radiusScale = {
  none: 0,
  sm: 2,
  md: 6,
  lg: 12
} as const;

export const fontStacks = {
  sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
};

export const tokensSummary = () => ({ brandColors, spacingScale, radiusScale, fontStacks });