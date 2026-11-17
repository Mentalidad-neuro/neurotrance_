// Idioma de la app: español o inglés. Por defecto, el del teléfono.
export type Lang = 'es' | 'en';

export function deviceLang(): Lang {
  try {
    const nav = (globalThis as { navigator?: { language?: string } }).navigator;
    const loc = (nav?.language || Intl.DateTimeFormat().resolvedOptions().locale || 'es').toLowerCase();
    return loc.startsWith('es') ? 'es' : 'en';
  } catch {
    return 'es';
  }
}

let current: Lang = deviceLang();
export const getLang = () => current;
export const setLang = (l: Lang) => {
  current = l;
};

// tr('Hola', 'Hello') devuelve el texto del idioma activo.
export const tr = (es: string, en: string) => (current === 'en' ? en : es);

// Hace que los campos de un objeto cambien según el idioma activo.
export function bilingual<T extends object>(obj: T, en: Partial<T>): T {
  for (const k of Object.keys(en) as (keyof T)[]) {
    const es = obj[k];
    const e = en[k];
    Object.defineProperty(obj, k, { get: () => (current === 'en' ? e : es), enumerable: true, configurable: true });
  }
  return obj;
}
