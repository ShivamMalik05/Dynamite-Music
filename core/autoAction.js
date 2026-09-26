const warningsCore = require('./warnings');
const warningConfig = require('../config/warnings');
const logger = require('./logger');
const emojis = require('./emojis');

module.exports = {
  async run(member, client) {
    const count = warningsCore.count(member.id);
    const rule = warningsCore.getAction(count);
    if (!rule) return null;

    try {
      const dmMsg = warningsCore.formatDM(rule.action, {
        guild: member.guild.name,
        duration: rule.duration || '',
        reason: 'Auto-action: warning threshold reached',
      });

      // DM bhejo
      if (!warningConfig.silentMode) {
        await member.send({ content: dmMsg }).catch(() => null);
      }

      // Action apply karo
      if (rule.action === 'mute') {
        await member.timeout((rule.duration || 10) * 60 * 1000, 'Auto-action');
      } else if (rule.action === 'kick') {
        await member.kick('Auto-action: warning threshold');
      } else if (rule.action === 'ban') {
        await member.ban({ reason: 'Auto-action: warning threshold' });
      }

      // Log
      await logger.send(client, 'autoaction', {
        title: `${emojis.get('shield', client)} Auto-Action Triggered`,
        description: `**User:** ${member.user.tag}\n**Action:** ${rule.action}\n**Warnings:** ${count}`,
      });

      return rule;
    } catch (err) {
      console.error('[AutoAction]', err.message);
      return null;
    }
  },
};
