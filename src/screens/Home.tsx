import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Eyebrow, H2, H3, Hint, Tile } from '../components/ui';
import { MEDITACIONES } from '../content';
import { daysUntil, formatDate, todayKey, useAccess, useSettings } from '../store';
import { colors, fonts, tileGradients } from '../theme';
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

  return (
    <View>
      <View style={st.top}>
        <Eyebrow>{greet}</Eyebrow>
        <Pressable style={st.avatar} onPress={openProfile} accessibilityLabel={tr('Mi espacio', 'My space')} accessibilityRole="button">
          <Text style={st.avatarText}>M</Text>
        </Pressable>
      </View>
      <H2>{tr('¿Cómo quieres sentirte hoy?', 'How do you want to feel today?')}</H2>
      <Text style={st.warm}>{WARM()[new Date().getDate() % 5]}</Text>

      {!premium && (
        <View style={[st.trial, !inTrial && { borderColor: colors.moon }]}>
          <Text style={st.trialText}>
            {inTrial
              ? tr(
                  `Prueba gratis: te ${daysLeft === 1 ? 'queda 1 día' : `quedan ${daysLeft} días`} con todo NeuroTrance libre.`,
                  `Free trial: ${daysLeft === 1 ? '1 day' : `${daysLeft} days`} left with all of NeuroTrance unlocked.`,
                )
              : tr('Tu prueba gratis terminó. Suscríbete para seguir con todo NeuroTrance.', 'Your free trial has ended. Subscribe to keep all of NeuroTrance.')}
          </Text>
        </View>
      )}

      <View style={st.count}>
        <View style={{ flex: 1 }}>
          <Eyebrow>{days === null ? tr('Tu próxima evaluación', 'Your next exam') : tr('Faltan para tu evaluación', 'Until your exam')}</Eyebrow>
          <Text style={st.small}>{s.examDate ? formatDate(s.examDate) : tr('Agrega la fecha en Mi espacio', 'Add the date in My space')}</Text>
        </View>
        {days !== null && (
          <Text style={st.n}>
            {days}
            <Text style={st.nUnit}> {days === 1 ? tr('día', 'day') : tr('días', 'days')}</Text>
          </Text>
        )}
      </View>

      <H3>{tr('Elige', 'Choose')}</H3>
      <View style={st.grid}>
        <Tile wide title={tr('Estudiar con foco', 'Focused study')} sub={tr('Pomodoros de 25 a 55 min con sonidos para concentrarte', 'Pomodoros from 25 to 55 min with sounds to help you focus')} grad={tileGradients.estudiar} onPress={() => go('estudiar')} />
        <Tile title={tr('Dormir', 'Sleep')} sub={tr('Sonidos y apagado automático', 'Sounds with auto shut-off')} grad={tileGradients.dormir} onPress={() => go('dormir')} />
        <Tile title={tr('Calmarme ahora', 'Calm down now')} sub={tr('Meditaciones de 3 min', '3-minute meditations')} grad={tileGradients.calma} onPress={() => go('evaluaciones')} />
        <Tile title={tr('Hipnosis', 'Hypnosis')} sub={tr('Sueño, ansiedad, memoria', 'Sleep, anxiety, memory')} grad={tileGradients.hipnosis} onPress={() => go('hipnosis')} />
        <Tile title={tr('Noche antes', 'Night before')} sub={tr('Para la víspera de la prueba', 'For the eve of your exam')} grad={tileGradients.noche} onPress={() => play(MEDITACIONES[0].id)} />
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

const st = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  warm: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.muted, marginTop: -6, marginBottom: 16 },
  trial: { borderWidth: 1, borderColor: colors.teal, borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12 },
  trialText: { fontFamily: fonts.bodySemi, fontSize: 13, lineHeight: 19, color: colors.text },
  avatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.lilac, fontFamily: fonts.display, fontSize: 15 },
  count: { backgroundColor: colors.card, borderRadius: 26, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  n: { fontFamily: fonts.display, fontSize: 34, color: colors.moon },
  nUnit: { fontFamily: fonts.body, fontSize: 14, color: colors.muted },
  small: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  stat: { flexDirection: 'row', gap: 10 },
  statBox: { flex: 1, backgroundColor: colors.card, borderRadius: 22, padding: 12 },
  statN: { fontFamily: fonts.display, fontSize: 22, color: colors.moon },
  week: { flexDirection: 'row', gap: 6, marginTop: 10 },
  day: { flex: 1, aspectRatio: 1, borderRadius: 10, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
});
