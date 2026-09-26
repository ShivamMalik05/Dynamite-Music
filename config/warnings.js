// ============================================
// WARNINGS CONFIG
// Auto-action, expiry, and notification settings
// ============================================

module.exports = {
  // ===== AUTO ACTION =====
  autoAction: {
    enabled: false,
    muteAt: 3,
    muteDuration: 60, // minutes
    kickAt: 5,
    banAt: 7,
  },

  // ===== EXPIRY =====
  expiry: {
    enabled: false,
    defaultDays: 30,
  },

  // ===== NOTIFICATIONS =====
  notifyOnWarn: true,
  notifyOnRemove: true,

  // ===== ID PREFIX =====
  idPrefix: 'W',
};
