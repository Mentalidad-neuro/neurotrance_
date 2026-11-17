import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { themeName } from '../theme';

// Fondo decorativo fijo (sin movimiento): estrellas y brillos de noche, burbujas pastel de día.
function rand(seed: number) {
  let s = seed;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}
const r = rand(7);
const STARS = Array.from({ length: 46 }, () => ({ x: r() * 100, y: r() * 70, s: 0.5 + r() * 1.1, o: 0.25 + r() * 0.6 }));

export default function Backdrop() {
  if (themeName === 'estrellada') {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="g1" cx="15%" cy="8%" r="55%">
              <Stop offset="0" stopColor="#3fb6b2" stopOpacity={0.3} />
              <Stop offset="1" stopColor="#3fb6b2" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="g2" cx="95%" cy="20%" r="55%">
              <Stop offset="0" stopColor="#8b6cf0" stopOpacity={0.38} />
              <Stop offset="1" stopColor="#8b6cf0" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#g1)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#g2)" />
          {STARS.map((st, i) => (
            <Circle key={i} cx={`${st.x}%`} cy={`${st.y}%`} r={st.s} fill="#ffffff" opacity={st.o} />
          ))}
        </Svg>
      </View>
    );
  }
  if (themeName === 'algodon') {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[st.blob, { right: -80, top: -80, width: 270, height: 270, backgroundColor: '#e3eef8' }]} />
        <View style={[st.blob, { left: -70, top: 150, width: 160, height: 160, backgroundColor: '#e4f2e9' }]} />
      </View>
    );
  }
  return null;
}

const st = StyleSheet.create({ blob: { position: 'absolute', borderRadius: 999 } });
