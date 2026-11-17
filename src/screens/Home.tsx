import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Eyebrow, H3, Hint, Icon, Tile } from '../components/ui';
import { MEDITACIONES } from '../content';
import { daysUntil, formatDate, todayKey, useAccess, useSettings } from '../store';
import { colors, fonts, themeName, tileGradients, tileIcon } from '../theme';
import { tr } from '../i18n';

export type Tab = 'inicio' | 'estudiar' | 'dormir' | 'hipnosis' | 'evaluaciones';

const WARM = () => [
  tr('Paso a paso también se llega.', 'Step by step, you still get there.'),
  tr('Tu esfuerzo de hoy cuenta, aunque no lo veas todavía.', 'Your effort today counts, even if you cannot see it yet.'),
  tr('Respira. Estás haciendo lo mejor que puedes.', 'Breathe. You are doing the best you can.'),
  tr('Descansar también es estudiar: tu cerebro guarda mientras duermes.', 'Resting is studying too: your brain stores what you learned while you sleep.'),
  tr('Hoy basta con dar un paso pequeño.', 'Today, one small step is enough.'),
];

const DAY_LETTERS = () => (tr('es', 'en') === 'en' ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['L', 'M', 'M', 'J', 'V', 'S', 'D']);

function thisWeek() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return DAY_LETTERS().map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return todayKey(d);
  });
}

export default function Home({ go, openProfile, play }: { go: (t: Tab) => void; openProfile: () => void; play: (id: string) => void }) {
  const { s } = useSettings();
  const { inTrial, daysLeft, premium } = useAccess();
  const h = new Date().getHours();
  const greet = h < 12 ? tr('Buenos días', 'Good morning') : h < 20 ? tr('Buenas tardes', 'Good afternoon') : tr('Buenas noches', 'Good evening');
  const days = daysUntil(s.examDate);
  const week = thisWeek();
  const activeDays = week.filter((k) => (s.listened[k] ?? 0) >= 1).length;
  const weekMinutes = Math.round(week.reduce((a, k) => a + (s.listened[k] ?? 0), 0));

  const night = themeName === 'estrellada';
  const heroIsSleep = h >= 20 || h < 7;
  const trialText = premium
    ? ''
    : inTrial
      ? tr(`Prueba gratis: ${daysLeft === 1 ? 'queda 1 día' : `quedan ${daysLeft} días`}`, `Free trial: ${daysLeft === 1 ? '1 day' : `${daysLeft} days`} left`)
      : '';
  const moods: { label: string; go: () => void }[] = [
    { label: tr('😌 En calma', '😌 Calm'), go: () => go('estudiar') },
    { label: tr('😴 Con sueño', '😴 Sleepy'), go: () => go('dormir') },
    { label: tr('😰 Con nervios', '😰 Nervous'), go: () => go('evaluaciones') },
  ];
  const tiles = [
    heroIsSleep
      ? { k: 'estudiar' as const, icon: 'book' as const, title: tr('Estudiar con foco', 'Focused study'), sub: tr('Pomodoros y sonidos', 'Pomodoros and sounds'), on: () => go('estudiar') }
      : { k: 'dormir' as const, icon: 'moon' as const, title: tr('Dormir', 'Sleep'), sub: tr('Lluvia, olas y más', 'Rain, waves and more'), on: () => go('dormir') },
    { k: 'calma' as const, icon: 'wind' as const, title: tr('Calmarme ahora', 'Calm down now'), sub: tr('Meditaciones de 3 min', '3-minute meditations'), on: () => go('evaluaciones') },
    { k: 'hipnosis' as const, icon: 'spiral' as const, title: tr('Hipnosis', 'Hypnosis'), sub: tr('Sueño, ansiedad, memoria', 'Sleep, anxiety, memory'), on: () => go('hipnosis') },
    { k: 'noche' as const, icon: 'star' as const, title: tr('Noche antes', 'Night before'), sub: tr('Para la víspera', 'For the eve of your exam'), on: () => play(MEDITACIONES[0].id) },
  ];
  const ring = days === null ? 0 : Math.max(0.06, Math.min(1, days / 30));

  return (
    <View>
      <View style={st.top}>
        <Eyebrow>{greet}</Eyebrow>
        <Pressable style={st.avatar} onPress={openProfile} accessibilityLabel={tr('Mi espacio', 'My space')} accessibilityRole="button">
          <Text style={st.avatarText}>M</Text>
        </Pressable>
      </View>
      <Text style={st.title}>{tr('¿Cómo quieres sentirte hoy?', 'How do you want to feel today?')}</Text>
      <Text style={st.warm}>{WARM()[new Date().getDate() % 5]}</Text>

      <View style={st.moods}>
        {moods.map((m, i) => (
          <Pressable key={i} onPress={m.go} style={({ pressed }) => [st.mood, pressed && { opacity: 0.8 }]} accessibilityRole="button">
            <Text style={st.moodText}>{m.label}</Text>
          </Pressable>
        ))}
      </View>

      {!premium && !inTrial && (
        <View style={st.trial}>
          <Text style={st.trialText}>{tr('Tu prueba gratis terminó. Suscríbete para seguir con todo NeuroTrance.', 'Your free trial has ended. Subscribe to keep all of NeuroTrance.')}</Text>
        </View>
      )}

      <View style={st.count}>
        {!night && days !== null && (
          <View style={st.ringWrap}>
            <Svg width={62} height={62} viewBox="0 0 62 62">
              <Circle cx={31} cy={31} r={26} stroke={colors.lilacSoft} strokeWidth={7} fill="none" />
              <Circle cx={31} cy={31} r={26} stroke="#a8e6cf" strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 26}`} strokeDashoffset={`${2 * Math.PI * 26 * (1 - ring)}`} transform="rotate(-90 31 31)" />
            </Svg>
            <Text style={st.ringN}>{days}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          {night || days === null ? (
            <Text style={st.countLabel}>{days === null ? tr('Tu próxima evaluación', 'Your next exam') : tr('Faltan para tu evaluación', 'Until your exam')}</Text>
          ) : (
            <Text style={st.countTitle}>{days === 1 ? tr('día para tu evaluación', 'day until your exam') : tr('días para tu evaluación', 'days until your exam')}</Text>
          )}
          <Text style={st.small}>
            {s.examDate ? formatDate(s.examDate) : tr('Agrega la fecha en Mi espacio', 'Add the date in My space')}
            {trialText ? ` · ${trialText}` : ''}
          </Text>
        </View>
        {night && days !== null && (
          <Text style={st.n}>
            {days}
            <Text style={st.nUnit}> {days === 1 ? tr('día', 'day') : tr('días', 'days')}</Text>
          </Text>
        )}
      </View>

      <Pressable onPress={() => go(heroIsSleep ? 'dormir' : 'estudiar')} style={({ pressed }) => [pressed && { opacity: 0.9 }]} accessibilityRole="button">
        <LinearGradient colors={tileGradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.hero}>
          <View style={st.heroGlow} />
          <Text style={st.heroEyebrow}>{tr('Recomendado para ahora', 'Recommended for now')}</Text>
          <Text style={st.heroTitle}>{heroIsSleep ? tr('Dormir profundo', 'Sleep deeply') : tr('Estudiar con foco', 'Focused study')}</Text>
          <Text style={st.heroSub}>
            {heroIsSleep
              ? tr('Sonidos para la noche que se apagan solos', 'Night sounds that turn off by themselves')
              : tr('Pomodoros de 25 a 55 min con sonidos para concentrarte', 'Pomodoros from 25 to 55 min with sounds to help you focus')}
          </Text>
          <View style={st.heroBtn}>
            <Icon name="play" color={night ? '#2c2a6b' : colors.text} size={14} />
            <Text style={st.heroBtnText}>{tr('Empezar', 'Start')}</Text>
          </View>
        </LinearGradient>
      </Pressable>

      <View style={st.grid}>
        {tiles.map((t) => (
          <Tile key={t.k} title={t.title} sub={t.sub} grad={tileGradients[t.k]} icon={t.icon} iconColor={tileIcon(t.k)} onPress={t.on} />
        ))}
      </View>

      <H3>{tr('Tu semana', 'Your week')}</H3>
      <View style={st.stat}>
        <View style={st.statBox}>
          <Text style={st.statN}>{activeDays}</Text>
          <Text style={st.small}>{activeDays === 1 ? tr('día con calma', 'calm day') : tr('días con calma', 'calm days')}</Text>
        </View>
        <View style={st.statBox}>
          <Text style={st.statN}>{weekMinutes}</Text>
          <Text style={st.small}>{tr('minutos de calma', 'calm minutes')}</Text>
        </View>
      </View>
      <View style={st.week}>
        {week.map((k, i) => {
          const on = (s.listened[k] ?? 0) >= 1;
          return (
            <View key={k} style={[st.day, on && { backgroundColor: colors.tealSoft }]}>
              <Text style={[st.dayText, on && { color: colors.teal }]}>{DAY_LETTERS()[i]}</Text>
            </View>
          );
        })}
      </View>
      {weekMinutes === 0 && <Hint>{tr('Cuando escuches tu primer audio, aquí verás tus días de calma.', 'Once you listen to your first audio, your calm days will show up here.')}</Hint>}
    </View>
  );
}

const glass = colors.glass ? { borderWidth: 1, borderColor: colors.line } : { boxShadow: '0 10px 28px rgba(122,102,207,0.13)' };
const st = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: fonts.display, fontSize: themeName === 'estrellada' ? 31 : 28, lineHeight: themeName === 'estrellada' ? 36 : 34, color: colors.text, marginTop: 8, marginBottom: 4 },
  warm: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.muted, marginBottom: 14 },
  moods: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  mood: { backgroundColor: colors.card, borderRadius: 99, paddingVertical: 8, paddingHorizontal: 13, ...glass },
  moodText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.text },
  trial: { borderWidth: 1, borderColor: colors.moon, borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12 },
  trialText: { fontFamily: fonts.bodySemi, fontSize: 13, lineHeight: 19, color: colors.text },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: themeName === 'algodon' ? '#ffd8c2' : colors.card, borderWidth: colors.glass ? 1 : 0, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: themeName === 'algodon' ? '#b5603f' : colors.moon, fontFamily: fonts.display, fontSize: 16 },
  count: { backgroundColor: colors.card, borderRadius: 26, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, ...glass },
  ringWrap: { width: 62, height: 62, alignItems: 'center', justifyContent: 'center' },
  ringN: { position: 'absolute', fontFamily: fonts.display, fontSize: 20, color: colors.text },
  countLabel: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.muted },
  countTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  n: { fontFamily: fonts.display, fontSize: 38, color: colors.moon },
  nUnit: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
  small: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 2 },
  hero: { marginTop: 14, borderRadius: 28, padding: 18, minHeight: 172, overflow: 'hidden' },
  heroGlow: {
    position: 'absolute',
    right: -50,
    top: -45,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: themeName === 'estrellada' ? '#f3d08d' : '#ffffff8c',
    opacity: themeName === 'estrellada' ? 0.85 : 1,
  },
  heroEyebrow: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: themeName === 'estrellada' ? '#ffe2a8' : '#9a5a3a' },
  heroTitle: { fontFamily: fonts.display, fontSize: 24, color: themeName === 'estrellada' ? '#ffffff' : colors.text, marginTop: 6 },
  heroSub: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: themeName === 'estrellada' ? '#e3e0ff' : '#5b5378', marginTop: 4, width: '78%' },
  heroBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: '#ffffff', borderRadius: 99, paddingVertical: 8, paddingHorizontal: 16, marginTop: 14 },
  heroBtnText: { fontFamily: fonts.bodyBold, fontSize: 13, color: themeName === 'estrellada' ? '#2c2a6b' : colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, marginTop: 10 },
  stat: { flexDirection: 'row', gap: 10 },
  statBox: { flex: 1, backgroundColor: colors.card, borderRadius: 22, padding: 12, ...glass },
  statN: { fontFamily: fonts.display, fontSize: 22, color: colors.moon },
  week: { flexDirection: 'row', gap: 6, marginTop: 10 },
  day: { flex: 1, aspectRatio: 1, borderRadius: 10, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
});
