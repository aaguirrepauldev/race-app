import { useCallback, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Controls } from '../components/Controls';
import { Countdown } from '../components/Countdown';
import { FadeView } from '../components/FadeView';
import { Hud } from '../components/Hud';
import { MenuCard } from '../components/MenuCard';
import { PauseButton, PauseCard } from '../components/PauseCard';
import { ResultsCard } from '../components/ResultsCard';
import { Scene } from '../components/Scene';
import { useProgress } from '../game/progress';
import { Track, VIEW_HEIGHT } from '../game/track';
import { TRACKS } from '../game/tracks';
import { progressOf, useRaceGame } from '../game/useRaceGame';
import { useSystemEvents } from '../game/useSystemEvents';
import { pastel } from '../theme';

export default function RaceScreen() {
  const { width, height } = useWindowDimensions();
  const { progress, loaded, recordTime, setCarColor } = useProgress();
  const [newRecord, setNewRecord] = useState(false);
  const carColor = progress.carColor;

  const onFinish = useCallback((t: Track, time: number) => setNewRecord(recordTime(t.def.id, time)), [recordTime]);
  const game = useRaceGame((width / height) * VIEW_HEIGHT, onFinish);
  const { phase, view, track, paused, curtain, startRace, pause, resume, goToMenu } = game;
  const racing = phase === 'countdown' || phase === 'race';
  const nextTrack = TRACKS[TRACKS.indexOf(track) + 1] ?? null;

  const play = useCallback(() => startRace(), [startRace]);
  const playNext = useCallback(() => {
    if (nextTrack) startRace(nextTrack);
  }, [startRace, nextTrack]);

  useSystemEvents({
    onBack: () => {
      if (curtain) return true;
      if (paused) resume();
      else if (racing) pause();
      else if (phase === 'finish') goToMenu();
      else return false; // en el menú, atrás cierra la app como siempre
      return true;
    },
    onBackground: pause,
  });

  if (!loaded) return null;

  return (
    <View style={styles.screen}>
      <Scene width={width} height={height} view={view} carColor={carColor} track={track} />

      <Controls enabled={racing && !paused} onChange={game.setControls} />

      <FadeView visible={racing || phase === 'finish'} interactive={false}>
        <Hud progress={progressOf(track, view.car.x)} time={view.raceTime} color={carColor} />
      </FadeView>

      <FadeView visible={racing && !paused && !curtain} duration={300}>
        <PauseButton onPress={pause} />
      </FadeView>

      <Countdown value={paused ? null : game.countdown} />

      <FadeView visible={phase === 'menu'} style={styles.center}>
        <MenuCard
          track={track}
          carColor={carColor}
          best={progress.best}
          onSelectTrack={game.selectTrack}
          onSelectColor={setCarColor}
          onPlay={play}
        />
      </FadeView>

      <FadeView visible={paused && !curtain} style={[styles.center, styles.dim]} duration={300}>
        <PauseCard onResume={resume} onRestart={play} onMenu={goToMenu} />
      </FadeView>

      <FadeView visible={game.resultsVisible} style={styles.center} duration={900}>
        <ResultsCard
          visible={game.resultsVisible}
          track={track}
          nextTrack={nextTrack}
          time={game.result}
          best={progress.best[track.def.id] ?? null}
          newRecord={newRecord}
          onAgain={play}
          onNext={playNext}
          onMenu={goToMenu}
        />
      </FadeView>

      <FadeView visible={curtain} style={styles.curtain} interactive={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: pastel.skyTop, overflow: 'hidden', userSelect: 'none' },
  center: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  dim: { backgroundColor: 'rgba(91, 84, 128, 0.25)' },
  curtain: { backgroundColor: pastel.skyBottom },
});
