import { memo, useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { starsFor } from '../game/physics';
import { Track } from '../game/track';
import { colors, fonts, pastel, radius, shadow, spacing } from '../theme';
import { useNativeDriver } from './FadeView';
import { formatTime } from './Hud';
import { PillButton } from './PillButton';

type Props = {
  visible: boolean;
  track: Track;
  nextTrack: Track | null;
  time: number | null;
  best: number | null;
  newRecord: boolean;
  onAgain: () => void;
  onNext: () => void;
  onMenu: () => void;
};

export const ResultsCard = memo(function ResultsCard({
  visible,
  track,
  nextTrack,
  time,
  best,
  newRecord,
  onAgain,
  onNext,
  onMenu,
}: Props) {
  const stars = time === null ? 0 : starsFor(track, time);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>¡Llegaste a la meta!</Text>
      <View style={styles.stars}>
        {[0, 1, 2].map((i) => (
          <Star key={i} on={i < stars} delay={300 + i * 350} visible={visible} />
        ))}
      </View>
      {time !== null && (
        <Text style={styles.time}>
          {track.def.emoji} {track.def.name} · {formatTime(time)}
        </Text>
      )}
      {newRecord ? (
        <Text style={styles.record}>🏆 ¡Nuevo récord!</Text>
      ) : (
        best !== null && best !== time && <Text style={styles.best}>Tu récord: {formatTime(best)}</Text>
      )}
      <View style={styles.buttons}>
        <PillButton label="Otra vez" onPress={onAgain} color={pastel.lilac} />
        {nextTrack && <PillButton label={`${nextTrack.def.emoji} Siguiente`} onPress={onNext} />}
        <PillButton label="Menú" onPress={onMenu} color={pastel.blue} />
      </View>
    </View>
  );
});

function Star({ on, delay, visible }: { on: boolean; delay: number; visible: boolean }) {
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!visible) {
      anim.setValue(0);
      return;
    }
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(anim, { toValue: 1, friction: 5, tension: 50, useNativeDriver }),
    ]).start();
  }, [visible, delay, anim]);

  return (
    <Animated.Text
      style={[
        styles.star,
        !on && styles.starOff,
        {
          transform: [
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) },
            { rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['-40deg', '0deg'] }) },
          ],
        },
      ]}
    >
      ⭐
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: 36,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  title: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 40, color: colors.primary, textAlign: 'center' },
  stars: { flexDirection: 'row', gap: spacing.md },
  star: { fontSize: 48 },
  starOff: { opacity: 0.25 },
  time: { fontFamily: fonts.bold, fontSize: 20, color: colors.text },
  record: { fontFamily: fonts.bold, fontSize: 18, color: colors.primaryDeep, marginTop: -spacing.sm },
  best: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted, marginTop: -spacing.sm },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md, marginTop: spacing.xs },
});
