import React, { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Cta, LinkButton, Logo } from '../components/ui';
import type { Track } from '../content';
import { MERCADO_PAGO_PLAN_URL, TRIAL_DAYS, VERIFY_URL } from '../config';
import { useSettings } from '../store';
import { colors, fonts } from '../theme';

// Pantalla de suscripción. El cobro se hace con un plan de Mercado Pago (con días de prueba gratis).
// Sin registro: para activar en otro teléfono basta con el correo usado en Mercado Pago.
export default function Paywall({ track, onClose }: { track: Track | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const notRecorded = track && !track.source;
  const { update } = useSettings();
  const [askEmail, setAskEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [checking, setChecking] = useState(false);
  const [msg, setMsg] = useState('');
  const ready = !!MERCADO_PAGO_PLAN_URL;

  const verify = async () => {
    if (!VERIFY_URL) return setMsg('La activación estará disponible muy pronto.');
    setChecking(true);
    setMsg('');
    try {
      const r = await fetch(`${VERIFY_URL}?email=${encodeURIComponent(email.trim())}`);
      const j = await r.json();
      if (j.active) {
        update({ premium: true, premiumEmail: email.trim().toLowerCase() });
        onClose();
      } else setMsg('No encontramos una suscripción activa con ese correo. Revisa que sea el mismo de Mercado Pago.');
    } catch {
      setMsg('No pudimos revisar ahora. Prueba de nuevo con internet.');
    } finally {
      setChecking(false);
    }
  };
  return (
    <LinearGradient colors={['#2c3766', colors.sky]} locations={[0, 0.7]} style={[st.wrap, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
      <View style={{ alignSelf: 'flex-start' }}>
        <LinkButton label="‹ Volver" onPress={onClose} />
      </View>
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
          <View style={st.badge}>
            <Text style={st.badgeText}>{TRIAL_DAYS} DÍAS GRATIS</Text>
          </View>
          <Text style={st.h}>NeuroTrance completo</Text>
          <Text style={st.p}>{track ? `"${track.title}" es parte de la suscripción.` : ''} Con la suscripción tienes:</Text>
          <View style={{ gap: 10, marginTop: 8 }}>
            {['Todas las meditaciones para evaluaciones', 'Todos los sonidos para estudiar y dormir', 'Las sesiones de hipnosis a medida que salen', 'Nuevos audios cada mes'].map((b) => (
              <Text key={b} style={st.li}>
                <Text style={{ color: colors.teal }}>✓ </Text>
                {b}
              </Text>
            ))}
          </View>
          <View style={{ flex: 1 }} />
          {askEmail ? (
            <View style={{ gap: 10 }}>
              <Text style={st.p}>Escribe el correo con el que te suscribiste en Mercado Pago.</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="tucorreo@ejemplo.com"
                placeholderTextColor="#7f89ad"
                autoCapitalize="none"
                keyboardType="email-address"
                style={st.input}
                accessibilityLabel="Correo de Mercado Pago"
              />
              {checking ? <ActivityIndicator color={colors.moon} /> : <Cta label="Activar" onPress={verify} />}
            </View>
          ) : (
            <Cta
              label={ready ? `Probar ${TRIAL_DAYS} días gratis` : 'Muy pronto'}
              onPress={() => (ready ? Linking.openURL(MERCADO_PAGO_PLAN_URL) : onClose())}
            />
          )}
          {msg ? <Text style={[st.small, { color: colors.moon }]}>{msg}</Text> : null}
          <Text style={st.small}>
            Sin registro. Pagas con Mercado Pago. No se cobra nada durante los {TRIAL_DAYS} días y puedes cancelar cuando quieras antes de que terminen.
          </Text>
          {ready && !askEmail ? (
            <Pressable onPress={() => setAskEmail(true)} hitSlop={8}>
              <Text style={[st.small, { color: colors.lilac, textDecorationLine: 'underline' }]}>Ya me suscribí</Text>
            </Pressable>
          ) : null}
          {!ready ? <Text style={[st.small, { color: colors.lilac }]}>La suscripción se activará muy pronto.</Text> : null}
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
  badge: { alignSelf: 'center', backgroundColor: '#a6cdb733', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4, marginTop: 16 },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1, color: colors.teal },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontFamily: fonts.bodySemi, fontSize: 15 },
  small: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 10 },
});
