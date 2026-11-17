// Paletas de NeuroTrance. Se elige con EXPO_PUBLIC_THEME al compilar: 'noche' | 'atardecer' | 'nido'.

type Palette = {
  sky: string; // fondo
  sky2: string; // barra inferior y fondos secundarios
  card: string;
  line: string;
  text: string;
  muted: string;
  moon: string; // acento principal (botones)
  teal: string; // logros, progreso
  lilac: string;
  blue: string;
  gradTop: string; // parte alta de los fondos con degradado
  success: string; // tarjeta de "terminado" / descanso
  successSoft: string; // fila marcada
  tealSoft: string;
  lilacSoft: string;
  orbEdge: string;
  orbCore: string;
  onTile: string; // texto secundario sobre tarjetas de color
  statusBar: 'light' | 'dark';
};

const noche: Palette = {
  sky: '#172038', sky2: '#1d2845', card: '#243155', line: '#33416b', text: '#eef0f8', muted: '#a8b1d2',
  moon: '#f2d4b6', teal: '#a6cdb7', lilac: '#c4b5ee', blue: '#9ec3e6',
  gradTop: '#2c3766', success: '#2f4a44', successSoft: '#22383a', tealSoft: '#7fd1c333', lilacSoft: '#c4b5ee33',
  orbEdge: '#5f6fa8', orbCore: '#fbeee0', onTile: '#ffffffb3', statusBar: 'light',
};

// Oscuro cálido: ciruela y durazno, como una pieza con lámpara encendida.
const atardecer: Palette = {
  sky: '#2a2230', sky2: '#31283a', card: '#3c3146', line: '#544658', text: '#f8efe6', muted: '#cbb8b2',
  moon: '#f4c39b', teal: '#bcd3a7', lilac: '#dcbfe6', blue: '#eab39a',
  gradTop: '#4a3446', success: '#3f4a36', successSoft: '#363d33', tealSoft: '#bcd3a733', lilacSoft: '#dcbfe633',
  orbEdge: '#a0607a', orbCore: '#fff3e6', onTile: '#ffffffc0', statusBar: 'light',
};

// Claro crema: papel tibio, terracota suave y salvia. Para el día y el estudio.
const nido: Palette = {
  sky: '#f7f0e6', sky2: '#efe4d6', card: '#fffaf3', line: '#e7d8c5', text: '#3e3340', muted: '#8b7b78',
  moon: '#c9785a', teal: '#6f9470', lilac: '#8f74b0', blue: '#c3866a',
  gradTop: '#f3dccb', success: '#e3eedc', successSoft: '#edf3e8', tealSoft: '#6f947026', lilacSoft: '#8f74b026',
  orbEdge: '#b98fc6', orbCore: '#fff8ef', onTile: '#ffffffd9', statusBar: 'dark',
};

const PALETTES = { noche, atardecer, nido };
export type ThemeName = keyof typeof PALETTES;
export const themeName: ThemeName = ((process.env.EXPO_PUBLIC_THEME as ThemeName) in PALETTES ? process.env.EXPO_PUBLIC_THEME : 'atardecer') as ThemeName;
export const colors = PALETTES[themeName];

export const fonts = {
  display: 'Sora_600SemiBold',
  displayRegular: 'Sora_400Regular',
  body: 'NunitoSans_400Regular',
  bodySemi: 'NunitoSans_600SemiBold',
  bodyBold: 'NunitoSans_700Bold',
};

const GRADIENTS = {
  noche: {
    estudiar: ['#3f6f86', '#24394f'],
    dormir: ['#3a5a86', '#223252'],
    calma: ['#4b7564', '#273f3a'],
    hipnosis: ['#6a5a9c', '#332a55'],
    noche: ['#8a6d55', '#3b3030'],
  },
  atardecer: {
    estudiar: ['#c0805e', '#6e4048'],
    dormir: ['#5d5182', '#352a4a'],
    calma: ['#6f8a62', '#3c4a3a'],
    hipnosis: ['#9a6a9a', '#4a2f4e'],
    noche: ['#b8846a', '#5a3a3c'],
  },
  nido: {
    estudiar: ['#d9906c', '#b9644f'],
    dormir: ['#8a7fb8', '#6a5d97'],
    calma: ['#8fae88', '#6a8f68'],
    hipnosis: ['#b88ab8', '#8d6492'],
    noche: ['#d2a27c', '#a9775c'],
  },
} as const;
export const tileGradients = GRADIENTS[themeName];
