import { ReactNode, useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleProp, StyleSheet, ViewStyle } from 'react-native';

export const useNativeDriver = Platform.OS !== 'web';

type Props = {
  visible: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  duration?: number;
  interactive?: boolean;
};

// Capa a pantalla completa que aparece y desaparece con un fundido lento.
export function FadeView({ visible, children, style, duration = 700, interactive = true }: Props) {
  const [anim] = useState(() => new Animated.Value(visible ? 1 : 0));

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver,
    }).start();
  }, [visible, duration, anim]);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        style,
        {
          pointerEvents: visible && interactive ? 'box-none' : 'none',
          opacity: anim,
          transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
