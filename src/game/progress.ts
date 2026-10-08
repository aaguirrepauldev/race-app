// Progreso del jugador guardado en el dispositivo: mejor tiempo por pista y color de auto.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { carColors } from '../theme';

const KEY = 'progress:v1';

export type Progress = { best: Record<string, number>; carColor: string };

const EMPTY: Progress = { best: {}, carColor: carColors[0].hex };

// Lo guardado puede venir de una versión vieja o estar roto: se queda solo con lo válido.
function parse(raw: string | null): Progress {
  if (!raw) return EMPTY;
  try {
    const data = JSON.parse(raw);
    const best: Record<string, number> = {};
    for (const [id, time] of Object.entries(data?.best ?? {})) {
      if (typeof time === 'number' && time > 0) best[id] = time;
    }
    const carColor = carColors.some((c) => c.hex === data?.carColor) ? data.carColor : EMPTY.carColor;
    return { best, carColor };
  } catch {
    return EMPTY;
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(EMPTY);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY)
      .then(parse, () => EMPTY)
      .then((p) => {
        if (!alive) return;
        ref.current = p;
        setProgress(p);
        setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const save = useCallback((next: Progress) => {
    ref.current = next;
    setProgress(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  // Guarda el tiempo si es el mejor. Devuelve true solo si superó un récord anterior:
  // la primera vez que se termina una pista no hay nada que festejar como récord.
  const recordTime = useCallback(
    (trackId: string, time: number) => {
      const prev = ref.current.best[trackId];
      if (prev !== undefined && prev <= time) return false;
      save({ ...ref.current, best: { ...ref.current.best, [trackId]: time } });
      return prev !== undefined;
    },
    [save],
  );

  const setCarColor = useCallback((carColor: string) => save({ ...ref.current, carColor }), [save]);

  return { progress, loaded, recordTime, setCarColor };
}
