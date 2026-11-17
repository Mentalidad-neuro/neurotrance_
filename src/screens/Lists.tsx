import React from 'react';
import { View } from 'react-native';
import { Eyebrow, H2, H3, Hint, TrackRow } from '../components/ui';
import { HIPNOSIS, MEDITACIONES, SONIDOS, TRANCE, Track } from '../content';
import { useSettings } from '../store';
import { colors } from '../theme';

type P = { open: (t: Track) => void };

function List({ items, open }: { items: Track[] } & P) {
  const { s } = useSettings();
  return (
    <View style={{ gap: 8 }}>
      {items.map((t) => (
        <TrackRow key={t.id} t={t} locked={!t.free && !s.premium} favorite={s.favorites.includes(t.id)} onPress={() => open(t)} />
      ))}
    </View>
  );
}

export function Dormir({ open }: P) {
  return (
    <View>
      <Eyebrow color={colors.blue}>Dormir y recordar</Eyebrow>
      <H2>Sonidos para la noche</H2>
      <List items={SONIDOS} open={open} />
      <Hint>Elige cuánto rato suena y se apaga solo, bajando el volumen de a poco.</Hint>
      <H3>Repaso mientras duermes</H3>
      <Hint>
        Próximamente: un sonido ancla que suena mientras estudias y vuelve muy suave durante la noche. Se basa en estudios de reactivación de memoria durante el sueño.
      </Hint>
    </View>
  );
}

export function Hipnosis({ open }: P) {
  return (
    <View>
      <Eyebrow>Hipnosis transformacional</Eyebrow>
      <H2>Sesiones para tu mente</H2>
      <List items={HIPNOSIS} open={open} />
      <Hint>Cada sesión tendrá un fondo de sonido para entrar en trance y un final para dormir o para despertar con energía.</Hint>
      <H3>Visuales para entrar en trance</H3>
      <List items={TRANCE} open={open} />
      <Hint>Con ondas theta de fondo (usa audífonos). Sin destellos ni parpadeos. Si eres sensible a la luz, usa el modo suave o solo audio en Mi espacio.</Hint>
    </View>
  );
}

export function Evaluaciones({ open }: P) {
  return (
    <View>
      <Eyebrow>Para la prueba</Eyebrow>
      <H2>Meditaciones de 3 minutos</H2>
      <List items={MEDITACIONES} open={open} />
      <Hint>Úsalas la noche antes, en la fila de entrada o en medio de la prueba. Con audífonos se escuchan mejor.</Hint>
    </View>
  );
}
