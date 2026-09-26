// ============================================
// EMOJIS — Smart Loader
// Loads emojis from config/emojis.js
// ============================================

const config = require('../config/emojis');

const flat = {};

for (const category of Object.keys(config)) {
  for (const key of Object.keys(config[category])) {
    flat[key] = config[category][key];
  }
}

// Common aliases
if (config.general) {
  flat.arrowRight = config.general.arrow || '➡️';
  flat.arrowLeft = config.general.back || '⬅️';
}

module.exports = flat;
