import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, pastel, radius } from '../theme';

export function formatTime(seconds: number) {
  return `${seconds.toFixed(1).replace('.', ',')} s`;
}

type Props = { progress: number; time: number; color: string };

// Barra de avance de la salida a la meta y cronómetro.
export function Hud({ progress, time, color }: Props) {
  const insets = useSafeAreaInsets();
  const percent = `${progress * 100}%` as const;

  return (
    <View style={[styles.hud, { top: insets.top + 12 }]}>
      <Text style={styles.icon}>🚦</Text>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: percent }]} />
        <View style={[styles.marker, { left: percent, backgroundColor: color }]} />
      </View>
      <Text style={styles.icon}>🏁</Text>
      <View style={styles.timer}>
        <Text style={styles.timerText}>{formatTime(time)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    pointerEvents: 'none',
  },
  icon: { fontSize: 22 },
  bar: {
    width: 260,
    height: 16,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: radius.pill,
    backgroundColor: pastel.yellow,
  },
  marker: {
    position: 'absolute',
    width: 24,
    height: 24,
    marginLeft: -12,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.white,
  },
  timer: {
    minWidth: 76,
    paddingVertical: 2,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    alignItems: 'center',
  },
  timerText: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
});
