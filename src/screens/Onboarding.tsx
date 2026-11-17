import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip, Cta, LinkButton, Logo, Stepper } from '../components/ui';
import { GOALS } from '../content';
import { addDays, addMinutes, defaultExamDate } from '../dates';
import { scheduleBedtimeReminder } from '../notifications';
import { formatDate, todayKey, useSettings } from '../store';
import { colors, fonts } from '../theme';

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const { s, update } = useSettings();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<string[]>(s.goals.length ? s.goals : ['Dormir', 'Recordar lo estudiado']);
  const [exam, setExam] = useState(s.examDate ?? defaultExamDate());
  const [bed, setBed] = useState(s.bedtime);

  const finish = () => {
    update({ onboarded: true, goals, examDate: exam, bedtime: bed });
    scheduleBedtimeReminder(bed, s.reminder);
    onDone();
  };
  const next = () => (step < 2 ? setStep(step + 1) : finish());

  return (
    <LinearGradient colors={['#2c3766', colors.sky]} locations={[0, 0.75]} style={[st.wrap, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }]}>
      <View style={st.dots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[st.dot, i === step && st.dotOn]} />
        ))}
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1, gap: 14 }}>
        {step === 0 && (
          <>
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Logo size={104} />
            </View>
            <Text style={st.brand}>NeuroTrance</Text>
            <Text style={[st.p, { textAlign: 'center' }]}>Tu lugar tranquilo para estudiar, dormir bien y llegar en calma a tus evaluaciones.</Text>
          </>
        )}
        {step === 1 && (
          <>
            <Text style={st.h}>¿Qué te cuesta más en estos días?</Text>
            <Text style={st.p}>Elige todas las que quieras. Así te mostramos primero lo que más te sirve.</Text>
            <View style={st.chips}>
              {GOALS.map((g) => (
                <Chip key={g} label={g} on={goals.includes(g)} onPress={() => setGoals(goals.includes(g) ? goals.filter((x) => x !== g) : [...goals, g])} />
              ))}
            </View>
          </>
        )}
        {step === 2 && (
          <>
            <Text style={st.h}>Preparemos tu próxima evaluación</Text>
            <Stepper
              label="¿Cuándo es tu próxima evaluación?"
              value={formatDate(exam)}
              onMinus={() => {
                const d = addDays(exam, -1);
                if (d >= todayKey()) setExam(d);
              }}
              onPlus={() => setExam(addDays(exam, 1))}
            />
            <Stepper label="¿A qué hora te acuestas?" value={bed} onMinus={() => setBed(addMinutes(bed, -15))} onPlus={() => setBed(addMinutes(bed, 15))} />
            <Text style={st.p}>Te avisaremos 15 minutos antes para que empieces a bajar el ritmo.</Text>
          </>
        )}
      </ScrollView>
      <Cta label={step === 0 ? 'Empezar' : step === 1 ? 'Siguiente' : 'Entrar a NeuroTrance'} onPress={next} />
      {step < 2 ? <LinkButton label="Saltar" onPress={finish} /> : <View style={{ height: 40 }} />}
    </LinearGradient>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 24 },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 16 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.line },
  dotOn: { width: 20, backgroundColor: colors.moon },
  brand: { fontFamily: fonts.display, fontSize: 34, color: colors.text, textAlign: 'center' },
  h: { fontFamily: fonts.display, fontSize: 26, color: colors.text },
  p: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
