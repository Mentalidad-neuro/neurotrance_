import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Recordatorio de noche: 15 minutos antes de la hora de dormir.
export async function scheduleBedtimeReminder(bedtime: string, enabled: boolean) {
  if (Platform.OS === 'web') return false;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!enabled) return true;
    const perm = await Notifications.requestPermissionsAsync();
    if (!perm.granted) return false;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('noche', {
        name: 'Recordatorio de noche',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const [h, m] = bedtime.split(':').map(Number);
    let total = h * 60 + m - 15;
    if (total < 0) total += 24 * 60;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Es hora de bajar el ritmo',
        body: 'Tu sonido para dormir te espera. Lo que estudiaste hoy se guarda mientras descansas.',
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
