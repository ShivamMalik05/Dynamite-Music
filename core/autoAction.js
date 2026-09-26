const { loadWarnings } = require('./config');

// ===== CHECK TRIGGERED RULE =====
function getTriggeredRule(totalWarnings) {
  const config = loadWarnings();
  const rules = (config.rules || [])
    .filter(r => r.enabled)
    .sort((a, b) => a.warnings - b.warnings);

  if (rules.length === 0) return null;

  let triggered = null;
  for (const rule of rules) {
    if (totalWarnings >= rule.warnings) triggered = rule;
  }
  return triggered;
}

// ===== APPLY ACTION =====
async function applyAction(member, rule, totalWarnings) {
  const action = rule.action;
  const duration = rule.duration;

  try {
    if (action === 'ban') {
      await member.ban({ reason: `Auto-ban: ${totalWarnings} warnings` });
      return { success: true, action: 'ban' };
    } else if (action === 'kick') {
      await member.kick(`Auto-kick: ${totalWarnings} warnings`);
      return { success: true, action: 'kick' };
    } else if (action === 'mute') {
      const ms = (duration || 60) * 60 * 1000;
      await member.timeout(ms, `Auto-mute: ${totalWarnings} warnings`);
      return { success: true, action: 'mute', duration };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }

  return { success: false, error: 'Unknown action' };
}

module.exports = {
  getTriggeredRule,
  applyAction,
};
