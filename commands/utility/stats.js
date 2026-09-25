const emojis = require('../../emojis/emojis');
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  name: 'stats',
  description: 'Show bot and server statistics',
  async execute(message) {
    const client = message.client;
    const guild = message.guild;
    const author = message.author;

    // Bot stats
    const totalServers = client.guilds.cache.size;
    const totalUsers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
    const totalChannels = client.channels.cache.size;
    const uptime = client.uptime;
    const days = Math.floor(uptime / 86400000);
    const hours = Math.floor(uptime / 3600000) % 24;
    const minutes = Math.floor(uptime / 60000) % 60;
    const seconds = Math.floor(uptime / 1000) % 60;
    const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const ping = client.ws.ping;

    // Server stats
    const serverMembers = guild.memberCount;
    const serverChannels = guild.channels.cache.size;
    const serverRoles = guild.roles.cache.size;
    const serverBoosts = guild.premiumSubscriptionCount || 0;

    const container = new ContainerBuilder()
      .setAccentColor(0x9B59B6)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${emojis.star} ${client.user.username} Statistics\n` +
          `**Bot & Server Information**`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.info} General Info**\n` +
          `${emojis.arrowRight} **Bot:** ${client.user.username}\n` +
          `${emojis.arrowRight} **Status:** Online\n` +
          `${emojis.arrowRight} **Ping:** ${ping}ms\n` +
          `${emojis.arrowRight} **Memory:** ${memory} MB\n` +
          `${emojis.arrowRight} **Uptime:** ${days}d ${hours}h ${minutes}m ${seconds}s`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.server} Server Stats**\n` +
          `${emojis.arrowRight} **Name:** ${guild.name}\n` +
          `${emojis.arrowRight} **Members:** ${serverMembers}\n` +
          `${emojis.arrowRight} **Channels:** ${serverChannels}\n` +
          `${emojis.arrowRight} **Roles:** ${serverRoles}\n` +
          `${emojis.arrowRight} **Boosts:** ${serverBoosts}`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.user} Requested By**\n` +
          `${emojis.arrowRight} **User:** ${author.tag}\n` +
          `${emojis.arrowRight} **ID:** ${author.id}`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Powered by **${client.user.username}** | Made with ❤️`
        )
      )
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('stats_close')
            .setLabel('Close')
            .setStyle(ButtonStyle.Danger)
            .setEmoji(emojis.close)
        )
      );

    await message.reply({
      components: [container],
      flags: 1 << 15,
    });
  },
};
