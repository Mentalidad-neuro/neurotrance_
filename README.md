# NeuroTrance

App para estudiantes: meditaciones de 3 minutos para evaluaciones, sonidos para dormir con apagado automático, sesiones de hipnosis y un espacio personal con recordatorio de noche. Hecha con Expo (React Native) para iOS y Android desde un solo código.

## Qué incluye esta versión (0.1.0)

- **Bienvenida en 3 pasos**: qué te cuesta, fecha de la evaluación y hora de dormir.
- **Inicio**: cuenta regresiva a la evaluación, accesos rápidos y "Tu semana" con minutos reales escuchados.
- **Estudiar**: pomodoros de 25, 35, 45 o 55 minutos (descansos de 5, 7 o 10 min y uno largo de 15 tras el cuarto bloque), campana suave al cambiar, aviso en segundo plano y 5 sonidos de concentración: ondas beta, ruido marrón (gratis), ondas gamma 40 Hz, ondas alfa y lluvia (suscripción).
- **Lista de estudio** (en Estudiar): escribes los temas, los marcas al terminarlos con sonido, vibración y barra de avance, celebración al completar todo; botones Reiniciar y Lista nueva. Se guarda en el teléfono.
- **Evaluaciones**: 4 meditaciones grabadas (2 gratis, 2 con suscripción).
- **Dormir**: 4 sonidos en bucle (lluvia, ruido rosa, olas, ondas delta binaurales) con temporizador de 15 min, 30 min, 1 hora o toda la noche; el volumen baja de a poco en los últimos 30 segundos. Siguen sonando con la pantalla bloqueada.
- **Hipnosis**: 3 sesiones listadas como "por grabar".
- **Mi espacio**: fecha y hora editables, recordatorio diario 15 min antes de dormir, pantalla oscura al dormir, aviso de audífonos, metas y favoritos.
- **Suscripción**: sin registro de usuario; el contenido gratis se usa sin cuenta y la suscripción se paga con la cuenta de Apple o Google, con 7 días de prueba gratis. Pantalla informativa por ahora. El cobro real (App Store / Google Play, por ejemplo con RevenueCat) queda pendiente hasta tener las cuentas de desarrolladora.

## Dónde está cada cosa

- `src/content.ts`: lista de audios. Para agregar una hipnosis: copia el mp3 a `assets/audio/hipnosis/` y agrega `source: require('../assets/audio/hipnosis/archivo.mp3')`. `free: true` la deja gratis.
- `src/theme.ts`: colores y tipografías.
- `src/screens/`: cada pantalla.
- `assets/audio/dormir/`: sonidos generados para dormir (loops de 2 minutos sin cortes audibles).

## Probar en el celular

```bash
npm install
npx expo start
```

Expo Go sirve para mirar la app, pero las notificaciones y el sonido en segundo plano necesitan una compilación de desarrollo:

```bash
npx eas-cli@latest build --profile development --platform android   # o ios
```

## Publicar (requiere cuentas propias)

1. Cuenta de Expo (gratis) para compilar en la nube con EAS.
2. Apple Developer Program (USD 99 al año) para iOS.
3. Google Play Console (USD 25, pago único) para Android.
4. Configurar suscripciones en ambas tiendas y conectarlas en `src/screens/Paywall.tsx`.

## Comprobaciones

```bash
npx tsc --noEmit
npx expo export --platform web   # compila todo el código
```
