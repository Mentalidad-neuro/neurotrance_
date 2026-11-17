import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, LinearGradient as SvgLinear, Mask, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';
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

// breath (opcional): 0 = pulmones vacíos, 1 = llenos. Si viene, el visual sigue la guía de respiración en vez de su propio ritmo.
export default function TranceVisual({ kind, playing, safe, breath: guide }: { kind: VisualKind; playing: boolean; safe: boolean; breath?: Animated.Value }) {
  const reduce = useReduceMotion();
  const active = playing && !reduce;
  const slow = safe ? 2 : 1; // modo suave: el doble de lento
  const amp = safe ? 0.5 : 1; // y la mitad de movimiento
  const dim = safe ? 0.65 : 1; // y menos contraste

  const own = useRef(new Animated.Value(0)).current; // 0..1, respiración de 8 s
  const breath = guide ?? own;
  const spin = useRef(new Animated.Value(0)).current; // 0..1, una vuelta
  const w1 = useRef(new Animated.Value(0)).current;

  useLoop(own, 8000 * slow, active && !guide);
  useLoop(spin, 90000 * slow, active && kind === 'mandala', 0, 1, false);
  useLoop(w1, 24000 * slow, active && kind === 'mandala'); // cruce lento de colores
  // Relojes lentos para los demás visuales (todo cambio dura 4 s o más).
  const m1 = useRef(new Animated.Value(0)).current;
  const m2 = useRef(new Animated.Value(0)).current;
  const m4 = useRef(new Animated.Value(0)).current;
  const P: Record<VisualKind, [number, number, number]> = {
    esfera: [40000, 56000, 10000],
    mandala: [1, 1, 1],
    luz: [80000, 120000, 9000],
    agua: [60000, 84000, 12000],
    estrellas: [140000, 90000, 24000],
  };
  const on = active && kind !== 'mandala';
  useLoop(m1, P[kind][0] * slow, on, 0, 1, false);
  useLoop(m2, P[kind][1] * slow, on, 0, 1, false);
  useLoop(m4, P[kind][2] * slow, on, 0, 1, false);
  const turn = (v: Animated.Value, dir = 1) => v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${360 * dir}deg`] });
  const phase = (off: number) => Animated.modulo(Animated.add(m4, off), 1);
  const A = colors.orbA ?? colors.moon;
  const B = colors.orbB ?? colors.lilac;
  const glow = (id: string, color: string, op = 0.9) => (
    <Defs>
      <RadialGradient id={id} cx="50%" cy="50%" r="50%">
        <Stop offset="0" stopColor={color} stopOpacity={op} />
        <Stop offset="1" stopColor={color} stopOpacity={0} />
      </RadialGradient>
    </Defs>
  );
  // Mancha de luz suave que gira alrededor del centro.
  const orbit = (key: string, v: Animated.Value, dir: number, color: string, r: number, dist: number, op = 0.8) => (
    <Animated.View key={key} style={[StyleSheet.absoluteFill, { transform: [{ rotate: turn(v, dir) }] }]}>
      <Svg width={SIZE} height={SIZE} viewBox="0 0 240 240">
        {glow('g' + key, color, op)}
        <Circle cx={120} cy={120 - dist} r={r} fill={`url(#g${key})`} />
      </Svg>
    </Animated.View>
  );

  // Con guía de respiración el cambio es más visible para poder seguirlo.
  const scale = breath.interpolate({ inputRange: [0, 1], outputRange: guide ? [1 - 0.2 * amp, 1 + 0.04 * amp] : [1 - 0.06 * amp, 1 + 0.05 * amp] });

  if (kind === 'esfera') {
    // Esfera viva: luces de colores giran por dentro, la esfera respira y dos halos se abren hacia afuera.
    const halo = (off: number, key: string) => (
      <Animated.View
        key={key}
        style={[
          st.ring,
          {
            borderColor: B,
            borderWidth: 1.5,
            opacity: phase(off).interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.45 * dim, 0] }),
            transform: [{ scale: phase(off).interpolate({ inputRange: [0, 1], outputRange: [0.82, 1.18] }) }],
          },
        ]}
      />
    );
    return (
      <View style={st.box}>
        {halo(0, 'h1')}
        {halo(0.5, 'h2')}
        <Animated.View style={[st.orbClip, { opacity: dim, transform: [{ scale }] }]}>
          <LinearGradient colors={[colors.orbCore, A, B, colors.orbEdge]} locations={[0, 0.25, 0.6, 1]} start={{ x: 0.3, y: 0.2 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={st.orbInner}>
            {orbit('e1', m1, 1, colors.teal, 70, 40, 0.75)}
            {orbit('e2', m2, -1, colors.lilac, 64, 46, 0.7)}
            {orbit('e3', m1, -1, A, 54, 30, 0.85)}
            {orbit('e4', m2, 1, colors.orbCore, 40, 20, 0.7)}
          </View>
        </Animated.View>
      </View>
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
    // Túnel de luz: rayos suaves que giran muy lento y anillos que viajan hacia el centro, llevando la mirada adentro.
    // Cada rayo se desvanece hacia afuera, sin bordes marcados.
    const rays = (id: string, n: number, len: number, w: number, color: string, op: number) => (
      <>
        <Defs>
          <SvgLinear id={id} x1="120" y1="120" x2="120" y2={String(120 - len)} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={color} stopOpacity={op * dim} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </SvgLinear>
        </Defs>
        {Array.from({ length: n }, (_, i) => (
          <Polygon key={i} points={`120,120 ${120 - w},${120 - len} ${120 + w},${120 - len}`} fill={`url(#${id})`} transform={`rotate(${(360 / n) * i} 120 120)`} />
        ))}
      </>
    );
    const inward = (off: number, key: string) => (
      <Animated.View
        key={key}
        style={[
          st.ring,
          {
            borderColor: colors.moon,
            borderWidth: 2,
            opacity: phase(off).interpolate({ inputRange: [0, 0.25, 0.85, 1], outputRange: [0, 0.4 * dim, 0.25 * dim, 0] }),
            transform: [{ scale: phase(off).interpolate({ inputRange: [0, 1], outputRange: [1.05, 0.08] }) }],
          },
        ]}
      />
    );
    const coreGlow = breath.interpolate({ inputRange: [0, 1], outputRange: [0.6 * dim, 1 * dim] });
    return (
      <View style={st.box}>
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: turn(m1) }] }]}>
          <Svg width={SIZE} height={SIZE} viewBox="0 0 240 240">{rays('ra', 16, 118, 9, colors.moon, 0.35)}</Svg>
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: turn(m2, -1) }] }]}>
          <Svg width={SIZE} height={SIZE} viewBox="0 0 240 240">{rays('rb', 10, 100, 14, colors.teal, 0.25)}</Svg>
        </Animated.View>
        {inward(0, 'r1')}
        {inward(0.33, 'r2')}
        {inward(0.66, 'r3')}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: coreGlow, transform: [{ scale }] }]}>
          <Svg width={SIZE} height={SIZE} viewBox="0 0 240 240">
            {glow('lz', colors.orbCore, 1)}
            <Circle cx={120} cy={120} r={70} fill="url(#lz)" />
          </Svg>
        </Animated.View>
        <View style={[st.dot, { opacity: dim }]} />
      </View>
    );
  }

  if (kind === 'agua') {
    // Agua: reflejos de luz que se mueven bajo la superficie y ondas que se abren una tras otra.
    const ring = (off: number, key: string) => (
      <Animated.View
        key={key}
        style={[
          st.ring,
          {
            borderColor: colors.orbCore,
            borderWidth: 1.5,
            opacity: phase(off).interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.55 * dim, 0] }),
            transform: [{ scale: phase(off).interpolate({ inputRange: [0, 1], outputRange: [0.05, 1] }) }],
          },
        ]}
      />
    );
    return (
      <View style={st.box}>
        <Animated.View style={[st.orbClip, st.waterClip, { opacity: dim, transform: [{ scale }] }]}>
          <LinearGradient colors={[colors.blue, colors.teal]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={[StyleSheet.absoluteFill, { opacity: 0.55 }]} />
          <View style={st.orbInner}>
            {orbit('c1', m1, 1, colors.orbCore, 60, 50, 0.45)}
            {orbit('c2', m2, -1, B, 70, 34, 0.5)}
            {orbit('c3', m1, -1, colors.teal, 56, 60, 0.45)}
          </View>
        </Animated.View>
        {ring(0, 'a')}
        {ring(0.2, 'b')}
        {ring(0.4, 'c')}
        {ring(0.6, 'd')}
        {ring(0.8, 'e')}
        <View style={[st.drop, st.center, { backgroundColor: colors.orbCore, opacity: 0.8 * dim }]} />
      </View>
    );
  }

  // estrellas: viaje lento entre estrellas, con nubes de color que giran detrás.
  const field = (seed: number) =>
    Array.from({ length: 26 }, (_, i) => {
      const a = Math.sin(seed * 97 + i * 12.9898) * 43758.5453;
      const b = Math.sin(seed * 31 + i * 78.233) * 12543.123;
      const x = 10 + (a - Math.floor(a)) * 220;
      const y = 10 + (b - Math.floor(b)) * 220;
      return <Circle key={i} cx={x} cy={y} r={0.8 + ((i + seed) % 3) * 0.55} fill={colors.orbCore} />;
    });
  const layer = (off: number, seed: number) => (
    <Animated.View
      key={seed}
      style={[
        StyleSheet.absoluteFill,
        {
          opacity: phase(off).interpolate({ inputRange: [0, 0.3, 0.75, 1], outputRange: [0, 0.85 * dim, 0.7 * dim, 0] }),
          transform: [{ scale: phase(off).interpolate({ inputRange: [0, 1], outputRange: [0.35, 1.9] }) }, { rotate: turn(m1) }],
        },
      ]}
    >
      <Svg width={SIZE} height={SIZE}>{field(seed)}</Svg>
    </Animated.View>
  );
  return (
    <View style={[st.box, st.starClip]}>
      <View style={[StyleSheet.absoluteFill, { opacity: 0.8 * dim }]}>
        {orbit('n1', m2, 1, colors.lilac, 90, 40, 0.45)}
        {orbit('n2', m2, -1, colors.teal, 80, 50, 0.35)}
        {orbit('n3', m1, 1, A, 60, 30, 0.3)}
      </View>
      {layer(0, 1)}
      {layer(0.33, 2)}
      {layer(0.66, 3)}
    </View>
  );
}


const st = StyleSheet.create({
  box: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  orb: { width: 200, height: 200, borderRadius: 100 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.orbCore },
  ring: { position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: 2 },
  orbClip: { width: 200, height: 200, borderRadius: 100, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  orbInner: { width: SIZE, height: SIZE },
  waterClip: { width: 236, height: 236, borderRadius: 118 },
  center: { position: 'absolute', top: SIZE / 2 - 6, left: SIZE / 2 - 6 },
  starClip: { borderRadius: SIZE / 2, overflow: 'hidden' },
  drop: { width: 12, height: 12, borderRadius: 6 },
  kBase: { position: 'absolute', width: 236, height: 236, borderRadius: 118, borderWidth: 1 },
  kCore: { width: 18, height: 18, borderRadius: 9 },
});
