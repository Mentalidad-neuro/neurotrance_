import React from 'react';
import { View } from 'react-native';
import CancelInfo from '../components/CancelInfo';
import { Chip, Eyebrow, H2, H3, Hint, LinkButton, Row, Stepper, Toggle, TrackRow } from '../components/ui';
import { GOALS, Track, findTrack, goalLabel } from '../content';
import { addDays, addMinutes, defaultExamDate } from '../dates';
import { scheduleBedtimeReminder } from '../notifications';
import { formatDate, todayKey, useAccess, useSettings } from '../store';
import { getLang, tr } from '../i18n';

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
        <LinkButton label={tr('‹ Inicio', '‹ Home')} onPress={back} />
      </View>
      <Eyebrow>{tr('Mi espacio', 'My space')}</Eyebrow>
      <H2>{tr('Ajustes para tu calma', 'Settings for your calm')}</H2>

      <H3>{tr('Idioma', 'Language')}</H3>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
        {[
          { k: 'es' as const, l: 'Español' },
          { k: 'en' as const, l: 'English' },
        ].map((o) => (
          <Chip key={o.k} label={o.l} on={getLang() === o.k} onPress={() => update({ lang: o.k })} />
        ))}
      </View>
      <View style={{ height: 8 }} />

      <View style={{ gap: 12 }}>
        <Stepper
          label={tr('Mi próxima evaluación', 'My next exam')}
          value={formatDate(exam)}
          onMinus={() => {
            const d = addDays(exam, -1);
            if (d >= todayKey()) update({ examDate: d });
          }}
          onPlus={() => update({ examDate: addDays(exam, 1) })}
        />
        <Stepper label={tr('Hora de acostarme', 'Bedtime')} value={s.bedtime} onMinus={() => setBedtime(addMinutes(s.bedtime, -15))} onPlus={() => setBedtime(addMinutes(s.bedtime, 15))} />
      </View>

      <H3>{tr('Noche', 'Night')}</H3>
      <View style={{ gap: 8 }}>
        <Row title={tr('Recordatorio de noche', 'Bedtime reminder')} sub={tr(`Te avisamos a las ${addMinutes(s.bedtime, -15)}`, `We remind you at ${addMinutes(s.bedtime, -15)}`)} right={<Toggle label={tr('Recordatorio de noche', 'Bedtime reminder')} value={s.reminder} onChange={setReminder} />} />
        <Row title={tr('Pantalla oscura', 'Dark screen')} sub={tr('La pantalla se oscurece y el sonido sigue', 'The screen dims and the sound keeps playing')} right={<Toggle label={tr('Pantalla oscura', 'Dark screen')} value={s.darkScreen} onChange={(v) => update({ darkScreen: v })} />} />
        <Row title={tr('Aviso de audífonos', 'Headphones tip')} sub={tr('Para las ondas binaurales', 'For binaural waves')} right={<Toggle label={tr('Aviso de audífonos', 'Headphones tip')} value={s.headphoneTip} onChange={(v) => update({ headphoneTip: v })} />} />
      </View>

      <H3>{tr('Visuales y fotosensibilidad', 'Visuals and photosensitivity')}</H3>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {[
          { k: 'normal' as const, l: tr('Visuales', 'Visuals') },
          { k: 'suave' as const, l: tr('Modo suave', 'Gentle mode') },
          { k: 'audio' as const, l: tr('Solo audio', 'Audio only') },
        ].map((o) => (
          <Chip key={o.k} label={o.l} on={s.visualMode === o.k} onPress={() => update({ visualMode: o.k, photoWarned: true })} />
        ))}
      </View>
      <Hint>
        {tr(
          'Ningún visual tiene destellos ni parpadeos. El modo suave los hace más lentos y con menos contraste. Solo audio deja la pantalla oscura. Si tu teléfono tiene activado "reducir movimiento", los visuales quedan quietos.',
          'No visual has flashes or flicker. Gentle mode makes them slower and lower in contrast. Audio only keeps the screen dark. If "reduce motion" is turned on in your phone, the visuals stay still.',
        )}
      </Hint>

      <H3>{tr('Lo que me cuesta', 'What I find hard')}</H3>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {GOALS.map((g) => (
          <Chip key={g} label={goalLabel(g)} on={s.goals.includes(g)} onPress={() => update({ goals: s.goals.includes(g) ? s.goals.filter((x) => x !== g) : [...s.goals, g] })} />
        ))}
      </View>

      <H3>{tr('Mis favoritos', 'My favorites')}</H3>
      {favs.length ? (
        <View style={{ gap: 8 }}>
          {favs.map((t) => (
            <TrackRow key={t.id} t={t} locked={isLocked(t)} favorite onPress={() => open(t)} />
          ))}
        </View>
      ) : (
        <Hint>{tr('Toca el corazón en cualquier audio para guardarlo aquí.', 'Tap the heart on any audio to save it here.')}</Hint>
      )}

      {__DEV__ && (
        <>
          <H3>Solo para pruebas</H3>
          <Row title="Probar como suscriptora" sub="Desbloquea todo. No aparece en la app publicada." right={<Toggle label="Probar como suscriptora" value={s.premium} onChange={(v) => update({ premium: v })} />} />
        </>
      )}

      <H3>{tr('Mi suscripción', 'My subscription')}</H3>
      <Hint>
        {s.premium
          ? tr('Tienes la suscripción activa.', 'Your subscription is active.')
          : inTrial
            ? tr(`Prueba gratis: te quedan ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'} con todo libre.`, `Free trial: ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left with everything unlocked.`)
            : tr('Tu prueba gratis terminó.', 'Your free trial has ended.')}
      </Hint>
      <CancelInfo />

      <View style={{ marginTop: 14 }}>
        <LinkButton label={tr('Ver la bienvenida otra vez', 'See the welcome again')} onPress={restartOnboarding} />
      </View>
    </View>
  );
}
