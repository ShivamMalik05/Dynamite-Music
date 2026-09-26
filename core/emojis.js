const emojiConfig = require('../config/emojis');

module.exports = {
  get(key, client = null) {
    // App emoji try karo
    if (client && client.application && client.application.emojis) {
      const appName = emojiConfig.app[key];
      if (appName) {
        const emoji = client.application.emojis.cache.find(e => e.name === appName);
        if (emoji) return emoji.toString();
      }
    }
    // Fallback
    return emojiConfig.fallback[key] || '';
  },

  // Multiple ek saath
  getAll(client = null) {
    const result = {};
    for (const key of Object.keys(emojiConfig.app)) {
      result[key] = this.get(key, client);
    }
    return result;
  },
};
