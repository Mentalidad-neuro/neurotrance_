// Paletas de NeuroTrance. Por defecto: Algodón de día (7:00 a 19:59) y Noche estrellada de noche,
// según la hora en que se abre la app. EXPO_PUBLIC_THEME = 'algodon' | 'estrellada' | 'nido' | 'atardecer' | 'noche' fuerza una.

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
  tileText?: string; // título sobre tarjetas de color
  glass?: boolean; // tarjetas translúcidas sobre cielo con estrellas
  orbA?: string; // colores intermedios de la esfera y el mandala (si no, moon y lilac)
  orbB?: string;
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

// Claro y tranquilo, para cualquier persona: celeste, salvia y arena sobre blanco frío.
const algodon: Palette = {
  sky: '#f6f9fb', sky2: '#ffffff', card: '#ffffff', line: '#e2e9ef', text: '#2f3a48', muted: '#6f7c8b',
  moon: '#3f78a3', teal: '#3f8a5f', lilac: '#3d7486', blue: '#3f6ea0',
  gradTop: '#e6f0f8', success: '#dff1e6', successSoft: '#eef8f1', tealSoft: '#c2e2cd80', lilacSoft: '#e1edf4',
  orbEdge: '#9cc3e0', orbCore: '#fbf7ee', onTile: '#4f5b69', statusBar: 'dark', tileText: '#2f3a48', orbA: '#f3e0c2', orbB: '#bcdcef',
};

// Noche estrellada: azul profundo, brillo dorado y tarjetas de vidrio.
const estrellada: Palette = {
  sky: '#10153a', sky2: '#0c1131', card: '#ffffff12', line: '#ffffff21', text: '#eef0ff', muted: '#a9afd6',
  moon: '#e8c27a', teal: '#7fd1c3', lilac: '#b9a8f5', blue: '#9ec3e6',
  gradTop: '#1f2766', success: '#1d3b4a', successSoft: '#ffffff0d', tealSoft: '#7fd1c333', lilacSoft: '#b9a8f533',
  orbEdge: '#5b3f9e', orbCore: '#ffe7b8', onTile: '#d9d6f5', statusBar: 'light', tileText: '#ffffff', glass: true,
};

const PALETTES = { noche, atardecer, nido, algodon, estrellada };
export type ThemeName = keyof typeof PALETTES;
const forced = process.env.EXPO_PUBLIC_THEME as ThemeName | undefined;
const hour = new Date().getHours();
export const themeName: ThemeName = forced && forced in PALETTES ? forced : hour >= 7 && hour < 20 ? 'algodon' : 'estrellada';
export const colors = PALETTES[themeName];

const DISPLAY = { algodon: 'Quicksand_700Bold', estrellada: 'Fraunces_600SemiBold' } as Record<string, string>;
export const fonts = {
  display: DISPLAY[themeName] ?? 'Sora_600SemiBold',
  displayRegular: themeName === 'estrellada' ? 'Fraunces_400Regular' : themeName === 'algodon' ? 'Quicksand_500Medium' : 'Sora_400Regular',
  body: 'NunitoSans_400Regular',
  bodySemi: 'NunitoSans_600SemiBold',
  bodyBold: 'NunitoSans_700Bold',
};

const GRADIENTS = {
  algodon: {
    estudiar: ['#f6e6cf', '#efd8b5'],
    dormir: ['#d9e8f6', '#c5daf0'],
    calma: ['#d8ede0', '#c3e2cf'],
    hipnosis: ['#e0e5f2', '#cfd6ec'],
    noche: ['#f3edd6', '#eadfba'],
    hero: ['#d9e8f6', '#d8ede0'],
  },
  estrellada: {
    estudiar: ['#ffffff17', '#ffffff0a'],
    dormir: ['#ffffff17', '#ffffff0a'],
    calma: ['#ffffff17', '#ffffff0a'],
    hipnosis: ['#ffffff17', '#ffffff0a'],
    noche: ['#ffffff17', '#ffffff0a'],
    hero: ['#2c3a8c', '#5b3f9e'],
  },
  noche: {
    estudiar: ['#3f6f86', '#24394f'],
    dormir: ['#3a5a86', '#223252'],
    calma: ['#4b7564', '#273f3a'],
    hipnosis: ['#6a5a9c', '#332a55'],
    noche: ['#8a6d55', '#3b3030'],
    hero: ['#3f6f86', '#24394f'],
  },
  atardecer: {
    estudiar: ['#c0805e', '#6e4048'],
    dormir: ['#5d5182', '#352a4a'],
    calma: ['#6f8a62', '#3c4a3a'],
    hipnosis: ['#9a6a9a', '#4a2f4e'],
    noche: ['#b8846a', '#5a3a3c'],
    hero: ['#c0805e', '#6e4048'],
  },
  nido: {
    estudiar: ['#d9906c', '#b9644f'],
    dormir: ['#8a7fb8', '#6a5d97'],
    calma: ['#8fae88', '#6a8f68'],
    hipnosis: ['#b88ab8', '#8d6492'],
    noche: ['#d2a27c', '#a9775c'],
    hero: ['#d9906c', '#b9644f'],
  },
} as const;
export const tileGradients = GRADIENTS[themeName];
// Color de los íconos dentro de las tarjetas de inicio.
export const tileIcon = (k: 'estudiar' | 'dormir' | 'calma' | 'hipnosis' | 'noche') =>
  themeName === 'estrellada' ? colors.moon : themeName === 'algodon' ? { estudiar: '#a3682c', dormir: '#3f6ea0', calma: '#3f8a5f', hipnosis: '#56609e', noche: '#8f7426' }[k] : '#fffaf5';
