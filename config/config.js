module.exports = {
  // ===== BOT INFO =====
  botName: 'Dynamite Music',
  botVersion: '2.0.0',
  botDescription: 'Advanced Discord bot with moderation, utility, fun, and music',

  // ===== PREFIX =====
  prefix: '!',

  // ===== NOP (No Prefix) =====
  nop: {
    enabled: false,
    categories: [], // 'fun', 'utility', 'all'
  },

  // ===== COLORS =====
  colors: {
    primary: 0x9B59B6,
    success: 0x57F287,
    error: 0xED4245,
    warning: 0xFEE75C,
    info: 0x5865F2,
    white: 0xFFFFFF,
  },

  // ===== EMBED =====
  embed: {
    footerText: 'Powered by Dynamite Music',
    showTimestamp: true,
  },

  // ===== FEATURES =====
  features: {
    music: true,
    moderation: true,
    utility: true,
    fun: true,
    logging: true,
  },
};
