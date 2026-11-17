import React from 'react';
import { View } from 'react-native';
import CancelInfo from '../components/CancelInfo';
import { Chip, Eyebrow, H2, H3, Hint, LinkButton, Row, Stepper, Toggle, TrackRow } from '../components/ui';
import { GOALS, Track, findTrack } from '../content';
import { addDays, addMinutes, defaultExamDate } from '../dates';
import { scheduleBedtimeReminder } from '../notifications';
import { formatDate, todayKey, useAccess, useSettings } from '../store';

export default function Profile({ back, open, restartOnboarding }: { back: () => void; open: (t: Track) => void; restartOnboarding: () => void }) {
  const { s, update } = useSettings();
  const { isLocked, inTrial, daysLeft } = useAccess();
  const exam = s.examDate ?? defaultExamDate();
  const favs = s.favorites.map(findTrack).filter(Boolean) as Track[];

  const setBedtime = (b: string) => {
    update({ bedtime: b });
    scheduleBedtimeReminder(b, s.reminder);
  };
  const setReminder = (v: boolean) => {
    update({ reminder: v });
    scheduleBedtimeReminder(s.bedtime, v);
  };

  return (
    <View>
      <View style={{ alignSelf: 'flex-start' }}>
        <LinkButton label="‹ Inicio" onPress={back} />
      </View>
      <Eyebrow>Mi espacio</Eyebrow>
      <H2>Ajustes para tu calma</H2>

      <View style={{ gap: 12 }}>
        <Stepper
          label="Mi próxima evaluación"
          value={formatDate(exam)}
          onMinus={() => {
            const d = addDays(exam, -1);
            if (d >= todayKey()) update({ examDate: d });
          }}
          onPlus={() => update({ examDate: addDays(exam, 1) })}
        />
        <Stepper label="Hora de acostarme" value={s.bedtime} onMinus={() => setBedtime(addMinutes(s.bedtime, -15))} onPlus={() => setBedtime(addMinutes(s.bedtime, 15))} />
      </View>

      <H3>Noche</H3>
      <View style={{ gap: 8 }}>
        <Row title="Recordatorio de noche" sub={`Te avisamos a las ${addMinutes(s.bedtime, -15)}`} right={<Toggle label="Recordatorio de noche" value={s.reminder} onChange={setReminder} />} />
        <Row title="Pantalla oscura al dormir" sub="La pantalla se oscurece y el sonido sigue" right={<Toggle label="Pantalla oscura" value={s.dimScreen} onChange={(v) => update({ dimScreen: v })} />} />
        <Row title="Aviso de audífonos" sub="Para las ondas binaurales" right={<Toggle label="Aviso de audífonos" value={s.headphoneTip} onChange={(v) => update({ headphoneTip: v })} />} />
      </View>

      <H3>Visuales y fotosensibilidad</H3>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {[
          { k: 'normal' as const, l: 'Visuales' },
          { k: 'suave' as const, l: 'Modo suave' },
          { k: 'audio' as const, l: 'Solo audio' },
        ].map((o) => (
          <Chip key={o.k} label={o.l} on={s.visualMode === o.k} onPress={() => update({ visualMode: o.k, photoWarned: true })} />
        ))}
      </View>
      <Hint>
        Ningún visual tiene destellos ni parpadeos. El modo suave los hace más lentos y con menos contraste. Solo audio deja la pantalla oscura. Si tu teléfono tiene activado "reducir movimiento", los visuales quedan quietos.
      </Hint>

      <H3>Lo que me cuesta</H3>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {GOALS.map((g) => (
          <Chip key={g} label={g} on={s.goals.includes(g)} onPress={() => update({ goals: s.goals.includes(g) ? s.goals.filter((x) => x !== g) : [...s.goals, g] })} />
        ))}
      </View>

      <H3>Mis favoritos</H3>
      {favs.length ? (
        <View style={{ gap: 8 }}>
          {favs.map((t) => (
            <TrackRow key={t.id} t={t} locked={isLocked(t)} favorite onPress={() => open(t)} />
          ))}
        </View>
      ) : (
        <Hint>Toca el corazón en cualquier audio para guardarlo aquí.</Hint>
      )}

      {__DEV__ && (
        <>
          <H3>Solo para pruebas</H3>
          <Row title="Probar como suscriptora" sub="Desbloquea todo. No aparece en la app publicada." right={<Toggle label="Probar como suscriptora" value={s.premium} onChange={(v) => update({ premium: v })} />} />
        </>
      )}

      <H3>Mi suscripción</H3>
      <Hint>{s.premium ? 'Tienes la suscripción activa.' : inTrial ? `Prueba gratis: te quedan ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'} con todo libre.` : 'Tu prueba gratis terminó.'}</Hint>
      <CancelInfo />

      <View style={{ marginTop: 14 }}>
        <LinkButton label="Ver la bienvenida otra vez" onPress={restartOnboarding} />
      </View>
    </View>
  );
}
