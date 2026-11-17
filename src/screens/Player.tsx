import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { LinkButton } from '../components/ui';
import type { Track } from '../content';
import { useSettings } from '../store';
import { colors, fonts } from '../theme';

const TIMER_OPTIONS = [
  { label: '15 min', min: 15 },
  { label: '30 min', min: 30 },
  { label: '1 hora', min: 60 },
  { label: 'Toda la noche', min: 0 },
];
const FADE_SECONDS = 30;
const CUES = ['Inhala…', 'Sostén…', 'Exhala…'];

const fmt = (sec: number) => (isFinite(sec) && sec > 0 ? `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}` : '0:00');

export default function Player({ track, onClose }: { track: Track; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { s, toggleFavorite, addListening } = useSettings();
  const player = useAudioPlayer(track.source ?? null, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);
  const [sleepMin, setSleepMin] = useState(30);
  const [cue, setCue] = useState(0);
  const [dim, setDim] = useState(false);
  const listenedSec = useRef(0);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathe = useRef(new Animated.Value(0.9)).current;
  const isLoop = !!track.loop;
  const fav = s.favorites.includes(track.id);

  // Configura el audio y empieza a sonar al abrir.
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix' }).catch(() => {});
    player.loop = isLoop;
    player.volume = 1;
    player.play();
    if (Platform.OS !== 'web') {
      try {
        player.setActiveForLockScreen(true, { title: track.title, artist: 'NeuroTrance' });
      } catch {}
    }
    return () => {
      clearFade();
      if (listenedSec.current > 0) addListening(listenedSec.current / 60);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuenta el tiempo escuchado (para "Tu semana").
  useEffect(() => {
    if (!status.playing) return;
    const id = setInterval(() => (listenedSec.current += 1), 1000);
    return () => clearInterval(id);
  }, [status.playing]);

  // Guía de respiración y esfera que respira.
  useEffect(() => {
    if (!status.playing) {
      breathe.stopAnimation();
      return;
    }
    const id = setInterval(() => setCue((c) => (c + 1) % 3), 4000);
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.05, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0.9, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => {
      clearInterval(id);
      anim.stop();
    };
  }, [status.playing, breathe]);

  // Temporizador de apagado para los sonidos de dormir: baja el volumen de a poco y se detiene.
  useEffect(() => {
    clearFade();
    if (!isLoop || !status.playing || sleepMin === 0) return;
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
  }, [sleepMin, status.playing, isLoop]);

  // Pantalla oscura: 20 s después de empezar un sonido para dormir.
  useEffect(() => {
    if (!isLoop || !s.dimScreen || !status.playing) return;
    const id = setTimeout(() => setDim(true), 20000);
    return () => clearTimeout(id);
  }, [isLoop, s.dimScreen, status.playing]);

  function clearFade() {
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    if (fadeInterval.current) clearInterval(fadeInterval.current);
    fadeTimer.current = null;
    fadeInterval.current = null;
  }

  const toggle = () => {
    if (status.playing) player.pause();
    else {
      if (!isLoop && status.duration > 0 && status.currentTime >= status.duration - 0.5) player.seekTo(0);
      player.volume = 1;
      player.play();
    }
  };

  const progress = !isLoop && status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;

  return (
    <LinearGradient colors={['#2c3766', colors.sky]} locations={[0, 0.7]} style={[st.wrap, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
      <View style={st.top}>
        <LinkButton label="‹ Volver" onPress={onClose} />
        <Pressable onPress={() => toggleFavorite(track.id)} hitSlop={10} accessibilityLabel={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
          <Text style={[st.heart, fav && { color: colors.moon }]}>{fav ? '♥' : '♡'}</Text>
        </Pressable>
      </View>

      <Animated.View style={[st.orbWrap, { transform: [{ scale: breathe }] }]}>
        <LinearGradient colors={['#fbeee0', colors.moon, colors.lilac, '#5f6fa8']} locations={[0, 0.25, 0.6, 1]} start={{ x: 0.3, y: 0.2 }} end={{ x: 0.8, y: 1 }} style={st.orb} />
      </Animated.View>

      <Text style={st.title}>{track.title}</Text>
      <Text style={st.sub}>{track.subtitle}</Text>

      {!isLoop && (
        <>
          <View style={st.bar}>
            <View style={[st.barFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={st.times}>
            <Text style={st.time}>{fmt(status.currentTime)}</Text>
            <Text style={st.time}>{status.duration > 0 ? fmt(status.duration) : track.duration}</Text>
          </View>
        </>
      )}

      <View style={{ alignItems: 'center', marginTop: 18 }}>
        <Pressable style={st.big} onPress={toggle} accessibilityRole="button" accessibilityLabel={status.playing ? 'Pausar' : 'Reproducir'}>
          <Svg width={30} height={30} viewBox="0 0 24 24">
            <Path d={status.playing ? 'M7 5h4v14H7zM13 5h4v14h-4z' : 'M8 5v14l11-7z'} fill={colors.sky} />
          </Svg>
        </Pressable>
      </View>
      <Text style={st.cue}>{status.playing ? CUES[cue] : status.isBuffering ? 'Cargando…' : ''}</Text>

      {isLoop && (
        <>
          <Text style={st.timerLabel}>Se apaga solo en</Text>
          <View style={st.timer}>
            {TIMER_OPTIONS.map((o) => (
              <Pressable key={o.min} onPress={() => setSleepMin(o.min)} style={[st.tBtn, sleepMin === o.min && st.tBtnOn]} accessibilityRole="radio" accessibilityState={{ selected: sleepMin === o.min }}>
                <Text style={[st.tText, sleepMin === o.min && { color: colors.sky }]}>{o.label}</Text>
              </Pressable>
            ))}
          </View>
          {track.tag === 'audífonos' && s.headphoneTip && <Text style={st.tip}>Ponte audífonos: cada oído recibe un tono distinto.</Text>}
        </>
      )}

      {dim && (
        <Pressable style={st.dim} onPress={() => setDim(false)} accessibilityLabel="Mostrar la pantalla">
          <Text style={st.dimText}>Sigue sonando. Toca para ver.</Text>
        </Pressable>
      )}
    </LinearGradient>
  );
}

const st = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFill, paddingHorizontal: 22, zIndex: 10 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heart: { fontSize: 24, color: colors.muted },
  orbWrap: { alignSelf: 'center', borderRadius: 100, marginTop: 24, marginBottom: 24, shadowColor: colors.lilac, shadowOpacity: 0.35, shadowRadius: 40, shadowOffset: { width: 0, height: 0 } },
  orb: { width: 200, height: 200, borderRadius: 100 },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.text, textAlign: 'center' },
  sub: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 6, marginBottom: 18 },
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
  dim: { ...StyleSheet.absoluteFill, backgroundColor: '#000', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 60 },
  dimText: { color: '#ffffff30', fontFamily: fonts.body, fontSize: 13 },
});
