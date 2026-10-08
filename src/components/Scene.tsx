import { memo } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { chunkRange, CLOUDS, CLOUD_SPAN, getScenery, HillLayer, Tree, TrackChunk } from '../game/scenery';
import { HORIZON, Track, TrackPalette, VIEW_HEIGHT } from '../game/track';
import { WorldView } from '../game/useRaceGame';
import { fonts, pastel } from '../theme';
import { Car } from './Car';

type Props = { width: number; height: number; view: WorldView; carColor: string; track: Track };

// Solo se dibujan los tramos de paisaje que entran en pantalla. Cada tramo es un componente
// memorizado: la cámara mueve el grupo que los contiene sin volver a generarlos.
export function Scene({ width, height, view, carColor, track }: Props) {
  const viewWidth = (width / height) * VIEW_HEIGHT;
  const scenery = getScenery(track);
  const palette = track.def.palette;
  const { camX, camH, car, time } = view;
  const bob = car.v > 0 ? Math.sin(time * 16) * Math.min(1, car.v / 250) * 1.2 : Math.sin(time * 3) * 0.6;

  const trackChunks = chunkRange(scenery.origin, scenery.chunks.length, camX - 20, camX + viewWidth + 20);
  const gateMargin = 130;
  const gateVisible = (x: number) => x > camX - gateMargin && x < camX + viewWidth + gateMargin;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${viewWidth} ${VIEW_HEIGHT}`}>
      <Sky width={viewWidth} bottom={palette.skyBottom} />

      {CLOUDS.map((c, i) => {
        const span = Math.max(CLOUD_SPAN, viewWidth + 300);
        const x = ((((c.x - camX * 0.08 + time * c.speed) % span) + span) % span) - 150;
        return <CloudShape key={i} x={x} y={c.y + camH * 0.05} scale={c.scale} />;
      })}

      <HillLayerView layer={scenery.far} camX={camX} camH={camH} viewWidth={viewWidth} color={palette.hillFar} />
      <HillLayerView layer={scenery.mid} camX={camX} camH={camH} viewWidth={viewWidth} color={palette.hillMid} />

      <G transform={`translate(${-camX} ${HORIZON + camH})`}>
        {gateVisible(track.start) && <Gate x={track.start} label="SALIDA" color={pastel.blue} />}
        {gateVisible(track.finish) && <Gate x={track.finish} label="META" color={pastel.pink} balloons />}
        {trackChunks.map((i) => (
          <TrackChunkView key={`${track.def.id}-${i}`} chunk={scenery.chunks[i]} palette={palette} />
        ))}
        {gateVisible(track.start) && <Checkers x={track.start} />}
        {gateVisible(track.finish) && <Checkers x={track.finish} />}
        {view.dust.map((d, i) => (
          <Circle key={i} cx={d.x} cy={-d.y} r={d.r} fill="#FFFFFF" opacity={(d.life / d.maxLife) * 0.75} />
        ))}
        <Car x={car.x} y={-track.heightAt(car.x)} angle={car.angle} wheel={car.wheel} bob={bob} color={carColor} />
      </G>

      {view.confetti.map((c, i) => (
        <Rect
          key={i}
          x={-c.size / 2}
          y={-c.size / 4}
          width={c.size}
          height={c.size / 2}
          rx={1.5}
          fill={c.color}
          transform={`translate(${c.x} ${c.y}) rotate(${c.rot})`}
        />
      ))}
    </Svg>
  );
}

const Sky = memo(function Sky({ width, bottom }: { width: number; bottom: string }) {
  return (
    <>
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={pastel.skyTop} />
          <Stop offset="1" stopColor={bottom} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={VIEW_HEIGHT} fill="url(#sky)" />
      <Circle cx={width - 90} cy={70} r={54} fill={pastel.sunGlow} opacity={0.6} />
      <Circle cx={width - 90} cy={70} r={34} fill={pastel.sun} />
    </>
  );
});

function CloudShape({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`} opacity={0.9}>
      <Circle cx={0} cy={0} r={18} fill={pastel.cloud} />
      <Circle cx={22} cy={-10} r={24} fill={pastel.cloud} />
      <Circle cx={46} cy={0} r={18} fill={pastel.cloud} />
      <Rect x={0} y={0} width={46} height={18} fill={pastel.cloud} />
    </G>
  );
}

type LayerProps = { layer: HillLayer; camX: number; camH: number; viewWidth: number; color: string };

function HillLayerView({ layer, camX, camH, viewWidth, color }: LayerProps) {
  const left = camX * layer.parallax;
  const visible = chunkRange(layer.from, layer.chunks.length, left, left + viewWidth);
  // Primero todos los árboles y después las colinas, para que el pie de cada árbol quede tapado.
  return (
    <G transform={`translate(${-left} ${camH * layer.parallax})`}>
      {visible.map((i) => (
        <Trees key={`t${i}`} trees={layer.chunks[i].trees} />
      ))}
      {visible.map((i) => (
        <HillPath key={`h${i}`} d={layer.chunks[i].d} color={color} />
      ))}
    </G>
  );
}

const HillPath = memo(function HillPath({ d, color }: { d: string; color: string }) {
  return <Path d={d} fill={color} />;
});

const Trees = memo(function Trees({ trees }: { trees: Tree[] }) {
  return (
    <>
      {trees.map((t, i) => (
        <G key={i} transform={`translate(${t.x} ${t.y}) scale(${t.scale})`}>
          <Rect x={-3} y={-30} width={6} height={32} rx={3} fill={pastel.trunk} />
          <Circle cx={0} cy={-38} r={18} fill={t.color} />
          <Circle cx={-6} cy={-44} r={6} fill="#FFFFFF" opacity={0.35} />
        </G>
      ))}
    </>
  );
});

const TrackChunkView = memo(function TrackChunkView({ chunk, palette }: { chunk: TrackChunk; palette: TrackPalette }) {
  return (
    <>
      <Path d={chunk.ground} fill={palette.ground} />
      <Path d={chunk.soil} stroke={palette.groundDeep} strokeWidth={6} opacity={0.5} fill="none" />
      <Path d={chunk.road} stroke={pastel.road} strokeWidth={20} strokeLinejoin="round" fill="none" />
      <Path d={chunk.roadTop} stroke="#FFFFFF" strokeWidth={2} opacity={0.7} fill="none" />
      <Path d={chunk.roadBottom} stroke={pastel.roadEdge} strokeWidth={2.5} fill="none" />
      <Path d={chunk.dash} stroke={pastel.stripe} strokeWidth={2.5} strokeLinecap="round" fill="none" />
      {chunk.flowers.map((f, i) => (
        <G key={i}>
          <Circle cx={f.x} cy={f.y} r={f.r} fill={f.color} />
          <Circle cx={f.x} cy={f.y} r={f.r * 0.4} fill="#FFE08A" />
        </G>
      ))}
    </>
  );
});

// Arco de salida o meta. La pista es plana en esos tramos, así que se apoya en y = 0.
const Gate = memo(function Gate({
  x,
  label,
  color,
  balloons,
}: {
  x: number;
  label: string;
  color: string;
  balloons?: boolean;
}) {
  return (
    <G transform={`translate(${x} 0)`}>
      <Rect x={-76} y={-170} width={10} height={172} rx={5} fill="#FFFFFF" />
      <Rect x={66} y={-170} width={10} height={172} rx={5} fill="#FFFFFF" />
      <Rect x={-90} y={-206} width={180} height={46} rx={16} fill={color} stroke="#FFFFFF" strokeWidth={4} />
      <SvgText x={0} y={-175} fontSize={24} fontFamily={fonts.bold} fontWeight="800" fill="#FFFFFF" textAnchor="middle">
        {label}
      </SvgText>
      {balloons && (
        <>
          <Path d="M-71 -170L-86 -232M71 -170L88 -228" stroke="#FFFFFF" strokeWidth={1.5} />
          <Circle cx={-88} cy={-246} r={15} fill={pastel.yellow} />
          <Circle cx={90} cy={-242} r={15} fill={pastel.lilac} />
        </>
      )}
    </G>
  );
});

const Checkers = memo(function Checkers({ x }: { x: number }) {
  const size = 20 / 3;
  const cells = [];
  for (let col = 0; col < 2; col++) {
    for (let row = 0; row < 3; row++) {
      cells.push(
        <Rect
          key={`${col}-${row}`}
          x={x - 8 + col * 8}
          y={row * size}
          width={8}
          height={size}
          fill={(col + row) % 2 ? '#5B5480' : '#FFFFFF'}
        />,
      );
    }
  }
  return <>{cells}</>;
});
