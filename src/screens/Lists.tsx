import React from 'react';
import { View } from 'react-native';
import { Eyebrow, H2, H3, Hint, TrackRow } from '../components/ui';
import { HIPNOSIS, MEDITACIONES, RESPIRACION, SONIDOS, TRANCE, Track } from '../content';
import { useAccess, useSettings } from '../store';
import { colors } from '../theme';
import { tr } from '../i18n';

type P = { open: (t: Track) => void };

function List({ items, open }: { items: Track[] } & P) {
  const { s } = useSettings();
  const { isLocked } = useAccess();
  return (
    <View style={{ gap: 8 }}>
      {items.map((t) => (
        <TrackRow key={t.id} t={t} locked={isLocked(t)} favorite={s.favorites.includes(t.id)} onPress={() => open(t)} />
      ))}
    </View>
  );
}

export function Dormir({ open }: P) {
  return (
    <View>
      <Eyebrow color={colors.blue}>{tr('Dormir y recordar', 'Sleep and remember')}</Eyebrow>
      <H2>{tr('Sonidos para la noche', 'Sounds for the night')}</H2>
      <List items={SONIDOS} open={open} />
      <Hint>{tr('Elige cuánto rato suena y se apaga solo, bajando el volumen de a poco.', 'Choose how long it plays. It turns itself off, fading out gently.')}</Hint>
      <H3>{tr('Repaso mientras duermes', 'Review while you sleep')}</H3>
      <Hint>
        {tr(
          'Próximamente: un sonido ancla que suena mientras estudias y vuelve muy suave durante la noche. Se basa en estudios de reactivación de memoria durante el sueño.',
          'Coming soon: an anchor sound that plays while you study and returns very softly during the night. It is based on research on memory reactivation during sleep.',
        )}
      </Hint>
    </View>
  );
}

export function Hipnosis({ open }: P) {
  return (
    <View>
      <Eyebrow>{tr('Hipnosis transformacional', 'Transformational hypnosis')}</Eyebrow>
      <H2>{tr('Sesiones para entrar en trance', 'Sessions to go into trance')}</H2>
      <List items={HIPNOSIS} open={open} />
      <Hint>{tr('Elige en el reproductor el sonido de fondo que más te ayude a entrar en trance. Usa audífonos y busca un lugar tranquilo.', 'In the player, choose the background sound that best helps you go into trance. Use headphones and find a quiet place.')}</Hint>
      <H3>{tr('Visuales para entrar en trance', 'Visuals for going into trance')}</H3>
      <List items={TRANCE} open={open} />
      <Hint>{tr('Elige el sonido de fondo que prefieras. Sin destellos ni parpadeos. Si eres sensible a la luz, usa el modo suave o solo audio en Mi espacio.', 'Choose the background sound you like. No flashes or flicker. If you are sensitive to light, use gentle mode or audio only in My space.')}</Hint>
    </View>
  );
}

export function Evaluaciones({ open }: P) {
  return (
    <View>
      <Eyebrow color={colors.teal}>{tr('Meditaciones guiadas', 'Guided meditations')}</Eyebrow>
      <H2>{tr('Para antes y durante la prueba', 'For before and during the exam')}</H2>
      <List items={MEDITACIONES} open={open} />
      <Hint>{tr('Úsalas la noche antes, en la fila de entrada o en medio de la prueba. Con audífonos se escuchan mejor.', 'Use them the night before, in line before going in, or in the middle of the exam. They sound best with headphones.')}</Hint>
      <H3>{tr('Minutos de respiración', 'Breathing minutes')}</H3>
      <List items={RESPIRACION} open={open} />
      <Hint>{tr('Sigue el círculo: crece al inhalar, se queda quieto al sostener y se achica al exhalar. Cada paso muestra sus segundos.', 'Follow the circle: it grows as you breathe in, stays still while you hold and shrinks as you breathe out. Each step shows its seconds.')}</Hint>
    </View>
  );
}
