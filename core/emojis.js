const emojiConfig = require('../config/emojis');

module.exports = {
  get(key, client = null) {
    // Try application emoji first
    if (client && client.application && client.application.emojis) {
      const appName = emojiConfig.app[key];
      if (appName) {
        const emoji = client.application.emojis.cache.find(e => e.name === appName);
        if (emoji) return emoji.toString();
      }
    }
    // Fallback to unicode
    return emojiConfig.fallback[key] || '';
  },

  // Get all emojis at once
  getAll(client = null) {
    const result = {};
    for (const key of Object.keys(emojiConfig.app)) {
      result[key] = this.get(key, client);
    }
    return result;
  },
};
