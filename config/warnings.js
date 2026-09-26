module.exports = {
  // ===== RULES =====
  rules: [
    { id: 1, warnings: 3, action: 'mute', duration: 10, enabled: true, priority: 1 },
    { id: 2, warnings: 5, action: 'mute', duration: 60, enabled: true, priority: 2 },
    { id: 3, warnings: 7, action: 'kick', enabled: true, priority: 3 },
    { id: 4, warnings: 10, action: 'ban', enabled: true, priority: 4 },
  ],

  // ===== AUTO-DELETE =====
  autoDelete: {
    enabled: false,
    days: 30,
  },

  // ===== DECAY =====
  decay: {
    enabled: false,
    days: 7,
    factor: 0.5,
  },

  // ===== NOTIFY =====
  notify: {
    enabled: false,
  },

  // ===== SILENT MODE =====
  silentMode: false,

  // ===== CUSTOM DM =====
  customDM: {
    warn: 'You have received a warning in {guild}. Reason: {reason}',
    mute: 'You have been muted for {duration} minutes in {guild}.',
    kick: 'You have been kicked from {guild}.',
    ban: 'You have been banned from {guild}.',
  },
};
