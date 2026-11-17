import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Mask, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme';
import { bilingual } from '../i18n';

// Visuales para acompañar el trance. Reglas de seguridad para fotosensibilidad (WCAG 2.3.1):
// sin destellos ni cambios bruscos de brillo, todo cambio dura 4 segundos o más,
// sin espirales ni patrones de alto contraste. En "modo suave" todo va el doble de lento,
// con menos movimiento y menos contraste. Si el sistema pide reducir movimiento, queda quieto.

export type VisualKind = 'esfera' | 'mandala' | 'luz' | 'agua' | 'estrellas';
export const VISUALS: { key: VisualKind; label: string }[] = [
  bilingual({ key: 'esfera' as VisualKind, label: 'Esfera' }, { label: 'Sphere' }),
  bilingual({ key: 'mandala' as VisualKind, label: 'Caleidoscopio' }, { label: 'Kaleidoscope' }),
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
  useLoop(w1, 24000 * slow, active && kind === 'mandala'); // cruce lento de colores
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
    // Caleidoscopio: 12 espejos. Tres capas giran a distinto ritmo y en sentidos opuestos,
    // así el dibujo cambia de forma muy lenta (una vuelta tarda 1,5 a 3 minutos). Sin destellos.
    const A = colors.orbA ?? colors.moon;
    const B = colors.orbB ?? colors.lilac;
    const turn = (mult: number) => spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${360 * mult}deg`] });
    const mirror = (key: string, shapes: React.ReactNode) =>
      Array.from({ length: 12 }, (_, i) => (
        <G key={key + i} transform={`rotate(${30 * i} 120 120)`}>
          {shapes}
          <G transform="translate(240 0) scale(-1 1)">{shapes}</G>
        </G>
      ));
    const layer = (key: string, shapes: React.ReactNode, mult: number, op: Animated.AnimatedInterpolation<number> | number = 1) => (
      <Animated.View key={key} style={[StyleSheet.absoluteFill, { opacity: op, transform: [{ rotate: turn(mult) }] }]}>
        <Svg width={SIZE} height={SIZE} viewBox="0 0 240 240">
          <Defs>
            <ClipPath id={'c' + key}>
              <Circle cx={120} cy={120} r={118} />
            </ClipPath>
          </Defs>
          <G clipPath={`url(#c${key})`} opacity={dim}>{mirror(key, shapes)}</G>
        </Svg>
      </Animated.View>
    );
    const fadeA = w1.interpolate({ inputRange: [0, 1], outputRange: [0.85, 0.35] });
    const fadeB = w1.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.85] });
    return (
      <Animated.View style={[st.box, { transform: [{ scale }] }]}>
        <View style={[st.kBase, { backgroundColor: colors.card, borderColor: colors.line }]} />
        {layer(
          'a',
          <>
            <Ellipse cx={132} cy={30} rx={9} ry={26} fill={B} opacity={0.5} transform="rotate(14 132 30)" />
            <Polygon points="128,62 138,78 128,94 118,78" fill={A} opacity={0.55} />
          </>,
          1,
          fadeA,
        )}
        {layer(
          'b',
          <>
            <Ellipse cx={136} cy={52} rx={7} ry={20} fill={colors.teal} opacity={0.4} transform="rotate(-20 136 52)" />
            <Circle cx={124} cy={14} r={6} fill={A} opacity={0.5} />
          </>,
          -0.66,
          fadeB,
        )}
        {layer(
          'c',
          <>
            <Polygon points="120,72 131,84 120,100 109,84" fill={colors.lilac} opacity={0.35} />
            <Ellipse cx={128} cy={104} rx={4} ry={9} fill={B} opacity={0.55} transform="rotate(25 128 104)" />
          </>,
          0.5,
        )}
        <View style={[st.kCore, { backgroundColor: colors.orbCore, opacity: 0.85 * dim }]} />
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
  kBase: { position: 'absolute', width: 236, height: 236, borderRadius: 118, borderWidth: 1 },
  kCore: { width: 18, height: 18, borderRadius: 9 },
});
