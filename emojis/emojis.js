// ============================================
// EMOJIS — Smart Version
// This file reads from config/emojis.js
// Old commands using `emojis.error` still work!
// ============================================

const config = require('../config/emojis');

// Flatten config into single object for old commands
const flat = {};

for (const category of Object.keys(config)) {
  for (const key of Object.keys(config[category])) {
    flat[key] = config[category][key];
  }
}

// Aliases (for backward compatibility)
flat.arrowRight = config.general.arrow;
flat.arrowLeft = config.general.back;
flat.close = config.general.close;
flat.refresh = config.embed.refresh || '🔄';

// Export flat object (old commands use `emojis.error` etc.)
module.exports = flat;
