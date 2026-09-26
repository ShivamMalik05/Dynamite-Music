const { EmbedBuilder } = require('discord.js');
const logConfig = require('../config/logs');
const config = require('./config');

module.exports = {
  async send(client, type, embedData) {
    try {
      if (!logConfig.enabled[type]) return;
      const channelId = logConfig.channels[type];
      if (!channelId) return;

      const channel = await client.channels.fetch(channelId).catch(() => null);
      if (!channel || !channel.isTextBased()) return;

      const embed = new EmbedBuilder()
        .setColor(logConfig.colors[type] || config.colors.primary)
        .setTimestamp();

      if (embedData.title) embed.setTitle(embedData.title);
      if (embedData.description) embed.setDescription(embedData.description);
      if (embedData.fields) embed.addFields(embedData.fields);
      if (embedData.footer) embed.setFooter({ text: embedData.footer });
      if (embedData.thumbnail) embed.setThumbnail(embedData.thumbnail);

      await channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(`[Logger] ${type} log failed:`, err.message);
    }
  },

  // Ignore check
  isIgnored(channelId, roleIds = [], userId) {
    if (logConfig.ignoredChannels.includes(channelId)) return true;
    if (logConfig.ignoredUsers.includes(userId)) return true;
    if (roleIds.some(r => logConfig.ignoredRoles.includes(r))) return true;
    return false;
  },
};
