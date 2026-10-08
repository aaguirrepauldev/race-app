// Sistema de diseño: paleta pastel, tipografía y medidas de la interfaz.

export const pastel = {
  skyTop: '#BFE3F5',
  skyBottom: '#FDE2EC',
  sun: '#FFF1B8',
  sunGlow: '#FFF8DC',
  cloud: '#FFFFFF',
  hillFar: '#D9D2F3',
  hillMid: '#C4EAD2',
  trunk: '#DCC0A3',
  ground: '#A8E0BB',
  groundDeep: '#8FD1A6',
  road: '#CEC8E6',
  roadEdge: '#ADA6D1',
  stripe: '#FFFFFF',
  pink: '#F7A8C4',
  blue: '#A8D8F7',
  yellow: '#FBE29A',
  mint: '#A8ECD0',
  lilac: '#CDB4F6',
  peach: '#FFC9A8',
};

export const colors = {
  text: '#5B5480',
  textMuted: '#8A84AD',
  surface: 'rgba(255, 255, 255, 0.88)',
  white: '#FFFFFF',
  primary: '#F48FB1',
  primaryDeep: '#D9759A',
};

// Colores de auto para elegir en el menú.
// Ojo: no llamar `value` al campo; el plugin de Babel de Reanimated confunde `x.value`
// dentro de un `style` con un shared value e inyecta código que rompe en iOS/Android.
export const carColors = [
  { name: 'Rosa', hex: pastel.pink },
  { name: 'Celeste', hex: pastel.blue },
  { name: 'Amarillo', hex: pastel.yellow },
  { name: 'Menta', hex: pastel.mint },
  { name: 'Lila', hex: pastel.lilac },
];

export const treeColors = [pastel.pink, '#BDE7C9', pastel.yellow, '#C9D8F7', pastel.peach];

export const fonts = {
  regular: 'Nunito_600SemiBold',
  bold: 'Nunito_800ExtraBold',
};

export const radius = { sm: 10, md: 16, lg: 28, pill: 999 };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

export const shadow = {
  card: { boxShadow: '0 10px 30px rgba(91, 84, 128, 0.18)' },
};

// Aclara (amount > 0) u oscurece (amount < 0) un color hex.
export function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount);
  const r = mix(n >> 16);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
