// Todo el contenido de audio de la app en un solo lugar.
import { bilingual, tr } from './i18n';

// "free: true" = disponible sin suscripción. El resto queda para la suscripción.

export type Track = {
  id: string;
  title: string;
  subtitle: string;
  kind: 'meditacion' | 'dormir' | 'hipnosis' | 'estudiar';
  source?: number; // require(...) del archivo; vacío = aún no grabado
  duration?: string; // texto para mostrar
  loop?: boolean; // los sonidos para dormir se repiten hasta el temporizador
  free: boolean;
  tag?: string;
  icon: string;
};

export const MEDITACIONES: Track[] = [
  bilingual({
    id: 'med-1',
    title: 'La noche anterior',
    subtitle: 'Para dormir en calma antes de la evaluación',
    kind: 'meditacion',
    source: require('../assets/audio/meditaciones/1-noche-anterior.mp3'),
    duration: '3:50',
    free: true,
    icon: '1',
  }, { title: 'The night before', subtitle: 'To sleep calmly before your exam', source: require('../assets/audio/meditaciones/en/1-night-before.mp3'), duration: '4:53' }),
  bilingual({
    id: 'med-2',
    title: 'Antes de entrar',
    subtitle: 'En la fila o mientras esperas',
    kind: 'meditacion',
    source: require('../assets/audio/meditaciones/2-antes-de-entrar.mp3'),
    duration: '2:58',
    free: true,
    icon: '2',
  }, { title: 'Before you walk in', subtitle: 'In line or sitting while you wait', source: require('../assets/audio/meditaciones/en/2-before-you-walk-in.mp3'), duration: '3:57' }),
  bilingual({
    id: 'med-3',
    title: 'Si me bloqueo',
    subtitle: 'Cuando una pregunta te paraliza',
    kind: 'meditacion',
    source: require('../assets/audio/meditaciones/3-bloqueo-en-la-prueba.mp3'),
    duration: '2:35',
    free: false,
    icon: '3',
  }, { title: 'If my mind goes blank', subtitle: 'When a question freezes you', source: require('../assets/audio/meditaciones/en/3-mind-goes-blank.mp3'), duration: '3:32' }),
  bilingual({
    id: 'med-4',
    title: 'Entre pruebas',
    subtitle: 'Para soltar la anterior y empezar de nuevo',
    kind: 'meditacion',
    source: require('../assets/audio/meditaciones/4-entre-pruebas.mp3'),
    duration: '2:48',
    free: false,
    icon: '4',
  }, { title: 'Between exams', subtitle: 'To let go of the last one and start fresh', source: require('../assets/audio/meditaciones/en/4-between-exams.mp3'), duration: '3:51' }),
];

export const SONIDOS: Track[] = [
  bilingual({
    id: 'snd-lluvia',
    title: 'Lluvia suave',
    subtitle: 'Tapa los ruidos de la casa',
    kind: 'dormir',
    source: require('../assets/audio/dormir/lluvia-suave.mp3'),
    loop: true,
    free: true,
    icon: '≋',
  }, { title: 'Gentle rain', subtitle: 'Covers the noises in the house' }),
  bilingual({
    id: 'snd-rosa',
    title: 'Ruido rosa',
    subtitle: 'Acompaña el sueño profundo, donde se guarda lo estudiado',
    kind: 'dormir',
    source: require('../assets/audio/dormir/ruido-rosa.mp3'),
    loop: true,
    free: true,
    tag: 'memoria',
    icon: '∿',
  }, { title: 'Pink noise', subtitle: 'Supports deep sleep, when what you studied is stored', tag: 'memory' }),
  bilingual({
    id: 'snd-olas',
    title: 'Olas del mar',
    subtitle: 'Ritmo lento para bajar la respiración',
    kind: 'dormir',
    source: require('../assets/audio/dormir/olas-del-mar.mp3'),
    loop: true,
    free: false,
    icon: '◠',
  }, { title: 'Ocean waves', subtitle: 'A slow rhythm to slow your breathing' }),
  bilingual({
    id: 'snd-delta',
    title: 'Ondas delta',
    subtitle: 'Tono binaural de 2 Hz. Usa audífonos',
    kind: 'dormir',
    source: require('../assets/audio/dormir/ondas-delta.mp3'),
    loop: true,
    free: false,
    tag: 'audífonos',
    icon: '◎',
  }, { title: 'Delta waves', subtitle: '2 Hz binaural tone. Use headphones', tag: 'headphones' }),
];

export const HIPNOSIS: Track[] = [
  bilingual({
    id: 'hip-sueno',
    title: 'Dormir profundo',
    subtitle: 'Para dormirte sin darle vueltas',
    kind: 'hipnosis',
    duration: '20 min',
    free: false,
    icon: '☾',
  }, { title: 'Deep sleep', subtitle: 'To fall asleep without overthinking' }),
  bilingual({
    id: 'hip-ansiedad',
    title: 'Soltar la ansiedad',
    subtitle: 'Calma ante la prueba',
    kind: 'hipnosis',
    duration: '15 min',
    free: false,
    icon: '○',
  }, { title: 'Release anxiety', subtitle: 'Calm before the exam' }),
  bilingual({
    id: 'hip-memoria',
    title: 'Mi mente recuerda',
    subtitle: 'Confianza en tu memoria',
    kind: 'hipnosis',
    duration: '18 min',
    free: false,
    icon: '✦',
  }, { title: 'My mind remembers', subtitle: 'Trust in your memory' }),
];

// Visuales para entrar en trance, con fondo de ondas theta (estado previo al sueño).
export const TRANCE: (Track & { visual: 'mandala' | 'luz' | 'agua' | 'estrellas' })[] = [
  bilingual({ id: 'tr-mandala', title: 'Mandala que respira', subtitle: 'Sigue su ritmo: crece al inhalar, se recoge al exhalar', kind: 'hipnosis', source: require('../assets/audio/hipnosis/ondas-theta.mp3'), loop: true, free: true, icon: '✿', visual: 'mandala' }, { title: 'Breathing mandala', subtitle: 'Follow its rhythm: it grows as you breathe in and folds as you breathe out' }),
  bilingual({ id: 'tr-luz', title: 'Punto de luz', subtitle: 'Fija la mirada y deja que los párpados pesen', kind: 'hipnosis', source: require('../assets/audio/hipnosis/ondas-theta.mp3'), loop: true, free: true, icon: '◉', visual: 'luz' }, { title: 'Point of light', subtitle: 'Rest your gaze and let your eyelids grow heavy' }),
  bilingual({ id: 'tr-agua', title: 'Ondas en el agua', subtitle: 'Cada onda se lleva un pensamiento', kind: 'hipnosis', source: require('../assets/audio/hipnosis/ondas-theta.mp3'), loop: true, free: false, icon: '◌', visual: 'agua' }, { title: 'Ripples on water', subtitle: 'Each ripple carries a thought away' }),
  bilingual({ id: 'tr-estrellas', title: 'Cielo que se apaga', subtitle: 'Las estrellas se encienden y apagan muy lento', kind: 'hipnosis', source: require('../assets/audio/hipnosis/ondas-theta.mp3'), loop: true, free: false, icon: '✧', visual: 'estrellas' }, { title: 'Fading sky', subtitle: 'The stars light up and fade very slowly' }),
];

export const ESTUDIO: Track[] = [
  bilingual({
    id: 'est-beta',
    title: 'Ondas beta',
    subtitle: 'Atención sostenida para leer y resolver ejercicios',
    kind: 'estudiar',
    source: require('../assets/audio/estudiar/ondas-beta.mp3'),
    loop: true,
    free: true,
    tag: 'audífonos',
    icon: 'β',
  }, { title: 'Beta waves', subtitle: 'Sustained attention for reading and solving problems', tag: 'headphones' }),
  bilingual({
    id: 'est-marron',
    title: 'Ruido marrón',
    subtitle: 'Tapa las distracciones sin cansar el oído',
    kind: 'estudiar',
    source: require('../assets/audio/estudiar/ruido-marron.mp3'),
    loop: true,
    free: true,
    icon: '≋',
  }, { title: 'Brown noise', subtitle: 'Covers distractions without tiring your ears' }),
  bilingual({
    id: 'est-gamma',
    title: 'Ondas gamma 40 Hz',
    subtitle: 'Para activar la mente al repasar y memorizar',
    kind: 'estudiar',
    source: require('../assets/audio/estudiar/ondas-gamma.mp3'),
    loop: true,
    free: false,
    tag: 'audífonos',
    icon: 'γ',
  }, { title: 'Gamma waves 40 Hz', subtitle: 'To activate your mind while reviewing and memorizing', tag: 'headphones' }),
  bilingual({
    id: 'est-alfa',
    title: 'Ondas alfa',
    subtitle: 'Estudio tranquilo, sin tensión',
    kind: 'estudiar',
    source: require('../assets/audio/estudiar/ondas-alfa.mp3'),
    loop: true,
    free: false,
    tag: 'audífonos',
    icon: 'α',
  }, { title: 'Alpha waves', subtitle: 'Calm study, without tension', tag: 'headphones' }),
  bilingual({
    id: 'est-lluvia',
    title: 'Lluvia para estudiar',
    subtitle: 'Un fondo suave y parejo',
    kind: 'estudiar',
    source: require('../assets/audio/dormir/lluvia-suave.mp3'),
    loop: true,
    free: false,
    icon: '☂',
  }, { title: 'Rain for studying', subtitle: 'A soft, steady background' }),
];

// Pomodoro: minutos de concentración y su descanso.
export const POMODOROS = [
  { focus: 25, rest: 5 },
  { focus: 35, rest: 7 },
  { focus: 45, rest: 10 },
  { focus: 55, rest: 10 },
];
export const LONG_REST = 15; // después de 4 bloques

export const ALL_TRACKS = [...MEDITACIONES, ...SONIDOS, ...HIPNOSIS, ...TRANCE, ...ESTUDIO];
export const findTrack = (id: string) => ALL_TRACKS.find((t) => t.id === id);

// Se guardan en español; goalLabel() muestra el texto en el idioma activo.
export const GOALS = ['Dormir', 'Ansiedad', 'Concentrarme', 'Recordar lo estudiado', 'Bloqueo en la prueba'];
const GOALS_EN: Record<string, string> = {
  Dormir: 'Sleep',
  Ansiedad: 'Anxiety',
  Concentrarme: 'Focus',
  'Recordar lo estudiado': 'Remember what I studied',
  'Bloqueo en la prueba': 'Mind going blank in exams',
};
export const goalLabel = (g: string) => tr(g, GOALS_EN[g] ?? g);
