import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, pastel, radius, shadow, spacing } from '../theme';
import { PillButton } from './PillButton';

type CardProps = { onResume: () => void; onRestart: () => void; onMenu: () => void };

export const PauseCard = memo(function PauseCard({ onResume, onRestart, onMenu }: CardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Pausa</Text>
      <View style={styles.buttons}>
        <PillButton label="Seguir" onPress={onResume} />
        <PillButton label="Empezar de nuevo" onPress={onRestart} color={pastel.lilac} />
        <PillButton label="Menú" onPress={onMenu} color={pastel.blue} />
      </View>
    </View>
  );
});

// Botón chiquito arriba a la izquierda, por encima de la zona táctil de los controles.
export function PauseButton({ onPress }: { onPress: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Pausa"
      hitSlop={12}
      style={({ pressed }) => [
        styles.button,
        { top: insets.top + 10, left: insets.left + 14 },
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={styles.bar} />
      <View style={styles.bar} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: 36,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  title: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 40, color: colors.primary },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md },
  button: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    boxShadow: '0 4px 12px rgba(91, 84, 128, 0.15)',
  },
  buttonPressed: { transform: [{ scale: 0.92 }] },
  bar: { width: 5, height: 18, borderRadius: 3, backgroundColor: colors.text },
});
