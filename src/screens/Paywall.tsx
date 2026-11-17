import React, { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Cta, LinkButton, Logo } from '../components/ui';
import CancelInfo from '../components/CancelInfo';
import type { Track } from '../content';
import { MERCADO_PAGO_PLAN_URL, PRICE_TEXT, PRICE_TEXT_EN, TRIAL_DAYS, VERIFY_URL } from '../config';
import { useAccess, useSettings } from '../store';
import { colors, fonts } from '../theme';
import Backdrop from '../components/Backdrop';
import { tr } from '../i18n';

// Pantalla de suscripción. El cobro se hace con un plan de Mercado Pago (con días de prueba gratis).
// Sin registro: para activar en otro teléfono basta con el correo usado en Mercado Pago.
export default function Paywall({ track, onClose }: { track: Track | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const notRecorded = track && !track.source;
  const { update } = useSettings();
  const { inTrial, daysLeft } = useAccess();
  const [askEmail, setAskEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [checking, setChecking] = useState(false);
  const [msg, setMsg] = useState('');
  const ready = !!MERCADO_PAGO_PLAN_URL;

  const verify = async () => {
    if (!VERIFY_URL) return setMsg(tr('La activación estará disponible muy pronto.', 'Activation will be available very soon.'));
    setChecking(true);
    setMsg('');
    try {
      const r = await fetch(`${VERIFY_URL}?email=${encodeURIComponent(email.trim())}`);
      const j = await r.json();
      if (j.active) {
        update({ premium: true, premiumEmail: email.trim().toLowerCase() });
        onClose();
      } else setMsg(tr('No encontramos una suscripción activa con ese correo. Revisa que sea el mismo de Mercado Pago.', 'We could not find an active subscription with that email. Check that it is the same one you use in Mercado Pago.'));
    } catch {
      setMsg(tr('No pudimos revisar ahora. Prueba de nuevo con internet.', 'We could not check right now. Try again with an internet connection.'));
    } finally {
      setChecking(false);
    }
  };
  return (
    <LinearGradient colors={[colors.gradTop, colors.sky]} locations={[0, 0.7]} style={[st.wrap, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
      <Backdrop />
      <View style={{ alignSelf: 'flex-start' }}>
        <LinkButton label={tr('‹ Volver', '‹ Back')} onPress={onClose} />
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
      <View style={{ alignItems: 'center', marginTop: 30 }}>
        <Logo size={88} />
      </View>
      {notRecorded ? (
        <>
          <Text style={st.h}>{track!.title}</Text>
          <Text style={st.p}>{tr('Esta sesión se está grabando. Estará disponible en una próxima actualización de la app.', 'This session is being recorded. It will be available in an upcoming update of the app.')}</Text>
        </>
      ) : (
        <>
          <View style={st.badge}>
            <Text style={st.badgeText}>{inTrial ? tr(`PRUEBA GRATIS: QUEDAN ${daysLeft} ${daysLeft === 1 ? 'DÍA' : 'DÍAS'}`, `FREE TRIAL: ${daysLeft} ${daysLeft === 1 ? 'DAY' : 'DAYS'} LEFT`) : tr('TU PRUEBA GRATIS TERMINÓ', 'YOUR FREE TRIAL HAS ENDED')}</Text>
          </View>
          <Text style={st.h}>{tr('NeuroTrance completo', 'All of NeuroTrance')}</Text>
          <Text style={st.p}>{track ? tr(`Para seguir escuchando "${track.title}", suscríbete.`, `To keep listening to "${track.title}", subscribe.`) : ''} {tr('Con la suscripción tienes:', 'With the subscription you get:')}</Text>
          {PRICE_TEXT ? <Text style={st.price}>{tr(PRICE_TEXT, PRICE_TEXT_EN)}</Text> : null}
          <View style={{ gap: 10, marginTop: 8 }}>
            {[
              tr('Todas las meditaciones para evaluaciones', 'All the meditations for exams'),
              tr('Todos los sonidos para estudiar y dormir', 'All the sounds for studying and sleeping'),
              tr('Las sesiones de hipnosis a medida que salen', 'The hypnosis sessions as they come out'),
              tr('Nuevos audios cada mes', 'New audios every month'),
            ].map((b) => (
              <Text key={b} style={st.li}>
                <Text style={{ color: colors.teal }}>✓ </Text>
                {b}
              </Text>
            ))}
          </View>
          <View style={{ flex: 1, minHeight: 24 }} />
          {askEmail ? (
            <View style={{ gap: 10 }}>
              <Text style={st.p}>{tr('Escribe el correo con el que te suscribiste en Mercado Pago.', 'Enter the email you used to subscribe in Mercado Pago.')}</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={tr('tucorreo@ejemplo.com', 'you@example.com')}
                placeholderTextColor="#7f89ad"
                autoCapitalize="none"
                keyboardType="email-address"
                style={st.input}
                accessibilityLabel={tr('Correo de Mercado Pago', 'Mercado Pago email')}
              />
              {checking ? <ActivityIndicator color={colors.moon} /> : <Cta label={tr('Activar', 'Activate')} onPress={verify} />}
            </View>
          ) : (
            <Cta
              label={ready ? tr('Suscribirme', 'Subscribe') : tr('Muy pronto', 'Coming soon')}
              onPress={() => (ready ? Linking.openURL(MERCADO_PAGO_PLAN_URL) : onClose())}
            />
          )}
          {msg ? <Text style={[st.small, { color: colors.moon }]}>{msg}</Text> : null}
          <Text style={st.small}>
            {tr(
              `Los primeros ${TRIAL_DAYS} días son gratis, sin tarjeta. Después pagas con Mercado Pago, una vez al mes, hasta que canceles. No necesitas crear usuario en la app.`,
              `The first ${TRIAL_DAYS} days are free, no card needed. After that you pay through Mercado Pago once a month until you cancel. You do not need to create an account in the app.`,
            )}
          </Text>
          {ready && !askEmail ? (
            <Pressable onPress={() => setAskEmail(true)} hitSlop={8}>
              <Text style={[st.small, { color: colors.lilac, textDecorationLine: 'underline' }]}>{tr('Ya me suscribí', 'I already subscribed')}</Text>
            </Pressable>
          ) : null}
          {!ready ? <Text style={[st.small, { color: colors.lilac }]}>{tr('La suscripción se activará muy pronto.', 'Subscriptions will be available very soon.')}</Text> : null}
          <CancelInfo />
        </>
      )}
      </ScrollView>
    </LinearGradient>
  );
}

const st = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFill, paddingHorizontal: 24, zIndex: 11 },
  h: { fontFamily: fonts.display, fontSize: 24, color: colors.text, textAlign: 'center', marginTop: 18 },
  p: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.muted, textAlign: 'center', marginTop: 10 },
  li: { fontFamily: fonts.body, fontSize: 15, color: colors.text },
  badge: { alignSelf: 'center', backgroundColor: colors.tealSoft, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4, marginTop: 16 },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1, color: colors.teal },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontFamily: fonts.bodySemi, fontSize: 15 },
  price: { fontFamily: fonts.display, fontSize: 22, color: colors.moon, textAlign: 'center', marginTop: 8 },
  small: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 10 },
});
