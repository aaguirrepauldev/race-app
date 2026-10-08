import { useMemo } from 'react';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { shade } from '../theme';

type Props = {
  x: number; // posición en el mundo
  y: number; // y en coordenadas SVG (hacia abajo)
  angle: number;
  wheel: number;
  bob: number;
  color: string;
};

// Auto de carreras dibujado sobre el punto de apoyo, centrado entre las ruedas.
export function Car({ x, y, angle, wheel, bob, color }: Props) {
  const { dark, light } = useMemo(() => ({ dark: shade(color, -0.2), light: shade(color, 0.45) }), [color]);

  return (
    <G transform={`translate(${x} ${y}) rotate(${(-angle * 180) / Math.PI})`}>
      <Ellipse cx={0} cy={1} rx={48} ry={4} fill="#5B5480" opacity={0.12} />
      <G transform={`translate(0 ${bob})`}>
        <Rect x={-53} y={-50} width={10} height={20} rx={4} fill={dark} />
        <Path d="M-24 -38A22 22 0 0 1 20 -38Z" fill="#E8F6FF" stroke="#FFFFFF" strokeWidth={3} />
        <Circle cx={-2} cy={-46} r={11} fill={dark} />
        <Rect x={1} y={-50} width={11} height={7} rx={3.5} fill="#A8D8F7" />
        <Rect x={-47} y={-40} width={96} height={28} rx={14} fill={color} />
        <Rect x={-36} y={-35} width={56} height={5} rx={2.5} fill={light} />
        <Circle cx={12} cy={-24} r={7} fill="#FFFFFF" />
        <Circle cx={12} cy={-24} r={3.5} fill={light} />
        <Circle cx={44} cy={-28} r={4} fill="#FFF6B8" />
      </G>
      <Wheel x={-27} rotation={wheel} />
      <Wheel x={28} rotation={wheel} />
    </G>
  );
}

function Wheel({ x, rotation }: { x: number; rotation: number }) {
  return (
    <G transform={`translate(${x} -12) rotate(${rotation})`}>
      <Circle r={12} fill="#5B5480" />
      <Circle r={6.5} fill="#EFEAFF" />
      <Path d="M-6.5 0H6.5M0 -6.5V6.5" stroke="#B9B3D6" strokeWidth={2} />
    </G>
  );
}
