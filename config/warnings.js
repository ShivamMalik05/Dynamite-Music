module.exports = {
  // ===== RULES =====
  rules: [
    { id: 1, warnings: 1, action: 'mute', duration: 5, enabled: true, priority: 1 },
    { id: 2, warnings: 3, action: 'mute', duration: 30, enabled: true, priority: 2 },
    { id: 3, warnings: 5, action: 'mute', duration: 60, enabled: true, priority: 3 },
    { id: 4, warnings: 7, action: 'kick', enabled: true, priority: 4 },
    { id: 5, warnings: 10, action: 'ban', enabled: true, priority: 5 },
  ],

  // ===== AUTO-DELETE =====
  autoDelete: {
    enabled: true,
    days: 60,
  },

  // ===== DECAY =====
  decay: {
    enabled: true,
    days: 7,
    factor: 0.5,
  },

  // ===== NOTIFY =====
  notify: {
    enabled: true,
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
