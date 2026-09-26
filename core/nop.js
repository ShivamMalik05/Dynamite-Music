const nopConfig = require('../config/nop');
const config = require('./config');
const logger = require('./logger');

module.exports = {
  // Check if NOP is allowed for this message
  isNopAllowed(message) {
    if (!nopConfig.enabled) return false;

    const guildId = message.guild?.id;
    const channelId = message.channel?.id;
    const userId = message.author?.id;
    const roleIds = message.member?.roles?.cache?.map(r => r.id) || [];

    // Check server
    if (nopConfig.servers.length && !nopConfig.servers.includes(guildId)) return false;

    // Check user
    const allowedUsers = nopConfig.users[guildId] || [];
    if (allowedUsers.length && !allowedUsers.includes(userId)) return false;

    // Check role
    const allowedRoles = nopConfig.roles[guildId] || [];
    if (allowedRoles.length && !roleIds.some(r => allowedRoles.includes(r))) return false;

    // Check channel
    const allowedChannels = nopConfig.channels[guildId] || [];
    if (allowedChannels.length && !allowedChannels.includes(channelId)) return false;

    return true;
  },

  isCategoryAllowed(category) {
    if (!nopConfig.categories.length) return true;
    if (nopConfig.categories.includes('all')) return true;
    return nopConfig.categories.includes(category);
  },

  isCommandAllowed(guildId, commandName) {
    const cmds = nopConfig.commands[guildId] || [];
    if (!cmds.length) return true;
    return cmds.includes(commandName);
  },

  async log(client, message, commandName) {
    if (!nopConfig.logs.enabled || !nopConfig.logs.channel) return;
    await logger.send(client, 'nop', {
      title: 'NOP Command Used',
      description: `**User:** <@${message.author.id}>\n**Command:** \`${commandName}\`\n**Channel:** <#${message.channel.id}>`,
    });
  },
};
