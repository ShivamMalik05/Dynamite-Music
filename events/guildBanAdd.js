const { sendLog } = require('../utils/logger');

module.exports = {
  name: 'guildBanAdd',
  once: false,
  async execute(ban, client) {
    await sendLog(client, 'moderation', {
      emoji: '🔨',
      title: 'User Banned',
      subtitle: 'A user was banned',
      fields: [
        { name: 'User', value: `${ban.user.tag} (${ban.user.id})` },
        { name: 'Reason', value: ban.reason || 'No reason provided' },
      ],
    });
  },
};
