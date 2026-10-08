import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import { useNativeDriver } from './FadeView';

// Muestra 3, 2, 1, ¡Ya! con un crecimiento suave y un fundido.
export function Countdown({ value }: { value: string | null }) {
  const [anim] = useState(() => new Animated.Value(0));
  const [shown, setShown] = useState<string | null>(null);

  if (value !== null && value !== shown) setShown(value);

  useEffect(() => {
    if (value === null) return;
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 950, easing: Easing.out(Easing.quad), useNativeDriver }).start();
  }, [value, anim]);

  return (
    <Animated.Text
      style={[
        styles.text,
        {
          opacity: anim.interpolate({ inputRange: [0, 0.2, 0.75, 1], outputRange: [0, 1, 1, 0] }),
          transform: [{ scale: anim.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0.5, 1.08, 1.2] }) }],
        },
      ]}
    >
      {shown}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    position: 'absolute',
    alignSelf: 'center',
    top: '22%',
    fontFamily: fonts.bold,
    fontSize: 110,
    color: colors.white,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 1,
    pointerEvents: 'none',
  },
});
