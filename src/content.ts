// Todo el contenido de audio de la app en un solo lugar.
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
  {
    id: 'med-1',
    title: 'La noche anterior',
    subtitle: 'Para dormir tranquila antes de la evaluación',
    kind: 'meditacion',
    source: require('../assets/audio/meditaciones/1-noche-anterior.mp3'),
    duration: '3:50',
    free: true,
    icon: '1',
  },
  {
    id: 'med-2',
    title: 'Antes de entrar',
    subtitle: 'En la fila o sentada esperando',
    kind: 'meditacion',
    source: require('../assets/audio/meditaciones/2-antes-de-entrar.mp3'),
    duration: '2:58',
    free: true,
    icon: '2',
  },
  {
    id: 'med-3',
    title: 'Si me bloqueo',
    subtitle: 'Cuando una pregunta te paraliza',
    kind: 'meditacion',
    source: require('../assets/audio/meditaciones/3-bloqueo-en-la-prueba.mp3'),
    duration: '2:35',
    free: false,
    icon: '3',
  },
  {
    id: 'med-4',
    title: 'Entre pruebas',
    subtitle: 'Para soltar la anterior y empezar de nuevo',
    kind: 'meditacion',
    source: require('../assets/audio/meditaciones/4-entre-pruebas.mp3'),
    duration: '2:48',
    free: false,
    icon: '4',
  },
];

export const SONIDOS: Track[] = [
  {
    id: 'snd-lluvia',
    title: 'Lluvia suave',
    subtitle: 'Tapa los ruidos de la casa',
    kind: 'dormir',
    source: require('../assets/audio/dormir/lluvia-suave.mp3'),
    loop: true,
    free: true,
    icon: '≋',
  },
  {
    id: 'snd-rosa',
    title: 'Ruido rosa',
    subtitle: 'Acompaña el sueño profundo, donde se guarda lo estudiado',
    kind: 'dormir',
    source: require('../assets/audio/dormir/ruido-rosa.mp3'),
    loop: true,
    free: true,
    tag: 'memoria',
    icon: '∿',
  },
  {
    id: 'snd-olas',
    title: 'Olas del mar',
    subtitle: 'Ritmo lento para bajar la respiración',
    kind: 'dormir',
    source: require('../assets/audio/dormir/olas-del-mar.mp3'),
    loop: true,
    free: false,
    icon: '◠',
  },
  {
    id: 'snd-delta',
    title: 'Ondas delta',
    subtitle: 'Tono binaural de 2 Hz. Usa audífonos',
    kind: 'dormir',
    source: require('../assets/audio/dormir/ondas-delta.mp3'),
    loop: true,
    free: false,
    tag: 'audífonos',
    icon: '◎',
  },
];

export const HIPNOSIS: Track[] = [
  {
    id: 'hip-sueno',
    title: 'Dormir profundo',
    subtitle: 'Para quedarte dormida sin darle vueltas',
    kind: 'hipnosis',
    duration: '20 min',
    free: false,
    icon: '☾',
  },
  {
    id: 'hip-ansiedad',
    title: 'Soltar la ansiedad',
    subtitle: 'Calma ante la prueba',
    kind: 'hipnosis',
    duration: '15 min',
    free: false,
    icon: '○',
  },
  {
    id: 'hip-memoria',
    title: 'Mi mente recuerda',
    subtitle: 'Confianza en tu memoria',
    kind: 'hipnosis',
    duration: '18 min',
    free: false,
    icon: '✦',
  },
];

// Visuales para entrar en trance, con fondo de ondas theta (estado previo al sueño).
export const TRANCE: (Track & { visual: 'mandala' | 'luz' | 'agua' | 'estrellas' })[] = [
  { id: 'tr-mandala', title: 'Mandala que respira', subtitle: 'Sigue su ritmo: crece al inhalar, se recoge al exhalar', kind: 'hipnosis', source: require('../assets/audio/hipnosis/ondas-theta.mp3'), loop: true, free: true, icon: '✿', visual: 'mandala' },
  { id: 'tr-luz', title: 'Punto de luz', subtitle: 'Fija la mirada y deja que los párpados pesen', kind: 'hipnosis', source: require('../assets/audio/hipnosis/ondas-theta.mp3'), loop: true, free: true, icon: '◉', visual: 'luz' },
  { id: 'tr-agua', title: 'Ondas en el agua', subtitle: 'Cada onda se lleva un pensamiento', kind: 'hipnosis', source: require('../assets/audio/hipnosis/ondas-theta.mp3'), loop: true, free: false, icon: '◌', visual: 'agua' },
  { id: 'tr-estrellas', title: 'Cielo que se apaga', subtitle: 'Las estrellas se encienden y apagan muy lento', kind: 'hipnosis', source: require('../assets/audio/hipnosis/ondas-theta.mp3'), loop: true, free: false, icon: '✧', visual: 'estrellas' },
];

export const ESTUDIO: Track[] = [
  {
    id: 'est-beta',
    title: 'Ondas beta',
    subtitle: 'Atención sostenida para leer y resolver ejercicios',
    kind: 'estudiar',
    source: require('../assets/audio/estudiar/ondas-beta.mp3'),
    loop: true,
    free: true,
    tag: 'audífonos',
    icon: 'β',
  },
  {
    id: 'est-marron',
    title: 'Ruido marrón',
    subtitle: 'Tapa las distracciones sin cansar el oído',
    kind: 'estudiar',
    source: require('../assets/audio/estudiar/ruido-marron.mp3'),
    loop: true,
    free: true,
    icon: '≋',
  },
  {
    id: 'est-gamma',
    title: 'Ondas gamma 40 Hz',
    subtitle: 'Para activar la mente al repasar y memorizar',
    kind: 'estudiar',
    source: require('../assets/audio/estudiar/ondas-gamma.mp3'),
    loop: true,
    free: false,
    tag: 'audífonos',
    icon: 'γ',
  },
  {
    id: 'est-alfa',
    title: 'Ondas alfa',
    subtitle: 'Estudio tranquilo, sin tensión',
    kind: 'estudiar',
    source: require('../assets/audio/estudiar/ondas-alfa.mp3'),
    loop: true,
    free: false,
    tag: 'audífonos',
    icon: 'α',
  },
  {
    id: 'est-lluvia',
    title: 'Lluvia para estudiar',
    subtitle: 'Un fondo suave y parejo',
    kind: 'estudiar',
    source: require('../assets/audio/dormir/lluvia-suave.mp3'),
    loop: true,
    free: false,
    icon: '☂',
  },
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

export const GOALS = ['Dormir', 'Ansiedad', 'Concentrarme', 'Recordar lo estudiado', 'Bloqueo en la prueba'];
