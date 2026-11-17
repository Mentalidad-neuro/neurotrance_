import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Cta, LinkButton, Logo } from '../components/ui';
import type { Track } from '../content';
import { colors, fonts } from '../theme';

// Pantalla de suscripción. Por ahora solo informa: el cobro real se conecta
// con App Store y Google Play (por ejemplo con RevenueCat) cuando estén las cuentas.
export default function Paywall({ track, onClose }: { track: Track | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const notRecorded = track && !track.source;
  return (
    <LinearGradient colors={['#2c3766', colors.sky]} locations={[0, 0.7]} style={[st.wrap, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
      <LinkButton label="‹ Volver" onPress={onClose} />
      <View style={{ alignItems: 'center', marginTop: 30 }}>
        <Logo size={88} />
      </View>
      {notRecorded ? (
        <>
          <Text style={st.h}>{track!.title}</Text>
          <Text style={st.p}>Esta sesión se está grabando. Estará disponible en una próxima actualización de la app.</Text>
        </>
      ) : (
        <>
          <Text style={st.h}>NeuroTrance completo</Text>
          <Text style={st.p}>{track ? `"${track.title}" es parte de la suscripción.` : ''} Con la suscripción tienes:</Text>
          <View style={{ gap: 10, marginTop: 8 }}>
            {['Todas las meditaciones para evaluaciones', 'Todos los sonidos para dormir y repasar', 'Las sesiones de hipnosis a medida que salen', 'Nuevos audios cada mes'].map((b) => (
              <Text key={b} style={st.li}>
                <Text style={{ color: colors.teal }}>✓ </Text>
                {b}
              </Text>
            ))}
          </View>
          <View style={{ flex: 1 }} />
          <Cta label="Muy pronto" onPress={onClose} />
          <Text style={st.small}>La suscripción se activará cuando la app esté en App Store y Google Play.</Text>
        </>
      )}
    </LinearGradient>
  );
}

const st = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFill, paddingHorizontal: 24, zIndex: 11 },
  h: { fontFamily: fonts.display, fontSize: 24, color: colors.text, textAlign: 'center', marginTop: 18 },
  p: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.muted, textAlign: 'center', marginTop: 10 },
  li: { fontFamily: fonts.body, fontSize: 15, color: colors.text },
  small: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 10 },
});
