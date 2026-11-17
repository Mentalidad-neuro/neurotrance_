import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Eyebrow, H2, H3, Hint, Tile } from '../components/ui';
import { MEDITACIONES } from '../content';
import { daysUntil, formatDate, todayKey, useSettings } from '../store';
import { colors, fonts, tileGradients } from '../theme';

export type Tab = 'inicio' | 'estudiar' | 'dormir' | 'hipnosis' | 'evaluaciones';

const WARM = [
  'Paso a paso también se llega.',
  'Tu esfuerzo de hoy cuenta, aunque no lo veas todavía.',
  'Respira. Estás haciendo lo mejor que puedes.',
  'Descansar también es estudiar: tu cerebro guarda mientras duermes.',
  'Hoy basta con dar un paso pequeño.',
];

const DAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function thisWeek() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return DAY_LETTERS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return todayKey(d);
  });
}

export default function Home({ go, openProfile, play }: { go: (t: Tab) => void; openProfile: () => void; play: (id: string) => void }) {
  const { s } = useSettings();
  const h = new Date().getHours();
  const greet = h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
  const days = daysUntil(s.examDate);
  const week = thisWeek();
  const activeDays = week.filter((k) => (s.listened[k] ?? 0) >= 1).length;
  const weekMinutes = Math.round(week.reduce((a, k) => a + (s.listened[k] ?? 0), 0));

  return (
    <View>
      <View style={st.top}>
        <Eyebrow>{greet}</Eyebrow>
        <Pressable style={st.avatar} onPress={openProfile} accessibilityLabel="Mi espacio" accessibilityRole="button">
          <Text style={st.avatarText}>M</Text>
        </Pressable>
      </View>
      <H2>¿Cómo quieres sentirte hoy?</H2>
      <Text style={st.warm}>{WARM[new Date().getDate() % WARM.length]}</Text>

      <View style={st.count}>
        <View style={{ flex: 1 }}>
          <Eyebrow>{days === null ? 'Tu próxima evaluación' : 'Faltan para tu evaluación'}</Eyebrow>
          <Text style={st.small}>{s.examDate ? formatDate(s.examDate) : 'Agrega la fecha en Mi espacio'}</Text>
        </View>
        {days !== null && (
          <Text style={st.n}>
            {days}
            <Text style={st.nUnit}> {days === 1 ? 'día' : 'días'}</Text>
          </Text>
        )}
      </View>

      <H3>Elige</H3>
      <View style={st.grid}>
        <Tile wide title="Estudiar con foco" sub="Pomodoros de 25 a 55 min con sonidos para concentrarte" grad={tileGradients.estudiar} onPress={() => go('estudiar')} />
        <Tile title="Dormir" sub="Sonidos y apagado automático" grad={tileGradients.dormir} onPress={() => go('dormir')} />
        <Tile title="Calmarme ahora" sub="Meditaciones de 3 min" grad={tileGradients.calma} onPress={() => go('evaluaciones')} />
        <Tile title="Hipnosis" sub="Sueño, ansiedad, memoria" grad={tileGradients.hipnosis} onPress={() => go('hipnosis')} />
        <Tile title="Noche antes" sub="Para la víspera de la prueba" grad={tileGradients.noche} onPress={() => play(MEDITACIONES[0].id)} />
      </View>

      <H3>Tu semana</H3>
      <View style={st.stat}>
        <View style={st.statBox}>
          <Text style={st.statN}>{activeDays}</Text>
          <Text style={st.small}>{activeDays === 1 ? 'día con calma' : 'días con calma'}</Text>
        </View>
        <View style={st.statBox}>
          <Text style={st.statN}>{weekMinutes}</Text>
          <Text style={st.small}>minutos de calma</Text>
        </View>
      </View>
      <View style={st.week}>
        {week.map((k, i) => {
          const on = (s.listened[k] ?? 0) >= 1;
          return (
            <View key={k} style={[st.day, on && { backgroundColor: colors.tealSoft }]}>
              <Text style={[st.dayText, on && { color: colors.teal }]}>{DAY_LETTERS[i]}</Text>
            </View>
          );
        })}
      </View>
      {weekMinutes === 0 && <Hint>Cuando escuches tu primer audio, aquí verás tus días de calma.</Hint>}
    </View>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  warm: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.muted, marginTop: -6, marginBottom: 16 },
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
