export const brand = {
  dark: '#1a1008',
  primary: '#b85c28',
  cream: '#fdf6ee',
  muted: '#a8937a',
  surface: '#f0e6d9',
  border: '#e8d9c5',
  card: '#ffffff',
} as const;

export const tabBar = {
  background: brand.dark,
  active: brand.primary,
  inactive: brand.muted,
  borderTop: '#2a1f12',
} as const;

export type BrandColor = keyof typeof brand;
