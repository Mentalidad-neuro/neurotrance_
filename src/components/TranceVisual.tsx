import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, Ellipse, G, Mask, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme';
import { bilingual } from '../i18n';

// Visuales para acompañar el trance. Reglas de seguridad para fotosensibilidad (WCAG 2.3.1):
// sin destellos ni cambios bruscos de brillo, todo cambio dura 4 segundos o más,
// sin espirales ni patrones de alto contraste. En "modo suave" todo va el doble de lento,
// con menos movimiento y menos contraste. Si el sistema pide reducir movimiento, queda quieto.

export type VisualKind = 'esfera' | 'mandala' | 'luz' | 'agua' | 'estrellas';
export const VISUALS: { key: VisualKind; label: string }[] = [
  bilingual({ key: 'esfera' as VisualKind, label: 'Esfera' }, { label: 'Sphere' }),
  bilingual({ key: 'mandala' as VisualKind, label: 'Mandala' }, { label: 'Mandala' }),
  bilingual({ key: 'luz' as VisualKind, label: 'Luz' }, { label: 'Light' }),
  bilingual({ key: 'agua' as VisualKind, label: 'Agua' }, { label: 'Water' }),
  bilingual({ key: 'estrellas' as VisualKind, label: 'Estrellas' }, { label: 'Stars' }),
];

const SIZE = 240;

function useLoop(value: Animated.Value, ms: number, active: boolean, from = 0, to = 1, yoyo = true) {
  useEffect(() => {
    if (!active) {
      value.setValue((from + to) / 2);
      return;
    }
    value.setValue(from);
    const ease = Easing.inOut(Easing.sin);
    const anim = yoyo
      ? Animated.loop(
          Animated.sequence([
            Animated.timing(value, { toValue: to, duration: ms / 2, easing: ease, useNativeDriver: true }),
            Animated.timing(value, { toValue: from, duration: ms / 2, easing: ease, useNativeDriver: true }),
          ]),
        )
      : Animated.loop(Animated.timing(value, { toValue: to, duration: ms, easing: Easing.linear, useNativeDriver: true }));
    anim.start();
    return () => anim.stop();
  }, [value, ms, active, from, to, yoyo]);
}

export function useReduceMotion() {
  const [rm, setRm] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setRm).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setRm);
    return () => sub.remove();
  }, []);
  return rm;
}

export default function TranceVisual({ kind, playing, safe }: { kind: VisualKind; playing: boolean; safe: boolean }) {
  const reduce = useReduceMotion();
  const active = playing && !reduce;
  const slow = safe ? 2 : 1; // modo suave: el doble de lento
  const amp = safe ? 0.5 : 1; // y la mitad de movimiento
  const dim = safe ? 0.65 : 1; // y menos contraste

  const breath = useRef(new Animated.Value(0)).current; // 0..1, respiración de 8 s
  const spin = useRef(new Animated.Value(0)).current; // 0..1, una vuelta
  const w1 = useRef(new Animated.Value(0)).current;
  const w2 = useRef(new Animated.Value(0)).current;
  const w3 = useRef(new Animated.Value(0)).current;

  useLoop(breath, 8000 * slow, active);
  useLoop(spin, 90000 * slow, active && kind === 'mandala', 0, 1, false);
  useLoop(w1, 9000 * slow, active && kind === 'agua', 0, 1, false);
  useLoop(w2, 11000 * slow, active && (kind === 'agua' || kind === 'estrellas'), 0, 1, kind === 'estrellas');
  useLoop(w3, 13000 * slow, active && (kind === 'agua' || kind === 'estrellas'), 0, 1, kind === 'estrellas');

  // Las ondas de agua arrancan desfasadas.
  useEffect(() => {
    if (kind === 'agua' && active) {
      w2.setValue(0.33);
      w3.setValue(0.66);
    }
  }, [kind, active, w2, w3]);

  const scale = breath.interpolate({ inputRange: [0, 1], outputRange: [1 - 0.06 * amp, 1 + 0.05 * amp] });

  if (kind === 'esfera') {
    return (
      <Animated.View style={[st.box, { opacity: dim, transform: [{ scale }] }]}>
        <LinearGradient colors={[colors.orbCore, colors.orbA ?? colors.moon, colors.orbB ?? colors.lilac, colors.orbEdge]} locations={[0, 0.25, 0.6, 1]} start={{ x: 0.3, y: 0.2 }} end={{ x: 0.8, y: 1 }} style={st.orb} />
      </Animated.View>
    );
  }

  if (kind === 'mandala') {
    const rot = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    const rotBack = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });
    const petals = (n: number, rx: number, ry: number, dist: number, color: string, op: number) =>
      Array.from({ length: n }, (_, i) => (
        <Ellipse key={i} cx={120} cy={120 - dist} rx={rx} ry={ry} fill={color} opacity={op * dim} transform={`rotate(${(360 / n) * i} 120 120)`} />
      ));
    return (
      <Animated.View style={[st.box, { transform: [{ scale }] }]}>
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: rot }] }]}>
          <Svg width={SIZE} height={SIZE} viewBox="0 0 240 240">{petals(12, 16, 46, 62, colors.orbB ?? colors.lilac, 0.45)}</Svg>
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: rotBack }] }]}>
          <Svg width={SIZE} height={SIZE} viewBox="0 0 240 240">
            {petals(8, 12, 32, 36, colors.orbA ?? colors.moon, 0.55)}
            <Circle cx={120} cy={120} r={16} fill={colors.orbCore} opacity={0.8 * dim} />
          </Svg>
        </Animated.View>
      </Animated.View>
    );
  }

  if (kind === 'luz') {
    const glow = breath.interpolate({ inputRange: [0, 1], outputRange: [0.55 * dim, 0.95 * dim] });
    return (
      <View style={st.box}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: glow, transform: [{ scale }] }]}>
          <Svg width={SIZE} height={SIZE} viewBox="0 0 240 240">
            <Defs>
              <RadialGradient id="g" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={colors.orbCore} stopOpacity={1} />
                <Stop offset="0.25" stopColor={colors.moon} stopOpacity={0.7} />
                <Stop offset="1" stopColor={colors.moon} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={120} cy={120} r={120} fill="url(#g)" />
          </Svg>
        </Animated.View>
        <View style={[st.dot, { opacity: dim }]} />
      </View>
    );
  }

  if (kind === 'agua') {
    const ring = (v: Animated.Value, key: string) => (
      <Animated.View
        key={key}
        style={[
          st.ring,
          {
            borderColor: colors.blue,
            opacity: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.6 * dim, 0] }),
            transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.15, 1] }) }],
          },
        ]}
      />
    );
    return (
      <View style={st.box}>
        {ring(w1, 'a')}
        {ring(w2, 'b')}
        {ring(w3, 'c')}
        <View style={[st.drop, { backgroundColor: colors.blue, opacity: 0.7 * dim }]} />
      </View>
    );
  }

  // estrellas
  const stars = (seed: number) =>
    Array.from({ length: 16 }, (_, i) => {
      const a = Math.sin(seed * 97 + i * 12.9898) * 43758.5453;
      const b = Math.sin(seed * 31 + i * 78.233) * 12543.123;
      const x = 10 + (a - Math.floor(a)) * 220;
      const y = 10 + (b - Math.floor(b)) * 220;
      return <Circle key={i} cx={x} cy={y} r={1 + ((i + seed) % 3) * 0.6} fill={colors.orbCore} />;
    });
  const tw = (v: Animated.Value) => v.interpolate({ inputRange: [0, 1], outputRange: [0.25 * dim, 0.8 * dim] });
  return (
    <View style={st.box}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: tw(breath) }]}>
        <Svg width={SIZE} height={SIZE}>{stars(1)}</Svg>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: tw(w2) }]}>
        <Svg width={SIZE} height={SIZE}>{stars(2)}</Svg>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: tw(w3) }]}>
        <Svg width={SIZE} height={SIZE}>{stars(3)}</Svg>
      </Animated.View>
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
        <Defs>
          <Mask id="luna">
            <Rect x={0} y={0} width={SIZE} height={SIZE} fill="#fff" />
            <Circle cx={162} cy={82} r={22} fill="#000" />
          </Mask>
        </Defs>
        <G opacity={0.9 * dim}>
          <Circle cx={150} cy={90} r={26} fill={colors.moon} mask="url(#luna)" />
        </G>
      </Svg>
    </View>
  );
}

const st = StyleSheet.create({
  box: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  orb: { width: 200, height: 200, borderRadius: 100 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.orbCore },
  ring: { position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: 2 },
  drop: { width: 12, height: 12, borderRadius: 6 },
});
