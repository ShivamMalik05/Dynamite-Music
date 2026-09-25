const { sendLog } = require('../utils/logger');

module.exports = {
  name: 'roleUpdate',
  once: false,
  async execute(oldRole, newRole, client) {
    if (oldRole.name === newRole.name && oldRole.hexColor === newRole.hexColor) return;

    const changes = [];
    if (oldRole.name !== newRole.name) changes.push(`**Name:** ${oldRole.name} → ${newRole.name}`);
    if (oldRole.hexColor !== newRole.hexColor) changes.push(`**Color:** ${oldRole.hexColor} → ${newRole.hexColor}`);

    await sendLog(client, 'roles', {
      emoji: '✏️',
      title: 'Role Updated',
      subtitle: `Role "${newRole.name}" was updated`,
      fields: [
        { name: 'Role', value: `<@&${newRole.id}>` },
        { name: 'Changes', value: changes.join('\n') || 'Unknown' },
      ],
    });
  },
};
