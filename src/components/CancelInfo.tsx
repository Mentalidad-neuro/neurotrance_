import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import { tr } from '../i18n';

const STEPS = () => [
  tr('Abre la app o la página de Mercado Pago e inicia sesión con la cuenta con que pagaste.', 'Open the Mercado Pago app or website and sign in with the account you paid with.'),
  tr('Entra a tu perfil y busca "Suscripciones".', 'Go to your profile and look for "Subscriptions".'),
  tr('Elige NeuroTrance y toca "Cancelar suscripción".', 'Choose NeuroTrance and tap "Cancel subscription".'),
];

// Explica cómo cancelar. Importante: borrar la app NO detiene el cobro.
export default function CancelInfo() {
  const [open, setOpen] = useState(false);
  return (
    <View style={st.wrap}>
      <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }} hitSlop={6}>
        <Text style={st.toggle}>{open ? tr('Ocultar', 'Hide') : tr('Cómo cancelar', 'How to cancel')} {open ? '▴' : '▾'}</Text>
      </Pressable>
      {open && (
        <View style={st.box}>
          <Text style={st.p}>{tr('La suscripción se cobra una vez al mes en Mercado Pago, desde que terminan los 7 días gratis, hasta que la canceles.', 'The subscription is charged once a month through Mercado Pago, starting when the 7 free days end, until you cancel it.')}</Text>
          {STEPS().map((t, i) => (
            <Text key={i} style={st.p}>
              {i + 1}. {t}
            </Text>
          ))}
          <Text style={[st.p, st.warn]}>{tr('Borrar la app no cancela la suscripción. Hay que cancelarla en Mercado Pago.', 'Deleting the app does not cancel the subscription. You need to cancel it in Mercado Pago.')}</Text>
          <Text style={st.p}>{tr('Si cancelas durante los 7 días gratis, no se cobra nada. Si cancelas después, sigues con acceso hasta el fin del mes ya pagado.', 'If you cancel during the 7 free days, you are not charged. If you cancel later, you keep access until the end of the month you already paid for.')}</Text>
        </View>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { alignItems: 'center', marginTop: 8 },
  toggle: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.lilac, textDecorationLine: 'underline' },
  box: { alignSelf: 'stretch', backgroundColor: colors.card, borderRadius: 18, padding: 14, marginTop: 8, gap: 6 },
  p: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.text },
  warn: { fontFamily: fonts.bodyBold, color: colors.moon },
});
