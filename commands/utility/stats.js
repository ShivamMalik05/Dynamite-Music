const emojis = require('../../emojis/emojis');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } = require('discord.js');

module.exports = {
  name: 'stats',
  description: 'Show bot and server statistics',
  async execute(message) {
    const client = message.client;
    const guild = message.guild;

    // Bot stats
    const totalServers = client.guilds.cache.size;
    const totalUsers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
    const totalChannels = client.channels.cache.size;
    const uptime = client.uptime;
    const days = Math.floor(uptime / 86400000);
    const hours = Math.floor(uptime / 3600000) % 24;
    const minutes = Math.floor(uptime / 60000) % 60;

    // Server stats
    const serverMembers = guild.memberCount;
    const serverChannels = guild.channels.cache.size;
    const serverRoles = guild.roles.cache.size;
    const serverBoosts = guild.premiumSubscriptionCount || 0;

    // Build V2 Container
    const container = new ContainerBuilder()
      .setAccentColor(0x0099ff)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emojis.star} Dynamite Music - Statistics`)
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.server} Server Stats**\n` +
          `${emojis.arrowRight} Members: **${serverMembers}**\n` +
          `${emojis.arrowRight} Channels: **${serverChannels}**\n` +
          `${emojis.arrowRight} Roles: **${serverRoles}**\n` +
          `${emojis.arrowRight} Boosts: **${serverBoosts}**`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.user} Bot Stats**\n` +
          `${emojis.arrowRight} Servers: **${totalServers}**\n` +
          `${emojis.arrowRight} Users: **${totalUsers}**\n` +
          `${emojis.arrowRight} Channels: **${totalChannels}**\n` +
          `${emojis.arrowRight} Uptime: **${days}d ${hours}h ${minutes}m**`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('stats_refresh')
            .setLabel('Refresh')
            .setStyle(ButtonStyle.Primary)
            .setEmoji(emojis.loading),
          new ButtonBuilder()
            .setCustomId('stats_close')
            .setLabel('Close')
            .setStyle(ButtonStyle.Danger)
            .setEmoji(emojis.cross)
        )
      );

    // Send message
    const sent = await message.reply({
      components: [container],
      flags: 1 << 15, // IS_COMPONENTS_V2 flag
    });

    // Button collector
    const collector = sent.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: `${emojis.error} This is not for you!`, ephemeral: true });
      }

      if (interaction.customId === 'stats_close') {
        await interaction.update({ components: [] });
        collector.stop();
      }

      if (interaction.customId === 'stats_refresh') {
        await interaction.reply({ content: `${emojis.loading} Refreshing...`, ephemeral: true });
        setTimeout(() => interaction.deleteReply().catch(() => {}), 2000);
      }
    });
  },
};
