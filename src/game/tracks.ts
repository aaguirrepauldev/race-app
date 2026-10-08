// Catálogo de pistas, de la más tranquila a la más movida.
// Para que el auto siempre pueda subir, la pendiente máxima debe quedar por debajo de ~0,45.

import { buildTrack, TrackDef } from './track';

const DEFS: TrackDef[] = [
  {
    id: 'pradera',
    name: 'Pradera',
    emoji: '🌼',
    length: 4200,
    waves: [
      { amp: 35, freq: 0.0019, phase: 0 },
      { amp: 12, freq: 0.0052, phase: 1.3 },
    ],
    palette: {
      ground: '#B5E8C3',
      groundDeep: '#97D9AC',
      hillMid: '#CDEFD8',
      hillFar: '#D5E6F7',
      skyBottom: '#FDF1D6',
    },
  },
  {
    id: 'colinas',
    name: 'Colinas',
    emoji: '🌳',
    length: 6000,
    waves: [
      { amp: 70, freq: 0.0021, phase: 0 },
      { amp: 35, freq: 0.0047, phase: 1.1 },
      { amp: 8, freq: 0.011, phase: 0.4 },
    ],
    palette: {
      ground: '#A8E0BB',
      groundDeep: '#8FD1A6',
      hillMid: '#C4EAD2',
      hillFar: '#D9D2F3',
      skyBottom: '#FDE2EC',
    },
  },
  {
    id: 'saltitos',
    name: 'Saltitos',
    emoji: '🐰',
    length: 5000,
    waves: [
      { amp: 22, freq: 0.0115, phase: 0 },
      { amp: 14, freq: 0.0026, phase: 0.8 },
    ],
    palette: {
      ground: '#BFE6A8',
      groundDeep: '#A3D58A',
      hillMid: '#E2F0C4',
      hillFar: '#F5D5E5',
      skyBottom: '#FFE9D6',
    },
  },
  {
    id: 'montana',
    name: 'Montaña',
    emoji: '⛰️',
    length: 6000,
    waves: [{ amp: 12, freq: 0.006, phase: 0.5 }],
    bumps: [{ at: 0.5, width: 2600, height: 190 }],
    palette: {
      ground: '#B9DCC9',
      groundDeep: '#9CC8B1',
      hillMid: '#C9D6EE',
      hillFar: '#DCD3F0',
      skyBottom: '#E6E0FA',
    },
  },
  {
    id: 'rusa',
    name: 'Montaña rusa',
    emoji: '🎢',
    length: 6800,
    waves: [
      { amp: 95, freq: 0.0027, phase: 0 },
      { amp: 25, freq: 0.0062, phase: 2 },
    ],
    palette: {
      ground: '#F3D6B8',
      groundDeep: '#E6BE98',
      hillMid: '#F9E3C6',
      hillFar: '#F6CFD8',
      skyBottom: '#FFE4D2',
    },
  },
];

export const TRACKS = DEFS.map(buildTrack);
