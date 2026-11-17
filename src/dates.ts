import { todayKey } from './store';

export function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return todayKey(d);
}

export function addMinutes(hhmm: string, n: number) {
  const [h, m] = hhmm.split(':').map(Number);
  let t = (h * 60 + m + n) % (24 * 60);
  if (t < 0) t += 24 * 60;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

export function defaultExamDate() {
  return addDays(todayKey(), 14);
}
