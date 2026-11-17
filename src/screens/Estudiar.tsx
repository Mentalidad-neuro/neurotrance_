import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { Eyebrow, H2, H3, Hint, Pill } from '../components/ui';
import StudyList from '../components/StudyList';
import { ESTUDIO, LONG_REST, POMODOROS, Track } from '../content';
import { cancelPomodoroEnd, schedulePomodoroEnd } from '../notifications';
import { useAccess, useSettings } from '../store';
import { colors, fonts } from '../theme';
import { tr } from '../i18n';

type Phase = 'idle' | 'focus' | 'rest';
const BLOCKS = 4;
const chimeSource = require('../../assets/audio/campana.mp3');

const mmss = (ms: number) => {
  const t = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

export default function Estudiar({ locked }: { locked: (t: Track) => void }) {
  const { addListening } = useSettings();
  const { isLocked } = useAccess();
  const [plan, setPlan] = useState(POMODOROS[0]);
  const [soundId, setSoundId] = useState<string | null>(ESTUDIO[0].id);
  const [phase, setPhase] = useState<Phase>('idle');
  const [block, setBlock] = useState(1);
  const [running, setRunning] = useState(false);
  const [endAt, setEndAt] = useState(0);
  const [left, setLeft] = useState(plan.focus * 60000);
  const [, setTick] = useState(0);

  const sound = ESTUDIO.find((t) => t.id === soundId) ?? null;
  const player = useAudioPlayer(sound?.source ?? null);
  const chime = useAudioPlayer(chimeSource);
  const focusMs = useRef(0);

  const restMin = block % BLOCKS === 0 ? LONG_REST : plan.rest;
  const phaseTotal = (phase === 'rest' ? restMin : plan.focus) * 60000;
  const remaining = running ? endAt - Date.now() : left;

  // Sonido de fondo solo durante la concentración.
  useEffect(() => {
    player.loop = true;
    if (running && phase === 'focus' && sound) player.play();
    else player.pause();
  }, [running, phase, sound, player]);

  // Reloj.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTick((n) => n + 1);
      if (phase === 'focus') focusMs.current += 500;
      if (Date.now() >= endAt) nextPhase();
    }, 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, endAt, phase]);

  useEffect(
    () => () => {
      cancelPomodoroEnd();
      if (focusMs.current > 0) addListening(focusMs.current / 60000);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  function ring() {
    try {
      chime.seekTo(0);
      chime.play();
    } catch {}
  }

  function startPhase(p: Phase, minutes: number) {
    const end = Date.now() + minutes * 60000;
    setPhase(p);
    setEndAt(end);
    setLeft(minutes * 60000);
    setRunning(true);
    schedulePomodoroEnd(
      new Date(end),
      p === 'focus' ? tr('Bloque terminado', 'Block finished') : tr('Fin del descanso', 'Break is over'),
      p === 'focus' ? tr('Muy bien. Levántate, toma agua y respira.', 'Well done. Stand up, drink some water and breathe.') : tr('Volvamos a concentrarnos.', 'Let us get back to focusing.'),
    );
  }

  function nextPhase() {
    ring();
    if (focusMs.current > 0) {
      addListening(focusMs.current / 60000);
      focusMs.current = 0;
    }
    if (phase === 'focus') startPhase('rest', restMin);
    else {
      setBlock((b) => (b % BLOCKS) + 1);
      startPhase('focus', plan.focus);
    }
  }

  function start() {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'mixWithOthers' }).catch(() => {});
    if (phase === 'idle') startPhase('focus', plan.focus);
    else {
      const end = Date.now() + left;
      setEndAt(end);
      setRunning(true);
      schedulePomodoroEnd(new Date(end), phase === 'focus' ? tr('Bloque terminado', 'Block finished') : tr('Fin del descanso', 'Break is over'), tr('Toca para volver a NeuroTrance.', 'Tap to go back to NeuroTrance.'));
    }
  }

  function pause() {
    setLeft(Math.max(0, endAt - Date.now()));
    setRunning(false);
    cancelPomodoroEnd();
  }

  function reset() {
    setRunning(false);
    setPhase('idle');
    setBlock(1);
    setLeft(plan.focus * 60000);
    cancelPomodoroEnd();
  }

  function choosePlan(p: (typeof POMODOROS)[number]) {
    setPlan(p);
    if (phase === 'idle') setLeft(p.focus * 60000);
  }

  function chooseSound(t: Track | null) {
    if (t && isLocked(t)) return locked(t);
    setSoundId(t ? t.id : null);
  }

  const progress = phase === 'idle' ? 0 : 1 - Math.max(0, remaining) / phaseTotal;
  const label = phase === 'idle' ? tr('Listo para empezar', 'Ready to start') : phase === 'focus' ? tr('Concentración', 'Focus') : restMin === LONG_REST ? tr('Descanso largo', 'Long break') : tr('Descanso', 'Break');

  return (
    <View>
      <Eyebrow color={colors.teal}>{tr('Concentración', 'Focus')}</Eyebrow>
      <H2>{tr('Estudiar con foco', 'Focused study')}</H2>

      <View style={[st.card, phase === 'rest' && { backgroundColor: colors.success }]}>
        <Text style={[st.phase, phase === 'rest' && { color: colors.teal }]}>{label}</Text>
        <Text style={st.clock} accessibilityRole="timer">
          {mmss(phase === 'idle' ? plan.focus * 60000 : remaining)}
        </Text>
        <Text style={st.blocks}>
          {tr(`Bloque ${block} de ${BLOCKS}`, `Block ${block} of ${BLOCKS}`)}
          {phase === 'rest' ? tr(' · levántate y toma agua', ' · stand up and drink water') : sound && phase === 'focus' ? ` · ${sound.title}` : ''}
        </Text>
        <View style={st.bar}>
          <View style={[st.barFill, { width: `${progress * 100}%` }, phase === 'rest' && { backgroundColor: colors.teal }]} />
        </View>
        <View style={st.btnRow}>
          <Pressable onPress={running ? pause : start} style={st.main} accessibilityRole="button">
            <Text style={st.mainText}>{running ? tr('Pausar', 'Pause') : phase === 'idle' ? tr('Empezar', 'Start') : tr('Seguir', 'Resume')}</Text>
          </Pressable>
          {phase !== 'idle' && (
            <Pressable onPress={phase === 'rest' ? nextPhase : reset} style={st.second} accessibilityRole="button">
              <Text style={st.secondText}>{phase === 'rest' ? tr('Saltar descanso', 'Skip break') : tr('Reiniciar', 'Reset')}</Text>
            </Pressable>
          )}
        </View>
      </View>

      <H3>{tr('Lo que voy a estudiar', 'What I will study')}</H3>
      <StudyList />

      <H3>{tr('Tiempo de concentración', 'Focus time')}</H3>
      <View style={st.chips}>
        {POMODOROS.map((p) => {
          const on = p.focus === plan.focus;
          return (
            <Pressable key={p.focus} onPress={() => choosePlan(p)} style={[st.chip, on && st.chipOn]} accessibilityRole="radio" accessibilityState={{ selected: on }}>
              <Text style={[st.chipN, on && { color: colors.sky }]}>{p.focus}</Text>
              <Text style={[st.chipSub, on && { color: colors.sky }]}>min</Text>
            </Pressable>
          );
        })}
      </View>
      <Hint>
        {tr(
          `Descanso de ${plan.rest} minutos entre bloques y de ${LONG_REST} minutos después del cuarto. Suena una campana suave al cambiar.`,
          `A ${plan.rest}-minute break between blocks and ${LONG_REST} minutes after the fourth. A soft bell rings at each change.`,
        )}
      </Hint>

      <H3>{tr('Sonido para concentrarte', 'Sound to help you focus')}</H3>
      <View style={{ gap: 8 }}>
        {ESTUDIO.map((t) => {
          const on = t.id === soundId;
          const lockedNow = isLocked(t);
          return (
            <Pressable key={t.id} onPress={() => chooseSound(t)} style={[st.item, on && st.itemOn]} accessibilityRole="radio" accessibilityState={{ selected: on }}>
              <View style={st.ic}>
                <Text style={st.icText}>{t.icon}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <Text style={st.itemTitle}>{t.title}</Text>
                  {t.tag ? <Pill text={t.tag} /> : null}
                  {lockedNow ? <Pill text={tr('suscripción', 'subscription')} soft /> : null}
                </View>
                <Text style={st.itemSub}>{t.subtitle}</Text>
              </View>
              <Text style={st.radio}>{lockedNow ? '🔒' : on ? '●' : '○'}</Text>
            </Pressable>
          );
        })}
        <Pressable onPress={() => chooseSound(null)} style={[st.item, soundId === null && st.itemOn]} accessibilityRole="radio" accessibilityState={{ selected: soundId === null }}>
          <View style={st.ic}>
            <Text style={st.icText}>–</Text>
          </View>
          <Text style={[st.itemTitle, { flex: 1 }]}>{tr('Sin sonido', 'No sound')}</Text>
          <Text style={st.radio}>{soundId === null ? '●' : '○'}</Text>
        </Pressable>
      </View>
      <Hint>{tr('Las ondas binaurales funcionan con audífonos: cada oído recibe un tono distinto y el cerebro percibe la diferencia.', 'Binaural waves work with headphones: each ear hears a different tone and the brain perceives the difference.')}</Hint>
    </View>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 28, padding: 18, alignItems: 'center' },
  phase: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 1.3, textTransform: 'uppercase', color: colors.moon },
  clock: { fontFamily: fonts.display, fontSize: 64, color: colors.text, marginVertical: 4, fontVariant: ['tabular-nums'] },
  blocks: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, textAlign: 'center' },
  bar: { alignSelf: 'stretch', height: 4, borderRadius: 4, backgroundColor: colors.line, overflow: 'hidden', marginTop: 14 },
  barFill: { height: 4, backgroundColor: colors.moon },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 16, alignSelf: 'stretch' },
  main: { flex: 1, backgroundColor: colors.moon, borderRadius: 18, paddingVertical: 13, alignItems: 'center' },
  mainText: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.sky },
  second: { flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 18, paddingVertical: 13, alignItems: 'center' },
  secondText: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.text },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 18, paddingVertical: 10, alignItems: 'center' },
  chipOn: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipN: { fontFamily: fonts.display, fontSize: 20, color: colors.text },
  chipSub: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: 22, padding: 12, borderWidth: 1, borderColor: 'transparent' },
  itemOn: { borderColor: colors.teal },
  ic: { width: 42, height: 42, borderRadius: 15, backgroundColor: colors.sky2, alignItems: 'center', justifyContent: 'center' },
  icText: { color: colors.teal, fontFamily: fonts.display, fontSize: 16 },
  itemTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  itemSub: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 2 },
  radio: { color: colors.teal, fontSize: 16 },
});
