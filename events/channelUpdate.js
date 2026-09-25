const { sendLog } = require('../utils/logger');

module.exports = {
  name: 'channelUpdate',
  once: false,
  async execute(oldChannel, newChannel, client) {
    if (!oldChannel.guild) return;
    if (oldChannel.name === newChannel.name && oldChannel.topic === newChannel.topic) return;

    const changes = [];
    if (oldChannel.name !== newChannel.name) {
      changes.push(`**Name:** ${oldChannel.name} → ${newChannel.name}`);
    }
    if (oldChannel.topic !== newChannel.topic) {
      changes.push(`**Topic:** changed`);
    }

    await sendLog(client, 'channels', {
      emoji: '✏️',
      title: 'Channel Updated',
      subtitle: `#${newChannel.name} was updated`,
      fields: [
        { name: 'Channel', value: `<#${newChannel.id}>` },
        { name: 'Changes', value: changes.join('\n') || 'Unknown' },
      ],
    });
  },
};
