import AsyncStorage from '@react-native-async-storage/async-storage';
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
  premium: boolean; // se conectará con la suscripción de App Store / Google Play
  studyList: { id: string; text: string; done: boolean }[];
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
  studyList: [],
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
        if (raw) setS({ ...DEFAULTS, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(s)).catch(() => {});
  }, [s, ready]);

  const update = useCallback((patch: Partial<Settings>) => setS((prev) => ({ ...prev, ...patch })), []);
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

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export function formatDate(dateStr: string | null) {
  if (!dateStr) return 'Sin fecha';
  const [, m, d] = dateStr.split('-').map(Number);
  return `${d} de ${MONTHS[m - 1]}`;
}
