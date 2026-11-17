import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { LinkButton } from '../components/ui';
import TranceVisual, { VISUALS, VisualKind } from '../components/TranceVisual';
import { BACKGROUNDS, findBg, type Track } from '../content';
import { useSettings } from '../store';
import { colors, fonts } from '../theme';
import Backdrop from '../components/Backdrop';
import { tr } from '../i18n';

const TIMER_OPTIONS = () => [
  { label: '15 min', min: 15 },
  { label: '30 min', min: 30 },
  { label: tr('1 hora', '1 hour'), min: 60 },
  { label: tr('Toda la noche', 'All night'), min: 0 },
];
const FADE_SECONDS = 30;
type Step = 'in' | 'hold' | 'out';
// Técnicas de respiración con sus segundos. La guía muestra cada paso con su cuenta regresiva.
export const TECHS = () => [
  { key: 'calma', label: tr('Calma 4·6', 'Calm 4·6'), steps: [['in', 4], ['out', 6]] as [Step, number][] },
  { key: 'cuadrada', label: tr('Cuadrada 4·4·4·4', 'Box 4·4·4·4'), steps: [['in', 4], ['hold', 4], ['out', 4], ['hold', 4]] as [Step, number][] },
  { key: 'dormir', label: tr('Para dormir 4·7·8', 'For sleep 4·7·8'), steps: [['in', 4], ['hold', 7], ['out', 8]] as [Step, number][] },
];
const STEP_LABEL = (k: Step) => (k === 'in' ? tr('Inhala', 'Breathe in') : k === 'out' ? tr('Exhala', 'Breathe out') : tr('Sostén', 'Hold'));
const BREATH_MIN = [1, 3, 5];

// Íconos simples para cada sonido de fondo.
function BgIcon({ k, color }: { k: string; color: string }) {
  const p = { stroke: color, strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const d: Record<string, string[]> = {
    ninguno: ['M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18', 'M5.6 5.6l12.8 12.8'],
    lluvia: ['M7 14h10a4 4 0 0 0 .4-8A5.5 5.5 0 0 0 7 7a3.5 3.5 0 0 0 0 7', 'M8 17l-1 3', 'M12 17l-1 3', 'M16 17l-1 3'],
    agua: ['M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z'],
    mar: ['M2 16c3 0 4.5-2 5.5-5s3-6 7-6c3 0 5 1.8 5 3.8c0 1.8-1.8 2.7-3.3 2.2', 'M2 20c2.5-1.5 4.5-1.5 7 0s4.5 1.5 7 0 4.5-1.5 6 0'],
    bosque: ['M12 3l6 9h-3l4 6H5l4-6H6z', 'M12 18v3'],
    cuenco: ['M3 11h18a9 7 0 0 1-18 0z', 'M9 21h6', 'M12 7v1', 'M8.5 6.5l.6.8', 'M15.5 6.5l-.6.8'],
    ondas: ['M2 12c1.5-5 3-5 4.5 0s3 5 4.5 0 3-5 4.5 0 3 5 4.5 0 1.5-3 2 0'],
  };
  const paths = d[k] ?? d.ondas;
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      {paths.map((x, i) => (
        <Path key={i} d={x} {...p} />
      ))}
    </Svg>
  );
}

const fmt = (sec: number) => (isFinite(sec) && sec > 0 ? `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}` : '0:00');

export default function Player({ track, onClose }: { track: Track & { visual?: VisualKind }; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { s, update, toggleFavorite, addListening } = useSettings();
  const [visual, setVisual] = useState<VisualKind>(track.visual ?? 'esfera');
  const [warn, setWarn] = useState(!s.photoWarned && !!track.visual);
  const audioOnly = s.visualMode === 'audio';
  const safe = s.visualMode === 'suave';
  const isTrance = !!track.loop && track.kind === 'hipnosis';
  const hasVoice = !track.loop;
  // Visuales de trance: el sonido es el fondo que la persona elige. Sesiones con voz: la voz va aparte y el fondo suena bajo, en paralelo.
  const tranceBg = findBg(s.tranceBg === 'ninguno' ? 'theta' : s.tranceBg);
  const player = useAudioPlayer((isTrance ? tranceBg.source : track.source) ?? null, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);
  const isBreath = !!track.breathing;
  const [running, setRunning] = useState(false);
  const [breathMin, setBreathMin] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const playing = isBreath ? running : status.playing;
  const bg = findBg(s.bg);
  const bgPlayer = useAudioPlayer(hasVoice ? bg.source ?? null : null);
  const bgKey = isTrance ? tranceBg.key : hasVoice ? bg.key : null;
  const lastBg = useRef(bgKey);
  const [sleepMin, setSleepMin] = useState(30);
  const tech = TECHS().find((t) => t.key === s.breathTech) ?? TECHS()[0];
  const [ph, setPh] = useState({ i: 0, left: tech.steps[0][1] });
  const guide = useRef(new Animated.Value(0)).current;
  const [dim, setDim] = useState(false);
  const listenedSec = useRef(0);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const isLoop = !!track.loop;
  const fav = s.favorites.includes(track.id);

  // Configura el audio y empieza a sonar al abrir.
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix' }).catch(() => {});
    player.loop = isLoop;
    player.volume = 1;
    if (!warn) {
      if (isBreath) setRunning(true);
      else player.play();
    }
    if (Platform.OS !== 'web') {
      try {
        player.setActiveForLockScreen(true, { title: track.title, artist: 'NeuroTrance' });
      } catch {}
    }
    bgPlayer.loop = true;
    bgPlayer.volume = s.bgVolume;
    return () => {
      clearFade();
      if (listenedSec.current > 0) addListening(listenedSec.current / 60);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // El fondo sigue a la voz: suena cuando la voz suena y se detiene con ella.
  useEffect(() => {
    if (!hasVoice) return;
    if (playing && bg.source) bgPlayer.play();
    else bgPlayer.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, bg.key]);

  useEffect(() => {
    bgPlayer.volume = s.bgVolume;
  }, [s.bgVolume, bgPlayer]);

  // Cambio de fondo elegido.
  useEffect(() => {
    if (bgKey === lastBg.current) return;
    lastBg.current = bgKey;
    if (isTrance && tranceBg.source) {
      const was = playing;
      player.replace(tranceBg.source);
      player.loop = true;
      if (was) player.play();
    } else if (hasVoice) {
      if (bg.source) {
        bgPlayer.replace(bg.source);
        bgPlayer.loop = true;
        bgPlayer.volume = s.bgVolume;
        if (playing) bgPlayer.play();
      } else bgPlayer.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgKey]);

  const chooseBg = (k: string) => update(isTrance ? { tranceBg: k } : { bg: k });
  const stepVol = (d: number) => update({ bgVolume: Math.round(Math.min(1, Math.max(0.05, s.bgVolume + d)) * 100) / 100 });
  const bgOptions = isTrance ? BACKGROUNDS.filter((b) => b.key !== 'ninguno') : BACKGROUNDS;
  const showBinauralTip = s.headphoneTip && (isTrance ? tranceBg.binaural : hasVoice && bg.binaural);

  // Cuenta el tiempo escuchado (para "Tu semana").
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => (listenedSec.current += 1), 1000);
    return () => clearInterval(id);
  }, [playing]);

  // Guía de respiración: inhala, sostén y exhala con sus segundos. El visual crece y se achica con ella.
  useEffect(() => {
    if (!playing) {
      guide.stopAnimation();
      return;
    }
    let i = 0;
    let left = tech.steps[0][1];
    const startStep = (idx: number) => {
      const [k, sec] = tech.steps[idx];
      if (k === 'hold') return;
      Animated.timing(guide, { toValue: k === 'in' ? 1 : 0, duration: sec * 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }).start();
    };
    guide.setValue(0);
    startStep(0);
    setPh({ i, left });
    const id = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        i = (i + 1) % tech.steps.length;
        left = tech.steps[i][1];
        startStep(i);
      }
      setPh({ i, left });
    }, 1000);
    return () => {
      clearInterval(id);
      guide.stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, tech.key]);

  // Respiración guiada: cuenta los minutos y termina sola.
  useEffect(() => {
    if (!isBreath || !running) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= breathMin * 60) {
          setRunning(false);
          return breathMin * 60;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isBreath, running, breathMin]);

  const cycleTech = () => {
    const all = TECHS();
    const idx = all.findIndex((t) => t.key === tech.key);
    update({ breathTech: all[(idx + 1) % all.length].key });
  };

  // Temporizador de apagado para los sonidos de dormir: baja el volumen de a poco y se detiene.
  useEffect(() => {
    clearFade();
    if (!isLoop || !playing || sleepMin === 0) return;
    fadeTimer.current = setTimeout(() => {
      let v = 1;
      fadeInterval.current = setInterval(() => {
        v -= 1 / FADE_SECONDS;
        if (v <= 0) {
          clearFade();
          player.pause();
          player.volume = 1;
          setDim(false);
        } else player.volume = v;
      }, 1000);
    }, Math.max(0, sleepMin * 60 - FADE_SECONDS) * 1000);
    return clearFade;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sleepMin, playing, isLoop]);

  // Pantalla oscura: 20 s después de empezar un sonido para dormir.
  useEffect(() => {
    if (!playing) return;
    if (!audioOnly && (!isLoop || !s.dimScreen)) return;
    const id = setTimeout(() => setDim(true), audioOnly ? 4000 : 20000);
    return () => clearTimeout(id);
  }, [isLoop, s.dimScreen, playing, audioOnly]);

  function clearFade() {
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    if (fadeInterval.current) clearInterval(fadeInterval.current);
    fadeTimer.current = null;
    fadeInterval.current = null;
  }

  const toggle = () => {
    if (isBreath) {
      if (!running && elapsed >= breathMin * 60) setElapsed(0);
      setRunning(!running);
      return;
    }
    if (playing) player.pause();
    else {
      if (!isLoop && status.duration > 0 && status.currentTime >= status.duration - 0.5) player.seekTo(0);
      player.volume = 1;
      player.play();
    }
  };

  const progress = isBreath ? elapsed / (breathMin * 60) : !isLoop && status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;
  const breathDone = isBreath && elapsed >= breathMin * 60;

  return (
    <LinearGradient colors={[colors.gradTop, colors.sky]} locations={[0, 0.7]} style={[st.wrap, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
      <Backdrop />
      <View style={st.top}>
        <LinkButton label={tr('‹ Volver', '‹ Back')} onPress={onClose} />
        <Pressable onPress={() => toggleFavorite(track.id)} hitSlop={10} accessibilityLabel={fav ? tr('Quitar de favoritos', 'Remove from favorites') : tr('Agregar a favoritos', 'Add to favorites')}>
          <Text style={[st.heart, fav && { color: colors.moon }]}>{fav ? '♥' : '♡'}</Text>
        </Pressable>
      </View>

      <View style={st.visualWrap}>
        {audioOnly ? (
          <View style={st.audioOnly}>
            <Text style={st.audioOnlyText}>{tr('Solo audio', 'Audio only')}</Text>
          </View>
        ) : (
          <TranceVisual kind={visual} playing={playing} safe={safe} breath={guide} />
        )}
      </View>
      {!audioOnly && (
        <View style={st.vRow}>
          {VISUALS.map((v) => (
            <Pressable key={v.key} onPress={() => setVisual(v.key)} style={[st.vChip, visual === v.key && st.vChipOn]} accessibilityRole="radio" accessibilityState={{ selected: visual === v.key }}>
              <Text style={[st.vText, visual === v.key && { color: colors.sky }]}>{v.label}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={st.title}>{track.title}</Text>
      <Text style={st.sub}>{track.subtitle}</Text>

      {!isLoop && (
        <>
          <View style={st.bar}>
            <View style={[st.barFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={st.times}>
            <Text style={st.time}>{fmt(isBreath ? elapsed : status.currentTime)}</Text>
            <Text style={st.time}>{isBreath ? fmt(breathMin * 60) : status.duration > 0 ? fmt(status.duration) : track.duration}</Text>
          </View>
        </>
      )}

      <View style={{ alignItems: 'center', marginTop: 18 }}>
        <Pressable style={st.big} onPress={toggle} accessibilityRole="button" accessibilityLabel={playing ? tr('Pausar', 'Pause') : tr('Reproducir', 'Play')}>
          <Svg width={30} height={30} viewBox="0 0 24 24">
            <Path d={playing ? 'M7 5h4v14H7zM13 5h4v14h-4z' : 'M8 5v14l11-7z'} fill={colors.sky} />
          </Svg>
        </Pressable>
      </View>
      <Text style={st.cue} accessibilityLiveRegion="polite">
        {playing ? `${STEP_LABEL(tech.steps[ph.i][0])} · ${ph.left}` : breathDone ? tr('Terminaste. Bien hecho.', 'Done. Well done.') : status.isBuffering && !isBreath ? tr('Cargando…', 'Loading…') : ''}
      </Text>
      <View style={st.techRow}>
        <Pressable onPress={cycleTech} style={st.techBtn} accessibilityRole="button" accessibilityLabel={tr(`Técnica de respiración: ${tech.label}. Toca para cambiar`, `Breathing technique: ${tech.label}. Tap to change`)}>
          <Text style={st.techText}>{tr('Respiración', 'Breathing')}: {tech.label}  ⟳</Text>
        </Pressable>
        {isBreath &&
          BREATH_MIN.map((m) => (
            <Pressable key={m} onPress={() => { setBreathMin(m); setElapsed(0); }} style={[st.tBtn, breathMin === m && st.tBtnOn]} accessibilityRole="radio" accessibilityState={{ selected: breathMin === m }}>
              <Text style={[st.tText, breathMin === m && { color: colors.sky }]}>{m} min</Text>
            </Pressable>
          ))}
      </View>

      {isLoop && (
        <>
          <Text style={st.timerLabel}>{tr('Se apaga solo en', 'Turns off by itself in')}</Text>
          <View style={st.timer}>
            {TIMER_OPTIONS().map((o) => (
              <Pressable key={o.min} onPress={() => setSleepMin(o.min)} style={[st.tBtn, sleepMin === o.min && st.tBtnOn]} accessibilityRole="radio" accessibilityState={{ selected: sleepMin === o.min }}>
                <Text style={[st.tText, sleepMin === o.min && { color: colors.sky }]}>{o.label}</Text>
              </Pressable>
            ))}
          </View>
          {!isTrance && (track.tag === 'audífonos' || track.tag === 'headphones') && s.headphoneTip && <Text style={st.tip}>{tr('Ponte audífonos: cada oído recibe un tono distinto.', 'Put on headphones: each ear hears a different tone.')}</Text>}
        </>
      )}

      {(hasVoice || isTrance) && (
        <View style={st.bgBox}>
          <Text style={st.timerLabel}>{tr('Sonido de fondo', 'Background sound')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.bgRow}>
            {bgOptions.map((b) => {
              const on = bgKey === b.key;
              return (
                <Pressable key={b.key} onPress={() => chooseBg(b.key)} style={[st.tBtn, st.bgChip, on && st.tBtnOn]} accessibilityRole="radio" accessibilityState={{ selected: on }}>
                  <BgIcon k={b.binaural ? 'ondas' : b.key} color={on ? colors.sky : colors.muted} />
                  <Text style={[st.tText, on && { color: colors.sky }]}>{b.label()}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {hasVoice && bg.source && (
            <View style={st.volRow}>
              <Pressable onPress={() => stepVol(-0.1)} hitSlop={8} style={st.volBtn} accessibilityRole="button" accessibilityLabel={tr('Bajar el fondo', 'Lower the background')}>
                <Text style={st.volSign}>−</Text>
              </Pressable>
              <View style={st.volBar} accessibilityLabel={tr(`Volumen del fondo ${Math.round(s.bgVolume * 100)}%`, `Background volume ${Math.round(s.bgVolume * 100)}%`)}>
                <View style={[st.volFill, { width: `${s.bgVolume * 100}%` }]} />
              </View>
              <Pressable onPress={() => stepVol(0.1)} hitSlop={8} style={st.volBtn} accessibilityRole="button" accessibilityLabel={tr('Subir el fondo', 'Raise the background')}>
                <Text style={st.volSign}>+</Text>
              </Pressable>
            </View>
          )}
          {showBinauralTip && <Text style={st.tip}>{tr('Ponte audífonos: cada oído recibe un tono distinto.', 'Put on headphones: each ear hears a different tone.')}</Text>}
        </View>
      )}

      {warn && (
        <View style={st.warn}>
          <Text style={st.warnTitle}>{tr('Antes de empezar', 'Before you start')}</Text>
          <Text style={st.warnText}>
            {tr(
              'Esta sesión tiene imágenes en movimiento lento. No tienen destellos ni parpadeos, pero si tienes epilepsia o eres sensible a la luz, elige la opción que te dé más seguridad.',
              'This session has slowly moving images. They have no flashes or flicker, but if you have epilepsy or are sensitive to light, choose the option that feels safest for you.',
            )}
          </Text>
          {[
            { mode: 'normal' as const, label: tr('Ver visuales', 'Show visuals'), sub: tr('Movimiento lento y suave', 'Slow, gentle movement') },
            { mode: 'suave' as const, label: tr('Modo suave', 'Gentle mode'), sub: tr('Más lento, menos movimiento y menos contraste', 'Slower, less movement and less contrast') },
            { mode: 'audio' as const, label: tr('Solo audio', 'Audio only'), sub: tr('Pantalla oscura, sin imágenes', 'Dark screen, no images') },
          ].map((o) => (
            <Pressable
              key={o.mode}
              style={st.warnBtn}
              onPress={() => {
                update({ visualMode: o.mode, photoWarned: true });
                setWarn(false);
                if (isBreath) setRunning(true);
                else player.play();
              }}
              accessibilityRole="button"
            >
              <Text style={st.warnBtnTitle}>{o.label}</Text>
              <Text style={st.warnBtnSub}>{o.sub}</Text>
            </Pressable>
          ))}
          <Text style={st.warnSmall}>{tr('Puedes cambiarlo cuando quieras en Mi espacio.', 'You can change this anytime in My space.')}</Text>
        </View>
      )}

      {dim && (
        <Pressable style={st.dim} onPress={() => setDim(false)} accessibilityLabel={tr('Mostrar la pantalla', 'Show the screen')}>
          <Text style={st.dimText}>{tr('Sigue sonando. Toca para ver.', 'Still playing. Tap to see.')}</Text>
        </Pressable>
      )}
    </LinearGradient>
  );
}

const st = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFill, paddingHorizontal: 22, zIndex: 10 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heart: { fontSize: 24, color: colors.muted },
  visualWrap: { alignSelf: 'center', marginTop: 12, marginBottom: 6, width: 240, height: 240, alignItems: 'center', justifyContent: 'center' },
  audioOnly: { width: 200, height: 200, borderRadius: 100, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  audioOnlyText: { color: colors.muted, fontFamily: fonts.bodySemi, fontSize: 13 },
  vRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 14 },
  vChip: { borderWidth: 1, borderColor: colors.line, borderRadius: 99, paddingVertical: 5, paddingHorizontal: 10 },
  vChipOn: { backgroundColor: colors.lilac, borderColor: colors.lilac },
  vText: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.muted },
  warn: { ...StyleSheet.absoluteFill, backgroundColor: colors.sky, padding: 26, justifyContent: 'center', gap: 10 },
  warnTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.text },
  warnText: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.muted, marginBottom: 6 },
  warnBtn: { backgroundColor: colors.card, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: colors.line },
  warnBtnTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  warnBtnSub: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 2 },
  warnSmall: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 6 },
  orbWrap: { alignSelf: 'center', borderRadius: 100, marginTop: 24, marginBottom: 24, shadowColor: colors.lilac, shadowOpacity: 0.35, shadowRadius: 40, shadowOffset: { width: 0, height: 0 } },
  orb: { width: 200, height: 200, borderRadius: 100 },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.text, textAlign: 'center' },
  sub: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 6, marginBottom: 12 },
  bar: { height: 4, borderRadius: 4, backgroundColor: colors.line, overflow: 'hidden' },
  barFill: { height: 4, backgroundColor: colors.moon },
  times: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  time: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  big: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.moon, alignItems: 'center', justifyContent: 'center' },
  cue: { textAlign: 'center', color: colors.teal, fontFamily: fonts.bodySemi, marginTop: 14, minHeight: 20 },
  timerLabel: { textAlign: 'center', color: colors.muted, fontFamily: fonts.body, fontSize: 12, marginTop: 12 },
  timer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 },
  tBtn: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 99, paddingVertical: 7, paddingHorizontal: 12 },
  tBtnOn: { backgroundColor: colors.teal, borderColor: colors.teal },
  tText: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.muted },
  tip: { textAlign: 'center', color: colors.blue, fontFamily: fonts.body, fontSize: 12, marginTop: 12 },
  bgBox: { marginTop: 4 },
  techRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 8 },
  techBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 99, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  techText: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.text },
  bgChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bgRow: { gap: 8, paddingHorizontal: 4, paddingTop: 8 },
  volRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, paddingHorizontal: 20 },
  volBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  volSign: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.text, lineHeight: 20 },
  volBar: { flex: 1, height: 6, borderRadius: 6, backgroundColor: colors.line, overflow: 'hidden' },
  volFill: { height: 6, backgroundColor: colors.teal },
  dim: { ...StyleSheet.absoluteFill, backgroundColor: '#000', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 60 },
  dimText: { color: '#ffffff30', fontFamily: fonts.body, fontSize: 13 },
});
