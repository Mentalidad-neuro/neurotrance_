import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { useFonts } from 'expo-font';
import { Sora_400Regular } from '@expo-google-fonts/sora/400Regular';
import { Sora_600SemiBold } from '@expo-google-fonts/sora/600SemiBold';
import { NunitoSans_400Regular } from '@expo-google-fonts/nunito-sans/400Regular';
import { NunitoSans_600SemiBold } from '@expo-google-fonts/nunito-sans/600SemiBold';
import { NunitoSans_700Bold } from '@expo-google-fonts/nunito-sans/700Bold';
import { Quicksand_500Medium } from '@expo-google-fonts/quicksand/500Medium';
import { Quicksand_700Bold } from '@expo-google-fonts/quicksand/700Bold';
import { Fraunces_400Regular } from '@expo-google-fonts/fraunces/400Regular';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import Backdrop from './src/components/Backdrop';
import { SettingsProvider, useAccess, useSettings } from './src/store';
import { Track, findTrack } from './src/content';
import { colors, fonts, themeName } from './src/theme';
import { VERIFY_URL } from './src/config';
import Onboarding from './src/screens/Onboarding';
import Home, { Tab } from './src/screens/Home';
import { Dormir, Evaluaciones, Hipnosis } from './src/screens/Lists';
import Profile from './src/screens/Profile';
import Estudiar from './src/screens/Estudiar';
import Player from './src/screens/Player';
import Paywall from './src/screens/Paywall';
import { tr } from './src/i18n';

const TABS: { key: Tab; label: () => string; icon: React.ReactNode }[] = [
  { key: 'inicio', label: () => tr('Inicio', 'Home'), icon: <Path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z" /> },
  {
    key: 'estudiar',
    label: () => tr('Estudiar', 'Study'),
    icon: (
      <>
        <Path d="M4 6.5C6.5 5 9.5 5 12 6.5v12C9.5 17 6.5 17 4 18.5z" />
        <Path d="M20 6.5C17.5 5 14.5 5 12 6.5v12c2.5-1.5 5.5-1.5 8 0z" />
      </>
    ),
  },
  { key: 'dormir', label: () => tr('Dormir', 'Sleep'), icon: <Path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /> },
  {
    key: 'evaluaciones',
    label: () => tr('Meditar', 'Meditate'),
    icon: (
      <>
        <Circle cx={12} cy={6} r={2.5} />
        <Path d="M12 10c-2 0-3 1.5-3 3.5V16h6v-2.5c0-2-1-3.5-3-3.5z" />
        <Path d="M4 19c2.5-2 5-3 8-3s5.5 1 8 3" />
      </>
    ),
  },
  {
    key: 'hipnosis',
    label: () => tr('Hipnosis', 'Hypnosis'),
    icon: (
      <>
        <Circle cx={12} cy={12} r={8} />
        <Circle cx={12} cy={12} r={4} />
      </>
    ),
  },
];

function Main() {
  const { ready, s, update } = useSettings();
  const { isLocked } = useAccess();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('inicio');
  const [profile, setProfile] = useState(false);
  const [onb, setOnb] = useState(false);
  const [playing, setPlaying] = useState<Track | null>(null);
  const [paywall, setPaywall] = useState<Track | null | undefined>(undefined);

  // Al abrir la app, revisa si la suscripción sigue activa (si se canceló, vuelve a la versión gratis).
  useEffect(() => {
    if (!ready || !VERIFY_URL || !s.premiumEmail) return;
    fetch(`${VERIFY_URL}?email=${encodeURIComponent(s.premiumEmail)}`)
      .then((r) => r.json())
      .then((j) => {
        if (j && j.active === false) update({ premium: false });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.sky }} />;
  if (!s.onboarded || onb) return <Onboarding onDone={() => setOnb(false)} />;

  const open = (t: Track) => {
    if ((!t.source && !t.breathing) || isLocked(t)) setPaywall(t);
    else setPlaying(t);
  };
  const playId = (id: string) => {
    const t = findTrack(id);
    if (t) open(t);
  };
  const go = (t: Tab) => {
    setProfile(false);
    setTab(t);
  };

  let screen: React.ReactNode;
  if (profile) screen = <Profile back={() => setProfile(false)} open={open} restartOnboarding={() => setOnb(true)} />;
  else if (tab === 'inicio') screen = <Home go={go} openProfile={() => setProfile(true)} play={playId} />;
  else if (tab === 'dormir') screen = <Dormir open={open} />;
  else if (tab === 'hipnosis') screen = <Hipnosis open={open} />;
  else if (tab === 'evaluaciones') screen = <Evaluaciones open={open} />;
  const studyVisible = !profile && tab === 'estudiar';
  const pad = { paddingTop: insets.top + 18, paddingHorizontal: 18, paddingBottom: 24 };

  return (
    <View style={{ flex: 1, backgroundColor: colors.sky }}>
      <Backdrop />
      {/* Estudiar queda siempre montada para que el pomodoro siga corriendo al cambiar de pestaña. */}
      <ScrollView style={{ display: studyVisible ? 'flex' : 'none' }} contentContainerStyle={pad}>
        <Estudiar locked={(t) => setPaywall(t)} />
      </ScrollView>
      {!studyVisible && (
        <ScrollView key={profile ? 'perfil' : tab} contentContainerStyle={pad}>
          {screen}
        </ScrollView>
      )}
      <View style={[st.tabs, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {TABS.map((t) => {
          const on = !profile && tab === t.key;
          const c = on ? colors.moon : colors.muted;
          return (
            <Pressable key={t.key} style={st.tab} onPress={() => go(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8}>
                {t.icon}
              </Svg>
              <Text style={[st.tabText, { color: c }]} numberOfLines={1}>
                {t.label()}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {playing && <Player key={playing.id} track={playing} onClose={() => setPlaying(null)} />}
      {paywall !== undefined && <Paywall track={paywall} onClose={() => setPaywall(undefined)} />}
    </View>
  );
}

export default function App() {
  const [loaded] = useFonts({
    Sora_400Regular,
    Sora_600SemiBold,
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
    Quicksand_500Medium,
    Quicksand_700Bold,
    Fraunces_400Regular,
    Fraunces_600SemiBold,
  });
  return (
    <SafeAreaProvider>
      <StatusBar style={colors.statusBar} />
      {/* En computador, la app se muestra con ancho de celular, centrada. */}
      <View style={st.outer}>
        <View style={st.phone}>
          {loaded ? (
            <SettingsProvider>
              <Main />
            </SettingsProvider>
          ) : (
            <View style={{ flex: 1, backgroundColor: colors.sky }} />
          )}
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const st = StyleSheet.create({
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.sky2, paddingTop: 10 },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  tabText: { fontFamily: fonts.bodySemi, fontSize: 11 },
  outer: { flex: 1, alignItems: 'center', backgroundColor: Platform.OS === 'web' ? (themeName === 'estrellada' ? '#070a20' : '#e4ebf1') : colors.sky },
  phone: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 460 : undefined,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { boxShadow: '0 0 40px rgba(0,0,0,0.18)' } : null),
  },
});
