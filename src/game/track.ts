// Pistas rectas con subidas y bajadas.
// Coordenadas del mundo: x crece hacia la derecha y la altura crece hacia arriba.

export const VIEW_HEIGHT = 420; // alto virtual de la escena; el ancho depende de la pantalla
export const HORIZON = VIEW_HEIGHT * 0.68; // altura de pantalla donde se apoya el auto

export const TRACK_START = 300;
export const START_X = TRACK_START - 80; // el auto arranca un poco antes de la línea

const RAMP = 700; // las lomas aparecen y desaparecen suavemente: salida y meta son planas

// Onda senoidal: amp = alto, freq = qué tan seguidas son las lomas.
export type Wave = { amp: number; freq: number; phase: number };
// Loma suelta: at = posición (0 a 1 dentro del tramo con lomas), width y height en unidades.
export type Bump = { at: number; width: number; height: number };

export type TrackPalette = {
  ground: string;
  groundDeep: string;
  hillMid: string;
  hillFar: string;
  skyBottom: string;
};

export type TrackDef = {
  id: string;
  name: string;
  emoji: string;
  length: number;
  waves: Wave[];
  bumps?: Bump[];
  palette: TrackPalette;
};

export type Track = {
  def: TrackDef;
  start: number;
  finish: number;
  worldMin: number;
  worldMax: number;
  heightAt: (x: number) => number;
  slopeAt: (x: number) => number;
};

function smoothstep(from: number, to: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - from) / (to - from)));
  return t * t * (3 - 2 * t);
}

export function buildTrack(def: TrackDef): Track {
  const start = TRACK_START;
  const finish = start + def.length;
  const hillsFrom = start + 350;
  const hillsTo = finish - 450;
  const bumps = (def.bumps ?? []).map((b) => ({
    center: hillsFrom + b.at * (hillsTo - hillsFrom),
    half: b.width / 2,
    height: b.height,
  }));

  const heightAt = (x: number) => {
    const k = smoothstep(hillsFrom, hillsFrom + RAMP, x) * (1 - smoothstep(hillsTo - RAMP, hillsTo, x));
    if (k <= 0) return 0;
    const t = x - hillsFrom;
    let h = 0;
    for (const w of def.waves) h += w.amp * Math.sin(t * w.freq + w.phase);
    for (const b of bumps) {
      const d = Math.abs(x - b.center);
      if (d < b.half) h += (b.height * (1 + Math.cos((Math.PI * d) / b.half))) / 2;
    }
    return h * k;
  };

  return {
    def,
    start,
    finish,
    worldMin: -1200,
    worldMax: finish + 1600,
    heightAt,
    slopeAt: (x) => (heightAt(x + 1) - heightAt(x - 1)) / 2,
  };
}

// Generador pseudoaleatorio con semilla: el paisaje de cada pista es siempre el mismo.
export function createRandom(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function seedFrom(text: string) {
  let h = 7;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 2147483647;
  return h;
}
