const emojis = require('../../emojis/emojis');
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SectionBuilder,
  ThumbnailBuilder,
} = require('discord.js');

function generateChartUrl(labels, data, colors) {
  const chartConfig = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Stats',
          data: data,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Server Overview',
          color: '#ffffff',
          font: { size: 16 },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#ffffff' },
          grid: { color: 'rgba(255,255,255,0.1)' },
        },
        x: {
          ticks: { color: '#ffffff' },
          grid: { color: 'rgba(255,255,255,0.1)' },
        },
      },
    },
  };

  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&backgroundColor=%232c2f33`;
}

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

    // Generate chart URL
    const chartUrl = generateChartUrl(
      ['Members', 'Channels', 'Roles', 'Boosts'],
      [serverMembers, serverChannels, serverRoles, serverBoosts],
      ['#9B59B6', '#5865F2', '#57F287', '#FEE75C']
    );

    const container = new ContainerBuilder()
      .setAccentColor(0x9B59B6)
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# ${emojis.star} ${client.user.username} Statistics\n` +
              `**Bot & Server Information**`
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
              `**${emojis.info} General Info**\n` +
              `${emojis.arrowRight} **Bot:** ${client.user.username}\n` +
              `${emojis.arrowRight} **Status:** Online\n` +
              `${emojis.arrowRight} **Ping:** ${ping}ms\n` +
              `${emojis.arrowRight} **Memory:** ${memory} MB\n` +
              `${emojis.arrowRight} **Uptime:** ${days}d ${hours}h ${minutes}m ${seconds}s`
            )
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
              `${emojis.arrowRight} **Name:** ${guild.name}\n` +
              `${emojis.arrowRight} **Members:** ${serverMembers}\n` +
              `${emojis.arrowRight} **Channels:** ${serverChannels}\n` +
              `${emojis.arrowRight} **Roles:** ${serverRoles}\n` +
              `${emojis.arrowRight} **Boosts:** ${serverBoosts}`
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(guild.iconURL({ dynamic: true, size: 256 }) || client.user.displayAvatarURL({ dynamic: true, size: 256 }))
          )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.chart} Server Chart**`
        )
      )
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `${emojis.arrowRight} Members: **${serverMembers}**\n` +
              `${emojis.arrowRight} Channels: **${serverChannels}**\n` +
              `${emojis.arrowRight} Roles: **${serverRoles}**\n` +
              `${emojis.arrowRight} Boosts: **${serverBoosts}**`
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(chartUrl)
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
              `${emojis.arrowRight} **User:** ${author.tag}\n` +
              `${emojis.arrowRight} **ID:** ${author.id}`
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(author.displayAvatarURL({ dynamic: true, size: 256 }))
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
