// Toma app.json y agrega la ruta base para publicar la versión web
// (por ejemplo en GitHub Pages: EXPO_BASE_URL=/neurotrance).
module.exports = ({ config }) => ({
  ...config,
  experiments: { ...(config.experiments || {}), baseUrl: process.env.EXPO_BASE_URL || '' },
});
