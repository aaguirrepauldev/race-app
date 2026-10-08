// Decorado de cada pista, dividido en tramos para dibujar solo lo que entra en pantalla.
// Se calcula una vez por pista y queda en caché.

import { pastel, treeColors } from '../theme';
import { createRandom, seedFrom, Track, VIEW_HEIGHT } from './track';

export const CHUNK = 640;
const TRACK_STEP = 16; // CHUNK debe ser múltiplo de los pasos
const HILL_STEP = 20;
const DASH = 22;
const DASH_GAP = 22;

const round = (n: number) => Math.round(n * 10) / 10;

export type Flower = { x: number; y: number; r: number; color: string };

export type TrackChunk = {
  ground: string;
  soil: string;
  road: string;
  roadTop: string;
  roadBottom: string;
  dash: string;
  flowers: Flower[];
};

export type Tree = { x: number; y: number; scale: number; color: string };

export type LayerChunk = { d: string; trees: Tree[] };

export type HillLayer = {
  parallax: number;
  base: number;
  amp: number;
  freq: number;
  seed: number;
  from: number;
  chunks: LayerChunk[];
};

export type Scenery = { origin: number; chunks: TrackChunk[]; far: HillLayer; mid: HillLayer };

export type Cloud = { x: number; y: number; scale: number; speed: number };

export const CLOUD_SPAN = 1600;
const cloudRandom = createRandom(42);
export const CLOUDS: Cloud[] = Array.from({ length: 7 }, (_, i) => ({
  x: (i / 7) * CLOUD_SPAN + cloudRandom() * 120,
  y: 30 + cloudRandom() * 100,
  scale: 0.6 + cloudRandom() * 0.6,
  speed: 4 + cloudRandom() * 8,
}));

// Índices de los tramos que se cruzan con [from, to].
export function chunkRange(origin: number, count: number, from: number, to: number) {
  const first = Math.max(0, Math.floor((from - origin) / CHUNK));
  const last = Math.min(count - 1, Math.floor((to - origin) / CHUNK));
  const list: number[] = [];
  for (let i = first; i <= last; i++) list.push(i);
  return list;
}

export function hillY(l: Omit<HillLayer, 'chunks'>, x: number) {
  return l.base - l.amp * (0.6 * Math.sin(x * l.freq + l.seed) + 0.4 * Math.sin(x * l.freq * 2.3 + l.seed * 1.7));
}

function buildTrackChunks(track: Track, random: () => number): TrackChunk[] {
  const origin = track.worldMin;
  const count = Math.ceil((track.worldMax - origin) / CHUNK);

  // Cada tramo se superpone un paso con el siguiente para que no se vean cortes.
  const line = (offset: number, from: number, to: number) => {
    let d = '';
    for (let x = from; x <= to + TRACK_STEP; x += TRACK_STEP) {
      d += `${d ? 'L' : 'M'}${x} ${round(offset - track.heightAt(x))}`;
    }
    return d;
  };

  const chunks: TrackChunk[] = [];
  for (let i = 0; i < count; i++) {
    const from = origin + i * CHUNK;
    const to = from + CHUNK;
    const period = DASH + DASH_GAP;
    let dash = '';
    for (let x = origin + Math.ceil((from - origin) / period) * period; x < to; x += period) {
      dash += `M${x} ${round(10 - track.heightAt(x))}L${x + DASH} ${round(10 - track.heightAt(x + DASH))}`;
    }
    chunks.push({
      ground: `${line(0, from, to)}L${to + TRACK_STEP} 900L${from} 900Z`,
      soil: line(26, from, to),
      road: line(10, from, to),
      roadTop: line(0.5, from, to),
      roadBottom: line(20, from, to),
      dash,
      flowers: [],
    });
  }

  const flowerColors = [pastel.pink, pastel.yellow, pastel.lilac, '#FFFFFF', pastel.peach];
  for (let x = origin; x < track.worldMax; x += 60 + random() * 130) {
    chunks[Math.floor((x - origin) / CHUNK)]?.flowers.push({
      x,
      y: 36 + random() * 70 - track.heightAt(x),
      r: 3.5 + random() * 2.5,
      color: flowerColors[Math.floor(random() * flowerColors.length)],
    });
  }
  return chunks;
}

function buildLayer(
  track: Track,
  random: () => number,
  config: { parallax: number; base: number; amp: number; freq: number; seed: number; trees: boolean },
): HillLayer {
  const from = Math.floor((track.worldMin * config.parallax) / CHUNK) * CHUNK - CHUNK;
  const to = track.worldMax * config.parallax + 1400; // margen para pantallas muy anchas
  const count = Math.ceil((to - from) / CHUNK);
  const layer = { ...config, from };
  const bottom = VIEW_HEIGHT + 400;

  const chunks: LayerChunk[] = [];
  for (let i = 0; i < count; i++) {
    const start = from + i * CHUNK;
    const end = start + CHUNK + HILL_STEP;
    let d = `M${start} ${bottom}`;
    for (let x = start; x <= end; x += HILL_STEP) d += `L${x} ${Math.round(hillY(layer, x))}`;
    chunks.push({ d: `${d}L${end} ${bottom}Z`, trees: [] });
  }

  if (config.trees) {
    for (let x = from; x < from + count * CHUNK; x += 110 + random() * 240) {
      chunks[Math.floor((x - from) / CHUNK)].trees.push({
        x,
        y: hillY(layer, x) + 4,
        scale: 0.7 + random() * 0.45,
        color: treeColors[Math.floor(random() * treeColors.length)],
      });
    }
  }
  return { ...layer, chunks };
}

const cache = new Map<string, Scenery>();

export function getScenery(track: Track): Scenery {
  let scenery = cache.get(track.def.id);
  if (!scenery) {
    const random = createRandom(seedFrom(track.def.id));
    scenery = {
      origin: track.worldMin,
      chunks: buildTrackChunks(track, random),
      far: buildLayer(track, random, {
        parallax: 0.2,
        base: VIEW_HEIGHT * 0.48,
        amp: 34,
        freq: 0.0045,
        seed: random() * 6,
        trees: false,
      }),
      mid: buildLayer(track, random, {
        parallax: 0.5,
        base: VIEW_HEIGHT * 0.6,
        amp: 24,
        freq: 0.0065,
        seed: random() * 6,
        trees: true,
      }),
    };
    cache.set(track.def.id, scenery);
  }
  return scenery;
}

const profiles = new Map<string, string>();

// Silueta chiquita de la pista para el selector del menú (96 x 36).
export function profilePath(track: Track) {
  let d = profiles.get(track.def.id);
  if (!d) {
    const from = track.start - 100;
    const span = track.finish + 100 - from;
    d = '';
    for (let i = 0; i <= 48; i++) {
      const x = from + (i / 48) * span;
      d += `${d ? 'L' : 'M'}${i * 2} ${round(24 - track.heightAt(x) * 0.09)}`;
    }
    d += 'L96 36L0 36Z';
    profiles.set(track.def.id, d);
  }
  return d;
}
