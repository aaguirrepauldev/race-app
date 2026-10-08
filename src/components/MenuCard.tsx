import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { starsFor } from '../game/physics';
import { profilePath } from '../game/scenery';
import { Track } from '../game/track';
import { TRACKS } from '../game/tracks';
import { carColors, colors, fonts, radius, shadow, spacing } from '../theme';
import { PillButton } from './PillButton';

type Props = {
  track: Track;
  carColor: string;
  best: Record<string, number>;
  onSelectTrack: (track: Track) => void;
  onSelectColor: (color: string) => void;
  onPlay: () => void;
};

export const MenuCard = memo(function MenuCard({ track, carColor, best, onSelectTrack, onSelectColor, onPlay }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Race App</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tracks}>
        {TRACKS.map((t) => (
          <TrackOption
            key={t.def.id}
            track={t}
            best={best[t.def.id]}
            selected={t === track}
            onPress={() => onSelectTrack(t)}
          />
        ))}
      </ScrollView>

      <View style={styles.swatches}>
        {carColors.map((c) => {
          const selected = c.hex === carColor;
          return (
            <Pressable
              key={c.hex}
              accessibilityLabel={`Auto ${c.name}`}
              onPress={() => onSelectColor(c.hex)}
              style={[styles.swatch, { backgroundColor: c.hex }, selected && styles.swatchSelected]}
            />
          );
        })}
      </View>

      <PillButton label="¡A correr!" onPress={onPlay} />

      <Text style={styles.hint}>Izquierda: frenar 🐢 · Derecha: acelerar 🚀</Text>
    </View>
  );
});

type OptionProps = { track: Track; best: number | undefined; selected: boolean; onPress: () => void };

function TrackOption({ track, best, selected, onPress }: OptionProps) {
  const { palette } = track.def;
  const stars = best === undefined ? 0 : starsFor(track, best);
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`Pista ${track.def.name}`}
      style={[styles.option, { backgroundColor: palette.skyBottom }, selected && styles.optionSelected]}
    >
      <Svg width={96} height={36} viewBox="0 0 96 36">
        <Path d={profilePath(track)} fill={palette.ground} />
      </Svg>
      <Text style={styles.optionName} numberOfLines={1}>
        {track.def.emoji} {track.def.name}
      </Text>
      <View style={styles.optionStars}>
        {[0, 1, 2].map((i) => (
          <Text key={i} style={[styles.optionStar, i >= stars && styles.optionStarOff]}>
            ⭐
          </Text>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    maxWidth: 640,
    ...shadow.card,
  },
  title: { fontFamily: fonts.bold, fontSize: 36, lineHeight: 42, color: colors.primary },
  tracks: { gap: spacing.sm, paddingHorizontal: 4, paddingVertical: 6 },
  option: {
    width: 112,
    alignItems: 'center',
    gap: 4,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: radius.md,
    borderWidth: 3,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  optionSelected: { borderColor: '#8A84AD', transform: [{ scale: 1.05 }] },
  optionName: { fontFamily: fonts.bold, fontSize: 13, color: colors.text },
  optionStars: { flexDirection: 'row', gap: 2 },
  optionStar: { fontSize: 11 },
  optionStarOff: { opacity: 0.25 },
  swatches: { flexDirection: 'row', gap: spacing.md },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: colors.white,
  },
  swatchSelected: {
    transform: [{ scale: 1.2 }],
    boxShadow: '0 0 0 3px #8A84AD',
  },
  hint: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});
