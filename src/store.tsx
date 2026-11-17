import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lang, deviceLang, getLang, setLang } from './i18n';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Settings = {
  onboarded: boolean;
  goals: string[];
  examDate: string | null; // AAAA-MM-DD
  bedtime: string; // HH:MM
  reminder: boolean;
  dimScreen: boolean;
  headphoneTip: boolean;
  favorites: string[];
  premium: boolean; // suscripción activa (Mercado Pago)
  premiumEmail: string | null;
  firstOpen: number | null; // inicio de la prueba gratis
  visualMode: 'normal' | 'suave' | 'audio'; // accesibilidad para fotosensibilidad
  photoWarned: boolean;
  studyList: { id: string; text: string; done: boolean }[];
  lang: Lang | null; // null = idioma del teléfono
  // minutos escuchados por día: { '2026-11-17': 12.5 }
  listened: Record<string, number>;
};

const DEFAULTS: Settings = {
  onboarded: false,
  goals: [],
  examDate: null,
  bedtime: '23:00',
  reminder: true,
  dimScreen: true,
  headphoneTip: true,
  favorites: [],
  premium: false,
  premiumEmail: null,
  firstOpen: null,
  visualMode: 'normal',
  photoWarned: false,
  studyList: [],
  lang: null,
  listened: {},
};

const KEY = 'neurotrance.settings.v1';

type Ctx = {
  ready: boolean;
  s: Settings;
  update: (patch: Partial<Settings>) => void;
  toggleFavorite: (id: string) => void;
  addListening: (minutes: number) => void;
};

const SettingsContext = createContext<Ctx | null>(null);

export function todayKey(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        const saved = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
        if (!saved.firstOpen) saved.firstOpen = Date.now();
        setLang(saved.lang ?? deviceLang());
        setS(saved);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(s)).catch(() => {});
  }, [s, ready]);

  const update = useCallback((patch: Partial<Settings>) => {
    if (patch.lang !== undefined) setLang(patch.lang ?? deviceLang());
    setS((prev) => ({ ...prev, ...patch }));
  }, []);
  const toggleFavorite = useCallback(
    (id: string) =>
      setS((prev) => ({
        ...prev,
        favorites: prev.favorites.includes(id) ? prev.favorites.filter((f) => f !== id) : [...prev.favorites, id],
      })),
    [],
  );
  const addListening = useCallback(
    (minutes: number) =>
      setS((prev) => {
        const k = todayKey();
        return { ...prev, listened: { ...prev.listened, [k]: (prev.listened[k] ?? 0) + minutes } };
      }),
    [],
  );

  const value = useMemo(() => ({ ready, s, update, toggleFavorite, addListening }), [ready, s, update, toggleFavorite, addListening]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings fuera de SettingsProvider');
  return ctx;
}

export function daysUntil(dateStr: string | null) {
  if (!dateStr) return null;
  const exam = new Date(dateStr + 'T09:00:00');
  const d = Math.ceil((exam.getTime() - Date.now()) / 864e5);
  return Math.max(0, d);
}

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export function formatDate(dateStr: string | null) {
  if (!dateStr) return getLang() === 'en' ? 'No date' : 'Sin fecha';
  const [, m, d] = dateStr.split('-').map(Number);
  return getLang() === 'en' ? `${MONTHS_EN[m - 1]} ${d}` : `${d} de ${MONTHS[m - 1]}`;
}

// Acceso a cada audio: suscripción, prueba gratis vigente o audio gratis (si así está configurado).
import { FREE_AFTER_TRIAL, TRIAL_DAYS } from './config';

export function trialDaysLeft(firstOpen: number | null) {
  if (!firstOpen) return TRIAL_DAYS;
  const left = TRIAL_DAYS - (Date.now() - firstOpen) / 864e5;
  return Math.max(0, Math.ceil(left));
}

export function useAccess() {
  const { s } = useSettings();
  const daysLeft = trialDaysLeft(s.firstOpen);
  const inTrial = !s.premium && daysLeft > 0;
  const isLocked = (t: { free: boolean; source?: number }) => !s.premium && !inTrial && !(FREE_AFTER_TRIAL && t.free);
  return { inTrial, daysLeft, isLocked, premium: s.premium };
}
