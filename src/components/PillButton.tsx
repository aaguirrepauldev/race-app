import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius, shade } from '../theme';

type Props = { label: string; onPress: () => void; color?: string };

export function PillButton({ label, onPress, color = colors.primary }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color, boxShadow: `0 ${pressed ? 2 : 6}px 0 ${shade(color, -0.15)}` },
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  pressed: { transform: [{ translateY: 4 }] },
  label: { fontFamily: fonts.bold, fontSize: 22, color: colors.white },
});
