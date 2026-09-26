const warningConfig = require('../config/warnings');

// In-memory store (baad mein DB se replace karenge)
const warnings = new Map(); // userId -> [{ reason, moderator, timestamp }]

module.exports = {
  add(userId, reason, moderatorId) {
    const list = warnings.get(userId) || [];
    list.push({ reason, moderatorId, timestamp: Date.now() });
    warnings.set(userId, list);
    return list.length;
  },

  remove(userId, amount = 1) {
    const list = warnings.get(userId) || [];
    const newList = list.slice(0, Math.max(0, list.length - amount));
    warnings.set(userId, newList);
    return newList.length;
  },

  clear(userId) {
    warnings.delete(userId);
  },

  get(userId) {
    return warnings.get(userId) || [];
  },

  count(userId) {
    return this.get(userId).length;
  },

  // Auto-action rule dhoondo
  getAction(warningCount) {
    const rules = warningConfig.rules
      .filter(r => r.enabled && warningCount >= r.warnings)
      .sort((a, b) => b.priority - a.priority);
    return rules[0] || null;
  },

  // DM message banao
  formatDM(type, data = {}) {
    let msg = warningConfig.customDM[type] || '';
    for (const [key, value] of Object.entries(data)) {
      msg = msg.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    return msg;
  },
};
