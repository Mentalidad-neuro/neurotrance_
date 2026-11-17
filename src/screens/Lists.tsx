import React from 'react';
import { View } from 'react-native';
import { Eyebrow, H2, H3, Hint, TrackRow } from '../components/ui';
import { HIPNOSIS, MEDITACIONES, SONIDOS, TRANCE, Track } from '../content';
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
      <H2>{tr('Sesiones para tu mente', 'Sessions for your mind')}</H2>
      <List items={HIPNOSIS} open={open} />
      <Hint>{tr('Cada sesión tendrá un fondo de sonido para entrar en trance y un final para dormir o para despertar con energía.', 'Each session will have a background sound to help you go into trance, and an ending to fall asleep or to wake up with energy.')}</Hint>
      <H3>{tr('Visuales para entrar en trance', 'Visuals for going into trance')}</H3>
      <List items={TRANCE} open={open} />
      <Hint>{tr('Con ondas theta de fondo (usa audífonos). Sin destellos ni parpadeos. Si eres sensible a la luz, usa el modo suave o solo audio en Mi espacio.', 'With theta waves in the background (use headphones). No flashes or flicker. If you are sensitive to light, use gentle mode or audio only in My space.')}</Hint>
    </View>
  );
}

export function Evaluaciones({ open }: P) {
  return (
    <View>
      <Eyebrow>{tr('Para la prueba', 'For the exam')}</Eyebrow>
      <H2>{tr('Meditaciones de 3 minutos', '3-minute meditations')}</H2>
      <List items={MEDITACIONES} open={open} />
      <Hint>{tr('Úsalas la noche antes, en la fila de entrada o en medio de la prueba. Con audífonos se escuchan mejor.', 'Use them the night before, in line before going in, or in the middle of the exam. They sound best with headphones.')}</Hint>
    </View>
  );
}
