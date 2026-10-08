import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, GestureResponderEvent, Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Controls as ControlState } from '../game/useRaceGame';
import { colors, fonts, pastel } from '../theme';
import { FadeView, useNativeDriver } from './FadeView';

type Side = 'gas' | 'brake';

const KEY_SIDES: Record<string, Side> = {
  ArrowRight: 'gas',
  ArrowUp: 'gas',
  d: 'gas',
  w: 'gas',
  ' ': 'gas',
  ArrowLeft: 'brake',
  ArrowDown: 'brake',
  a: 'brake',
  s: 'brake',
};

type Props = { enabled: boolean; onChange: (controls: ControlState) => void };

// Mitad izquierda de la pantalla: frenar. Mitad derecha: acelerar. Admite varios dedos a la vez.
export const Controls = memo(function Controls({ enabled, onChange }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState<ControlState>({ gas: false, brake: false });
  const pointers = useRef(new Map<string, Side>());
  const keys = useRef(new Map<string, Side>());
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const sync = useCallback(() => {
    const sides = [...pointers.current.values(), ...keys.current.values()];
    const next = { gas: sides.includes('gas'), brake: sides.includes('brake') };
    onChange(next);
    setActive((prev) => (prev.gas === next.gas && prev.brake === next.brake ? prev : next));
  }, [onChange]);

  // Al pausar o terminar se sueltan los dedos y teclas apretados; para seguir hay que volver a tocar.
  useEffect(() => {
    if (enabled) return;
    pointers.current.clear();
    keys.current.clear();
    sync();
  }, [enabled, sync]);

  // Web: puntero (mouse o dedo) y teclado.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const sideAt = (x: number): Side => (x < window.innerWidth / 2 ? 'brake' : 'gas');

    const down = (e: PointerEvent) => {
      if (!enabledRef.current) return;
      pointers.current.set(String(e.pointerId), sideAt(e.clientX));
      sync();
    };
    const move = (e: PointerEvent) => {
      const id = String(e.pointerId);
      if (!pointers.current.has(id)) return;
      pointers.current.set(id, sideAt(e.clientX));
      sync();
    };
    const up = (e: PointerEvent) => {
      if (pointers.current.delete(String(e.pointerId))) sync();
    };
    const keyDown = (e: KeyboardEvent) => {
      const side = KEY_SIDES[e.key];
      if (!side || !enabledRef.current) return;
      e.preventDefault();
      keys.current.set(e.key, side);
      sync();
    };
    const keyUp = (e: KeyboardEvent) => {
      if (keys.current.delete(e.key)) sync();
    };
    const blur = () => {
      pointers.current.clear();
      keys.current.clear();
      sync();
    };

    window.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('blur', blur);
    };
  }, [sync]);

  // iOS / Android: cada dedo se sigue por su identificador.
  const handleTouches = (e: GestureResponderEvent, ended: boolean) => {
    for (const t of e.nativeEvent.changedTouches) {
      const id = String(t.identifier);
      if (ended) pointers.current.delete(id);
      else pointers.current.set(id, t.pageX < width / 2 ? 'brake' : 'gas');
    }
    if (ended && e.nativeEvent.touches.length === 0) pointers.current.clear();
    sync();
  };

  const touchHandlers =
    Platform.OS === 'web'
      ? {}
      : {
          onStartShouldSetResponder: () => true,
          onTouchStart: (e: GestureResponderEvent) => handleTouches(e, false),
          onTouchMove: (e: GestureResponderEvent) => handleTouches(e, false),
          onTouchEnd: (e: GestureResponderEvent) => handleTouches(e, true),
          onTouchCancel: (e: GestureResponderEvent) => handleTouches(e, true),
        };

  return (
    <>
      <View style={[StyleSheet.absoluteFill, { pointerEvents: enabled ? 'auto' : 'none' }]} {...touchHandlers} />
      <FadeView visible={enabled} interactive={false}>
        <Pad side="brake" active={enabled && active.brake} bottom={insets.bottom} />
        <Pad side="gas" active={enabled && active.gas} bottom={insets.bottom} />
      </FadeView>
    </>
  );
});

function Pad({ side, active, bottom }: { side: Side; active: boolean; bottom: number }) {
  const [anim] = useState(() => new Animated.Value(0));
  const isGas = side === 'gas';

  useEffect(() => {
    Animated.timing(anim, {
      toValue: active ? 1 : 0,
      duration: 260,
      easing: Easing.out(Easing.quad),
      useNativeDriver,
    }).start();
  }, [active, anim]);

  return (
    <View style={[styles.pad, isGas ? styles.padRight : styles.padLeft, { paddingBottom: bottom + 22 }]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          isGas ? styles.tintRight : styles.tintLeft,
          {
            backgroundColor: isGas ? pastel.mint : pastel.pink,
            opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.55] }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.padButton,
          { transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }] },
        ]}
      >
        <Text style={styles.padIcon}>{isGas ? '🚀' : '🐢'}</Text>
      </Animated.View>
      <Text style={styles.padLabel}>{isGas ? 'Acelerar' : 'Frenar'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '20%',
    maxWidth: 190,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  padLeft: { left: 0 },
  padRight: { right: 0 },
  tintLeft: { borderTopRightRadius: 60, borderBottomRightRadius: 60 },
  tintRight: { borderTopLeftRadius: 60, borderBottomLeftRadius: 60 },
  padButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 16px rgba(91, 84, 128, 0.15)',
  },
  padIcon: { fontSize: 36 },
  padLabel: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
});
