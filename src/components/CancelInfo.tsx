import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

const STEPS = [
  'Abre la app o la página de Mercado Pago e inicia sesión con la cuenta con que pagaste.',
  'Entra a tu perfil y busca "Suscripciones".',
  'Elige NeuroTrance y toca "Cancelar suscripción".',
];

// Explica cómo cancelar. Importante: borrar la app NO detiene el cobro.
export default function CancelInfo() {
  const [open, setOpen] = useState(false);
  return (
    <View style={st.wrap}>
      <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }} hitSlop={6}>
        <Text style={st.toggle}>{open ? 'Ocultar' : 'Cómo cancelar'} {open ? '▴' : '▾'}</Text>
      </Pressable>
      {open && (
        <View style={st.box}>
          <Text style={st.p}>La suscripción se cobra una vez al mes en Mercado Pago, desde que terminan los 7 días gratis, hasta que la canceles.</Text>
          {STEPS.map((t, i) => (
            <Text key={i} style={st.p}>
              {i + 1}. {t}
            </Text>
          ))}
          <Text style={[st.p, st.warn]}>Borrar la app no cancela la suscripción. Hay que cancelarla en Mercado Pago.</Text>
          <Text style={st.p}>Si cancelas durante los 7 días gratis, no se cobra nada. Si cancelas después, sigues con acceso hasta el fin del mes ya pagado.</Text>
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
