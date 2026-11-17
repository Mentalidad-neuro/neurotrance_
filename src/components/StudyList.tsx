import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useSettings } from '../store';
import { colors, fonts } from '../theme';

const PRAISE = ['¡Bien hecho!', '¡Uno menos!', '¡Vas muy bien!', '¡Sigue así!', '¡Tu mente lo guardó!', '¡Excelente avance!'];
const CONFETTI = [colors.moon, colors.lilac, colors.teal, colors.blue];

function vibrate(strong = false) {
  if (Platform.OS === 'web') return;
  (strong ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)).catch(() => {});
}

function Row({ item, onToggle, onDelete }: { item: { id: string; text: string; done: boolean }; onToggle: () => void; onDelete: () => void }) {
  const pop = useRef(new Animated.Value(1)).current;
  const press = () => {
    if (!item.done) {
      pop.setValue(0.6);
      Animated.spring(pop, { toValue: 1, friction: 3, tension: 160, useNativeDriver: true }).start();
    }
    onToggle();
  };
  return (
    <View style={[st.row, item.done && st.rowDone]}>
      <Pressable onPress={press} style={st.rowMain} accessibilityRole="checkbox" accessibilityState={{ checked: item.done }} accessibilityLabel={item.text} hitSlop={4}>
        <Animated.View style={[st.box, item.done && st.boxOn, { transform: [{ scale: pop }] }]}>{item.done ? <Text style={st.check}>✓</Text> : null}</Animated.View>
        <Text style={[st.text, item.done && st.textDone]}>{item.text}</Text>
      </Pressable>
      <Pressable onPress={onDelete} hitSlop={10} accessibilityLabel={`Borrar ${item.text}`}>
        <Text style={st.del}>✕</Text>
      </Pressable>
    </View>
  );
}

function Celebration() {
  const anims = useRef(Array.from({ length: 18 }, () => new Animated.Value(0))).current;
  useEffect(() => {
    Animated.stagger(
      30,
      anims.map((a) => Animated.timing(a, { toValue: 1, duration: 1400, easing: Easing.out(Easing.cubic), useNativeDriver: true })),
    ).start();
  }, [anims]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {anims.map((a, i) => {
        const angle = (i / anims.length) * Math.PI * 2;
        const dist = 90 + (i % 3) * 30;
        return (
          <Animated.View
            key={i}
            style={[
              st.dot,
              {
                backgroundColor: CONFETTI[i % CONFETTI.length],
                opacity: a.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
                transform: [
                  { translateX: a.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * dist] }) },
                  { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * dist * 0.6] }) },
                  { scale: a.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.2, 1.2, 0.6] }) },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export default function StudyList() {
  const { s, update } = useSettings();
  const list = s.studyList;
  const [text, setText] = useState('');
  const [praise, setPraise] = useState('');
  const [party, setParty] = useState(0);
  const ding = useAudioPlayer(require('../../assets/audio/listo.mp3'));
  const fanfare = useAudioPlayer(require('../../assets/audio/logro.mp3'));
  const done = list.filter((i) => i.done).length;
  const total = list.length;
  const allDone = total > 0 && done === total;
  const fill = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fill, { toValue: total ? done / total : 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [done, total, fill]);

  const play = (p: typeof ding) => {
    try {
      p.seekTo(0);
      p.play();
    } catch {}
  };

  const add = () => {
    const t = text.trim();
    if (!t) return;
    update({ studyList: [...list, { id: String(Date.now()), text: t, done: false }] });
    setText('');
  };

  const toggle = (id: string) => {
    const next = list.map((i) => (i.id === id ? { ...i, done: !i.done } : i));
    update({ studyList: next });
    const item = list.find((i) => i.id === id);
    if (item && !item.done) {
      const nowDone = next.filter((i) => i.done).length;
      if (nowDone === next.length) {
        play(fanfare);
        vibrate(true);
        setParty((n) => n + 1);
        setPraise('');
      } else {
        play(ding);
        vibrate();
        setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
      }
    } else setPraise('');
  };

  return (
    <View>
      <View style={st.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={add}
          placeholder="Ej: Funciones cuadráticas"
          placeholderTextColor="#7f89ad"
          returnKeyType="done"
          style={st.input}
          accessibilityLabel="Tema para estudiar"
        />
        <Pressable onPress={add} style={st.add} accessibilityRole="button" accessibilityLabel="Agregar tema">
          <Text style={st.addText}>+</Text>
        </Pressable>
      </View>

      {total > 0 && (
        <View style={st.progressWrap}>
          <View style={st.progressHead}>
            <Text style={st.progressText}>
              {done} de {total} listos
            </Text>
            <Text style={[st.progressPct, allDone && { color: colors.teal }]}>{Math.round((done / total) * 100)}%</Text>
          </View>
          <View style={st.bar}>
            <Animated.View style={[st.barFill, allDone && { backgroundColor: colors.teal }, { width: fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
          </View>
          {praise ? <Text style={st.praise}>{praise}</Text> : null}
        </View>
      )}

      <View style={{ gap: 8, marginTop: 10 }}>
        {list.map((i) => (
          <Row key={i.id} item={i} onToggle={() => toggle(i.id)} onDelete={() => update({ studyList: list.filter((x) => x.id !== i.id) })} />
        ))}
      </View>

      {total === 0 && <Text style={st.empty}>Escribe los temas que vas a estudiar hoy. Márcalos a medida que los termines y mira cómo se llena tu barra.</Text>}

      {allDone && (
        <View style={st.done}>
          <Celebration key={party} />
          <Text style={st.doneEmoji}>🌙</Text>
          <Text style={st.doneTitle}>¡Terminaste todo!</Text>
          <Text style={st.doneSub}>Date un descanso. Esta noche tu cerebro va a guardar lo que estudiaste.</Text>
        </View>
      )}

      {total > 0 && (
        <View style={st.actions}>
          <Pressable onPress={() => { update({ studyList: list.map((i) => ({ ...i, done: false })) }); setPraise(''); }} style={st.action} accessibilityRole="button">
            <Text style={st.actionText}>Reiniciar</Text>
          </Pressable>
          <Pressable onPress={() => { update({ studyList: [] }); setPraise(''); }} style={st.action} accessibilityRole="button">
            <Text style={st.actionText}>Lista nueva</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontFamily: fonts.bodySemi, fontSize: 15 },
  add: { width: 50, borderRadius: 18, backgroundColor: colors.moon, alignItems: 'center', justifyContent: 'center' },
  addText: { color: colors.sky, fontSize: 26, fontFamily: fonts.bodyBold, marginTop: -2 },
  progressWrap: { marginTop: 14 },
  progressHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.muted },
  progressPct: { fontFamily: fonts.display, fontSize: 14, color: colors.moon },
  bar: { height: 10, borderRadius: 6, backgroundColor: colors.line, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 6, backgroundColor: colors.moon },
  praise: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.teal, marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 10 },
  rowDone: { backgroundColor: colors.successSoft },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  box: { width: 28, height: 28, borderRadius: 9, borderWidth: 2, borderColor: colors.lilac, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.teal, borderColor: colors.teal },
  check: { color: colors.sky, fontFamily: fonts.bodyBold, fontSize: 16 },
  text: { flex: 1, fontFamily: fonts.bodySemi, fontSize: 15, color: colors.text },
  textDone: { color: colors.muted, textDecorationLine: 'line-through' },
  del: { color: colors.muted, fontSize: 14, paddingHorizontal: 4 },
  empty: { fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: colors.muted, marginTop: 10 },
  done: { marginTop: 14, backgroundColor: colors.success, borderRadius: 24, padding: 18, alignItems: 'center', overflow: 'visible' },
  doneEmoji: { fontSize: 34 },
  doneTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.text, marginTop: 4 },
  doneSub: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 4, lineHeight: 20 },
  dot: { position: 'absolute', left: '50%', top: '40%', width: 10, height: 10, borderRadius: 5, marginLeft: -5 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  action: { flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 18, paddingVertical: 11, alignItems: 'center' },
  actionText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.text },
});
