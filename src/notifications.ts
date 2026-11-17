import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { tr } from './i18n';

const BEDTIME_ID = 'recordatorio-noche';
const POMODORO_ID = 'pomodoro-fin';

async function ensurePermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const perm = await Notifications.requestPermissionsAsync();
  return perm.granted;
}

async function ensureChannel(id: string, name: string) {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(id, { name, importance: Notifications.AndroidImportance.DEFAULT });
  }
}

// Recordatorio de noche: 15 minutos antes de la hora de dormir.
export async function scheduleBedtimeReminder(bedtime: string, enabled: boolean) {
  if (Platform.OS === 'web') return false;
  try {
    await Notifications.cancelScheduledNotificationAsync(BEDTIME_ID).catch(() => {});
    if (!enabled) return true;
    if (!(await ensurePermission())) return false;
    await ensureChannel('noche', tr('Recordatorio de noche', 'Bedtime reminder'));
    const [h, m] = bedtime.split(':').map(Number);
    let total = h * 60 + m - 15;
    if (total < 0) total += 24 * 60;
    await Notifications.scheduleNotificationAsync({
      identifier: BEDTIME_ID,
      content: {
        title: tr('Es hora de bajar el ritmo', 'Time to wind down'),
        body: tr('Tu sonido para dormir te espera. Lo que estudiaste hoy se guarda mientras descansas.', 'Your sleep sound is waiting. What you studied today is stored while you rest.'),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: Math.floor(total / 60),
        minute: total % 60,
        channelId: Platform.OS === 'android' ? 'noche' : undefined,
      },
    });
    return true;
  } catch {
    return false;
  }
}

// Aviso de fin de bloque Pomodoro, por si la app está en segundo plano.
export async function schedulePomodoroEnd(at: Date, title: string, body: string) {
  if (Platform.OS === 'web') return;
  try {
    await cancelPomodoroEnd();
    if (!(await ensurePermission())) return;
    await ensureChannel('estudio', 'Pomodoro');
    await Notifications.scheduleNotificationAsync({
      identifier: POMODORO_ID,
      content: { title, body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: at,
        channelId: Platform.OS === 'android' ? 'estudio' : undefined,
      },
    });
  } catch {}
}

export async function cancelPomodoroEnd() {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(POMODORO_ID).catch(() => {});
}
