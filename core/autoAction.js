const { loadWarnings } = require('./config');

// ===== CHECK TRIGGERED RULE =====
function getTriggeredRule(totalWarnings) {
  const config = loadWarnings();
  const rules = (config.rules || [])
    .filter(r => r.enabled)
    .sort((a, b) => a.warnings - b.warnings);

  console.log(`[autoAction] Total warnings: ${totalWarnings}`);
  console.log(`[autoAction] Enabled rules: ${rules.length}`);

  if (rules.length === 0) return null;

  let triggered = null;
  for (const rule of rules) {
    if (totalWarnings >= rule.warnings) triggered = rule;
  }

  console.log(`[autoAction] Triggered rule:`, JSON.stringify(triggered));
  return triggered;
}

// ===== APPLY ACTION =====
async function applyAction(member, rule, totalWarnings) {
  const action = rule.action;
  const duration = rule.duration;

  console.log(`[autoAction] Applying: action=${action}, duration=${duration}`);
  console.log(`[autoAction] Member moderatable: ${member.moderatable}`);
  console.log(`[autoAction] Member bannable: ${member.bannable}`);
  console.log(`[autoAction] Member kickable: ${member.kickable}`);

  try {
    if (action === 'ban') {
      if (!member.bannable) {
        console.log(`[autoAction] ❌ Cannot ban — not bannable`);
        return { success: false, error: 'Cannot ban — role hierarchy' };
      }
      await member.ban({ reason: `Auto-ban: ${totalWarnings} warnings` });
      console.log(`[autoAction] ✅ Banned`);
      return { success: true, action: 'ban' };
    } else if (action === 'kick') {
      if (!member.kickable) {
        console.log(`[autoAction] ❌ Cannot kick — not kickable`);
        return { success: false, error: 'Cannot kick — role hierarchy' };
      }
      await member.kick(`Auto-kick: ${totalWarnings} warnings`);
      console.log(`[autoAction] ✅ Kicked`);
      return { success: true, action: 'kick' };
    } else if (action === 'mute') {
      if (!member.moderatable) {
        console.log(`[autoAction] ❌ Cannot mute — not moderatable`);
        return { success: false, error: 'Cannot mute — role hierarchy' };
      }
      const ms = (duration || 60) * 60 * 1000;
      await member.timeout(ms, `Auto-mute: ${totalWarnings} warnings`);
      console.log(`[autoAction] ✅ Muted for ${duration} minutes`);
      return { success: true, action: 'mute', duration };
    }
  } catch (err) {
    console.log(`[autoAction] ❌ Error: ${err.message}`);
    return { success: false, error: err.message };
  }

  return { success: false, error: 'Unknown action' };
}

module.exports = {
  getTriggeredRule,
  applyAction,
};
