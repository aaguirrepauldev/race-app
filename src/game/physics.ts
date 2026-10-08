import { START_X, Track } from './track';

// Valores pensados para que el auto sea tranquilo y siempre pueda subir las lomas.
export const PHYSICS = {
  engine: 230,
  brake: 400,
  finishBrake: 220,
  gravity: 300,
  drag: 0.3,
  rolling: 18,
  maxSpeed: 380,
  wheelRadius: 12,
};

export type CarState = {
  x: number;
  v: number;
  angle: number; // radianes, positivo = trompa hacia arriba
  wheel: number; // grados
};

export function stepCar(track: Track, car: CarState, dt: number, gas: boolean, brakeForce: number) {
  const slope = Math.atan(track.slopeAt(car.x));

  let accel = -PHYSICS.gravity * Math.sin(slope) - PHYSICS.drag * car.v - (car.v > 0 ? PHYSICS.rolling : 0);
  if (gas) accel += PHYSICS.engine;
  accel -= brakeForce;

  // Nunca va marcha atrás: en una subida sin acelerar, el auto se detiene.
  car.v = Math.min(PHYSICS.maxSpeed, Math.max(0, car.v + accel * dt));
  car.x += car.v * Math.cos(slope) * dt;
  car.angle += (slope - car.angle) * Math.min(1, dt * 6);
  car.wheel = (car.wheel + ((car.v * dt) / PHYSICS.wheelRadius) * (180 / Math.PI)) % 360;
}

const parTimes = new Map<string, number>();

// Tiempo acelerando a fondo todo el recorrido: la referencia para las estrellas.
export function parTime(track: Track) {
  let par = parTimes.get(track.def.id);
  if (par === undefined) {
    const car: CarState = { x: START_X, v: 0, angle: 0, wheel: 0 };
    const dt = 1 / 60;
    par = 0;
    while (car.x < track.finish && par < 300) {
      stepCar(track, car, dt, true, 0);
      par += dt;
    }
    parTimes.set(track.def.id, par);
  }
  return par;
}

// Siempre hay al menos una estrella: llegar a la meta ya es un logro.
export function starsFor(track: Track, time: number) {
  const par = parTime(track);
  if (time <= par * 1.4) return 3;
  if (time <= par * 2) return 2;
  return 1;
}
