import { useCallback, useEffect, useRef, useState } from 'react';
import { carColors } from '../theme';
import { CarState, PHYSICS, stepCar } from './physics';
import { START_X, Track, VIEW_HEIGHT } from './track';
import { TRACKS } from './tracks';

export type Phase = 'menu' | 'countdown' | 'race' | 'finish';

export type Controls = { gas: boolean; brake: boolean };

export type Dust = { x: number; y: number; vx: number; vy: number; r: number; life: number; maxLife: number };

export type ConfettiPiece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  sway: number;
  color: string;
};

type World = {
  car: CarState;
  time: number;
  countdownTime: number;
  raceTime: number;
  camX: number;
  camH: number;
  dust: Dust[];
  confetti: ConfettiPiece[];
  dustTimer: number;
};

export type WorldView = Omit<World, 'dustTimer' | 'countdownTime'>;

// La cuenta regresiva avanza con el tiempo de la simulación, así se congela al pausar.
const INTRO_DELAY = 0.7; // segundos: deja terminar el fundido del menú antes del 3, 2, 1
const COUNTDOWN_STEP = 1;
const COUNTDOWN_LABELS = ['3', '2', '1'];
const GO_LABEL_TIME = 1; // segundos que se ve "¡Ya!" al arrancar
const RESULTS_DELAY = 1800;
const CURTAIN_MS = 700;
const DUST_EVERY = 0.07;

function createWorld(): World {
  return {
    car: { x: START_X, v: 0, angle: 0, wheel: 0 },
    time: 0,
    countdownTime: 0,
    raceTime: 0,
    camX: 0,
    camH: 0,
    dust: [],
    confetti: [],
    dustTimer: 0,
  };
}

function countdownLabel(w: World, phase: Phase) {
  if (phase === 'countdown') {
    const step = Math.floor((w.countdownTime - INTRO_DELAY) / COUNTDOWN_STEP);
    return step >= 0 ? (COUNTDOWN_LABELS[step] ?? null) : null;
  }
  if (phase === 'race' && w.raceTime < GO_LABEL_TIME) return '¡Ya!';
  return null;
}

function snapshot(w: World): WorldView {
  return {
    car: { ...w.car },
    time: w.time,
    raceTime: w.raceTime,
    camX: w.camX,
    camH: w.camH,
    dust: w.dust.slice(),
    confetti: w.confetti.slice(),
  };
}

export function progressOf(track: Track, x: number) {
  return Math.min(1, Math.max(0, (x - START_X) / (track.finish - START_X)));
}

function spawnDust(w: World, track: Track) {
  const back = w.car.x - 30 * Math.cos(w.car.angle);
  w.dust.push({
    x: back,
    y: track.heightAt(back) + 4,
    vx: -25 - Math.random() * 35,
    vy: 10 + Math.random() * 25,
    r: 3 + Math.random() * 3,
    life: 0.8,
    maxLife: 0.8,
  });
}

function spawnConfetti(w: World, viewWidth: number) {
  const palette = [...carColors.map((c) => c.hex), '#FFFFFF'];
  for (let i = 0; i < 70; i++) {
    w.confetti.push({
      x: Math.random() * viewWidth,
      y: -20 - Math.random() * 260,
      vx: -20 + Math.random() * 40,
      vy: 30 + Math.random() * 50,
      rot: Math.random() * 360,
      vr: -180 + Math.random() * 360,
      size: 6 + Math.random() * 5,
      sway: Math.random() * Math.PI * 2,
      color: palette[i % palette.length],
    });
  }
}

// Avanza la simulación un paso. Devuelve true en el instante en que el auto cruza la meta.
function updateWorld(w: World, track: Track, dt: number, phase: Phase, controls: Controls, viewWidth: number) {
  const car = w.car;
  let finished = false;
  w.time += dt;
  if (phase === 'countdown') w.countdownTime += dt;

  if (phase === 'race' || phase === 'finish') {
    const gas = phase === 'race' && controls.gas && !controls.brake;
    const brake = phase === 'finish' ? PHYSICS.finishBrake : controls.brake ? PHYSICS.brake : 0;
    stepCar(track, car, dt, gas, brake);

    if (phase === 'race') {
      w.raceTime += dt;
      if (car.x >= track.finish) {
        finished = true;
        spawnConfetti(w, viewWidth);
      }
    }

    if (gas && car.v > 10) {
      w.dustTimer += dt;
      while (w.dustTimer > DUST_EVERY) {
        w.dustTimer -= DUST_EVERY;
        spawnDust(w, track);
      }
    }
  }

  w.camX = car.x - viewWidth * 0.3;
  w.camH += (track.heightAt(car.x) - w.camH) * Math.min(1, dt * 2.5);

  for (const d of w.dust) {
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    d.r += 9 * dt;
    d.life -= dt;
  }
  w.dust = w.dust.filter((d) => d.life > 0);

  for (const c of w.confetti) {
    c.vy = Math.min(c.vy + 40 * dt, 110);
    c.x += (c.vx + Math.sin(w.time * 2 + c.sway) * 25) * dt;
    c.y += c.vy * dt;
    c.rot += c.vr * dt;
  }
  w.confetti = w.confetti.filter((c) => c.y < VIEW_HEIGHT + 30);

  return finished;
}

export function useRaceGame(viewWidth: number, onFinish?: (track: Track, time: number) => void) {
  const [phase, setPhase] = useState<Phase>('menu');
  const [track, setTrack] = useState<Track>(TRACKS[0]);
  const [view, setView] = useState<WorldView>(() => snapshot(createWorld()));
  const [countdown, setCountdown] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [curtain, setCurtain] = useState(false);
  const [paused, setPaused] = useState(false);

  const world = useRef<World | null>(null);
  const phaseRef = useRef<Phase>('menu');
  const pausedRef = useRef(false);
  const labelRef = useRef<string | null>(null);
  const trackRef = useRef<Track>(TRACKS[0]);
  const controls = useRef<Controls>({ gas: false, brake: false });
  const viewWidthRef = useRef(viewWidth);
  const onFinishRef = useRef(onFinish);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    viewWidthRef.current = viewWidth;
    onFinishRef.current = onFinish;
  }, [viewWidth, onFinish]);

  const changePhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => {
    let frameId = 0;
    let last: number | null = null;
    let frameCount = 0;

    const loop = (now: number) => {
      const dt = last === null ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      frameId = requestAnimationFrame(loop);
      if (pausedRef.current) return;

      if (!world.current) world.current = createWorld();
      const w = world.current;
      const phaseNow = phaseRef.current;

      if (updateWorld(w, trackRef.current, dt, phaseNow, controls.current, viewWidthRef.current)) {
        changePhase('finish');
        setResult(w.raceTime);
        onFinishRef.current?.(trackRef.current, w.raceTime);
        later(RESULTS_DELAY, () => setResultsVisible(true));
      }
      if (phaseNow === 'countdown' && w.countdownTime >= INTRO_DELAY + COUNTDOWN_LABELS.length * COUNTDOWN_STEP) {
        changePhase('race');
      }

      const label = countdownLabel(w, phaseRef.current);
      if (label !== labelRef.current) {
        labelRef.current = label;
        setCountdown(label);
      }

      // Con el auto quieto (menú o después de la meta) solo se mueven las nubes:
      // alcanza con redibujar a 30 cuadros por segundo.
      const idle =
        phaseNow === 'menu' ||
        (phaseNow === 'finish' && w.car.v === 0 && w.dust.length === 0 && w.confetti.length === 0);
      frameCount++;
      if (!idle || frameCount % 2 === 0) setView(snapshot(w));
    };

    frameId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frameId);
      clearTimers();
    };
  }, [changePhase, later, clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    world.current = createWorld();
    controls.current = { gas: false, brake: false };
    pausedRef.current = false;
    labelRef.current = null;
    setPaused(false);
    setResult(null);
    setResultsVisible(false);
    setCountdown(null);
  }, [clearTimers]);

  // Solo se pausa en la cuenta regresiva o en carrera; la simulación queda congelada.
  const pause = useCallback(() => {
    const p = phaseRef.current;
    if (pausedRef.current || (p !== 'countdown' && p !== 'race')) return;
    pausedRef.current = true;
    controls.current = { gas: false, brake: false };
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
    setPaused(false);
  }, []);

  // Si el auto no está en la salida, tapa la escena con un fundido suave antes de reiniciar.
  const transition = useCallback(
    (action: () => void) => {
      if (phaseRef.current === 'menu') {
        action();
        return;
      }
      setResultsVisible(false);
      setCurtain(true);
      later(CURTAIN_MS, () => {
        action();
        setCurtain(false);
      });
    },
    [later],
  );

  const startRace = useCallback(
    (next?: Track) => {
      transition(() => {
        if (next) {
          trackRef.current = next;
          setTrack(next);
        }
        reset();
        changePhase('countdown');
      });
    },
    [transition, reset, changePhase],
  );

  // En el menú el auto ya está en la salida, así que se puede cambiar de pista al instante.
  const selectTrack = useCallback((next: Track) => {
    if (phaseRef.current !== 'menu') return;
    trackRef.current = next;
    setTrack(next);
  }, []);

  const goToMenu = useCallback(() => {
    transition(() => {
      reset();
      changePhase('menu');
    });
  }, [transition, reset, changePhase]);

  const setControls = useCallback((next: Controls) => {
    controls.current = next;
  }, []);

  return {
    phase,
    track,
    view,
    countdown,
    result,
    resultsVisible,
    curtain,
    paused,
    startRace,
    selectTrack,
    goToMenu,
    pause,
    resume,
    setControls,
  };
}
