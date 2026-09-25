const emojis = require('../../emojis/emojis');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, SectionBuilder, ThumbnailBuilder } = require('discord.js');

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

    // Server stats
    const serverMembers = guild.memberCount;
    const serverChannels = guild.channels.cache.size;
    const serverRoles = guild.roles.cache.size;
    const serverBoosts = guild.premiumSubscriptionCount || 0;
    const serverOwner = await guild.fetchOwner();

    // Build V2 Container
    const container = new ContainerBuilder()
      .setAccentColor(0x5865F2) // Discord Blurple
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# ${emojis.star} Dynamite Music\n` +
              `**Server Statistics & Bot Info**`
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(guild.iconURL({ dynamic: true, size: 256 }) || client.user.displayAvatarURL({ dynamic: true, size: 256 }))
          )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**${emojis.server} Server Stats**\n` +
              `${emojis.arrowRight} Name: **${guild.name}**\n` +
              `${emojis.arrowRight} Members: **${serverMembers}**\n` +
              `${emojis.arrowRight} Channels: **${serverChannels}**\n` +
              `${emojis.arrowRight} Roles: **${serverRoles}**\n` +
              `${emojis.arrowRight} Boosts: **${serverBoosts}**\n` +
              `${emojis.arrowRight} Owner: **${serverOwner.user.tag}**`
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(guild.iconURL({ dynamic: true, size: 256 }) || client.user.displayAvatarURL({ dynamic: true, size: 256 }))
          )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**${emojis.user} Bot Stats**\n` +
              `${emojis.arrowRight} Servers: **${totalServers}**\n` +
              `${emojis.arrowRight} Users: **${totalUsers}**\n` +
              `${emojis.arrowRight} Channels: **${totalChannels}**\n` +
              `${emojis.arrowRight} Uptime: **${days}d ${hours}h ${minutes}m**`
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
          )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**${emojis.user} Requested By**\n` +
              `${emojis.arrowRight} User: **${author.tag}**\n` +
              `${emojis.arrowRight} ID: **${author.id}**`
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(author.displayAvatarURL({ dynamic: true, size: 256 }))
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
