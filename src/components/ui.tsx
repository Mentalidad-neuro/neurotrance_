import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, fonts, themeName } from '../theme';
import type { Track } from '../content';
import { tr } from '../i18n';

export function Eyebrow({ children, color }: { children: React.ReactNode; color?: string }) {
  return <Text style={[s.eyebrow, color ? { color } : null]}>{children}</Text>;
}
export function H2({ children }: { children: React.ReactNode }) {
  return <Text style={s.h2}>{children}</Text>;
}
export function H3({ children }: { children: React.ReactNode }) {
  return <Text style={s.h3}>{children}</Text>;
}
export function Hint({ children }: { children: React.ReactNode }) {
  return <Text style={s.hint}>{children}</Text>;
}

export function Logo({ size = 96 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96">
      <Circle cx={58} cy={34} r={18} fill={colors.moon} />
      <Circle cx={66} cy={28} r={15} fill={colors.gradTop} />
      <Path d="M8 66c6 0 8-12 14-12s8 12 14 12 8-12 14-12 8 12 14 12 8-12 14-12 6 6 10 6" stroke={colors.lilac} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Path d="M14 80c8 0 12-6 20-6s12 6 20 6 12-6 20-6" stroke={colors.teal} strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.8} />
    </Svg>
  );
}

export type IconName = 'book' | 'moon' | 'wind' | 'spiral' | 'star' | 'play';
export function Icon({ name, color, size = 24 }: { name: IconName; color: string; size?: number }) {
  const p = { stroke: color, strokeWidth: 1.7, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'book' && (
        <>
          <Path d="M4 6.5C6.5 5 9.5 5 12 6.5v12C9.5 17 6.5 17 4 18.5z" {...p} />
          <Path d="M20 6.5C17.5 5 14.5 5 12 6.5v12c2.5-1.5 5.5-1.5 8 0z" {...p} />
        </>
      )}
      {name === 'moon' && <Path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" {...p} />}
      {name === 'wind' && (
        <>
          <Path d="M3 9h11a3 3 0 1 0-3-3" {...p} />
          <Path d="M3 14h15a3 3 0 1 1-3 3" {...p} />
        </>
      )}
      {name === 'spiral' && (
        <>
          <Circle cx={12} cy={12} r={8} {...p} />
          <Circle cx={12} cy={12} r={4} {...p} />
        </>
      )}
      {name === 'star' && <Path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z" {...p} />}
      {name === 'play' && <Path d="M8 5v14l11-7z" fill={color} />}
    </Svg>
  );
}

export function Tile({ title, sub, grad, onPress, wide, icon, iconColor }: { title: string; sub: string; grad: readonly [string, string]; onPress: () => void; wide?: boolean; icon?: IconName; iconColor?: string }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.tileWrap, wide && { width: '100%' }, pressed && { opacity: 0.85 }]} accessibilityRole="button">
      <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.tile, colors.glass && s.glassBorder, wide && { minHeight: 84 }]}>
        {themeName === 'algodon' && <View style={s.tileBubble} />}
        {icon ? (
          <View style={[s.tileIcon, colors.glass && { backgroundColor: 'transparent', width: 'auto', height: 'auto' }]}>
            <Icon name={icon} color={iconColor ?? colors.moon} size={colors.glass ? 26 : 22} />
          </View>
        ) : null}
        <View style={{ marginTop: icon ? 10 : 0 }}>
          <Text style={s.tileTitle}>{title}</Text>
          <Text style={s.tileSub}>{sub}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export function TrackRow({ t, locked, onPress, favorite }: { t: Track; locked: boolean; onPress: () => void; favorite?: boolean }) {
  const soon = !t.source;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.item, pressed && { opacity: 0.8 }]} accessibilityRole="button" accessibilityLabel={t.title}>
      <View style={s.ic}>
        <Text style={s.icText}>{t.icon}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <Text style={s.itemTitle}>{t.title}</Text>
          {favorite ? <Text style={{ color: colors.moon }}>♥</Text> : null}
          {t.tag ? <Pill text={t.tag} /> : null}
          {soon ? <Pill text={tr('por grabar', 'coming soon')} soft /> : locked ? <Pill text={tr('suscripción', 'subscription')} soft /> : null}
        </View>
        <Text style={s.itemSub}>{t.subtitle}</Text>
      </View>
      <Text style={s.dur}>{locked && !soon ? '🔒' : t.loop ? '∞' : t.duration ?? ''}</Text>
    </Pressable>
  );
}

export function Pill({ text, soft }: { text: string; soft?: boolean }) {
  return (
    <View style={[s.pill, soft && { backgroundColor: colors.lilacSoft }]}>
      <Text style={[s.pillText, soft && { color: colors.lilac }]}>{text.toUpperCase()}</Text>
    </View>
  );
}

export function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, on && s.chipOn]} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
      <Text style={[s.chipText, on && { color: colors.lilac }]}>{label}</Text>
    </Pressable>
  );
}

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Pressable onPress={() => onChange(!value)} accessibilityRole="switch" accessibilityState={{ checked: value }} accessibilityLabel={label} style={[s.sw, value && { backgroundColor: colors.teal }]}>
      <View style={[s.knob, value && { left: 21 }]} />
    </Pressable>
  );
}

export function Row({ title, sub, right, style }: { title: string; sub?: string; right?: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[s.row, style]}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.itemTitle}>{title}</Text>
        {sub ? <Text style={s.itemSub}>{sub}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Cta({ label, onPress, style }: { label: string; onPress: () => void; style?: ViewStyle }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.cta, style, pressed && { opacity: 0.85 }]} accessibilityRole="button">
      <Text style={s.ctaText}>{label}</Text>
    </Pressable>
  );
}

export function LinkButton({ label, onPress, color }: { label: string; onPress: () => void; color?: string }) {
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: 10 }} accessibilityRole="button" hitSlop={8}>
      <Text style={[s.link, color ? { color } : null]}>{label}</Text>
    </Pressable>
  );
}

export function Stepper({ label, value, onMinus, onPlus }: { label: string; value: string; onMinus: () => void; onPlus: () => void }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={s.stepper}>
        <Pressable onPress={onMinus} style={s.stepBtn} accessibilityLabel={`Restar a ${label}`} hitSlop={6}>
          <Text style={s.stepBtnText}>−</Text>
        </Pressable>
        <Text style={s.stepValue}>{value}</Text>
        <Pressable onPress={onPlus} style={s.stepBtn} accessibilityLabel={`Sumar a ${label}`} hitSlop={6}>
          <Text style={s.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const s = StyleSheet.create({
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: themeName === 'estrellada' ? colors.moon : themeName === 'algodon' ? colors.lilac : colors.muted },
  h2: { fontFamily: fonts.display, fontSize: themeName === 'estrellada' ? 28 : 25, color: colors.text, marginTop: 4, marginBottom: 14 },
  h3: { fontFamily: fonts.display, fontSize: 16, color: colors.text, marginTop: 22, marginBottom: 10 },
  hint: { fontFamily: fonts.body, color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8 },
  tileWrap: { width: '48.5%', borderRadius: 26, overflow: 'hidden' },
  tile: { minHeight: 118, padding: 15, justifyContent: 'space-between', borderRadius: 26, overflow: 'hidden' },
  glassBorder: { borderWidth: 1, borderColor: colors.line },
  tileBubble: { position: 'absolute', right: -20, bottom: -20, width: 84, height: 84, borderRadius: 42, backgroundColor: '#ffffff66' },
  tileIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#ffffffb3', alignItems: 'center', justifyContent: 'center' },
  tileTitle: { fontFamily: colors.glass ? fonts.bodyBold : fonts.display, fontSize: 16, color: colors.tileText ?? '#fffaf5' },
  tileSub: { fontFamily: fonts.body, fontSize: 12, color: colors.onTile, marginTop: 1 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: 22, padding: 12, borderWidth: 1, borderColor: colors.glass ? colors.line : 'transparent', ...(themeName === 'algodon' ? { boxShadow: '0 6px 18px rgba(122,102,207,0.10)' } : null) },
  ic: { width: 42, height: 42, borderRadius: 15, backgroundColor: colors.sky2, alignItems: 'center', justifyContent: 'center' },
  icText: { color: colors.teal, fontFamily: fonts.display, fontSize: 16 },
  itemTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  itemSub: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 2 },
  dur: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  pill: { backgroundColor: colors.tealSoft, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 },
  pillText: { fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 0.6, color: colors.teal },
  chip: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 18, paddingVertical: 11, paddingHorizontal: 14 },
  chipOn: { backgroundColor: colors.lilacSoft, borderColor: colors.lilac },
  chipText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.text },
  sw: { width: 46, height: 28, borderRadius: 99, backgroundColor: colors.line, justifyContent: 'center' },
  knob: { position: 'absolute', left: 3, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: 22, padding: 14, borderWidth: 1, borderColor: colors.glass ? colors.line : 'transparent', ...(themeName === 'algodon' ? { boxShadow: '0 6px 18px rgba(122,102,207,0.10)' } : null) },
  cta: { backgroundColor: colors.moon, borderRadius: 22, paddingVertical: 15, alignItems: 'center' },
  ctaText: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.sky },
  link: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.muted, textAlign: 'center' },
  fieldLabel: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.muted },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: 6 },
  stepBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.sky2, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { color: colors.text, fontSize: 22, fontFamily: fonts.bodySemi },
  stepValue: { flex: 1, textAlign: 'center', color: colors.text, fontFamily: fonts.bodyBold, fontSize: 17 },
});
