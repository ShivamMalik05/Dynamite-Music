const { sendLog } = require('../utils/logger');

module.exports = {
  name: 'guildBanRemove',
  once: false,
  async execute(ban, client) {
    await sendLog(client, 'moderation', {
      emoji: '🔓',
      title: 'User Unbanned',
      subtitle: 'A user was unbanned',
      fields: [
        { name: 'User', value: `${ban.user.tag} (${ban.user.id})` },
      ],
    });
  },
};
