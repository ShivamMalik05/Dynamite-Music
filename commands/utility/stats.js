const emojis = require('../../emojis/emojis');
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
} = require('discord.js');

function generateChartUrl(labels, data) {
  const chartConfig = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Server Stats',
          data: data,
          borderColor: '#9B59B6',
          backgroundColor: 'rgba(155, 89, 182, 0.3)',
          borderWidth: 3,
          pointBackgroundColor: '#9B59B6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#ffffff',
            font: { size: 14 },
          },
        },
        title: {
          display: true,
          text: 'Server Overview',
          color: '#ffffff',
          font: { size: 20, weight: 'bold' },
          padding: { top: 10, bottom: 20 },
        },
        tooltip: {
          backgroundColor: '#2c2f33',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#9B59B6',
          borderWidth: 1,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#ffffff',
            font: { size: 12 },
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
        },
        x: {
          ticks: {
            color: '#ffffff',
            font: { size: 12 },
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
        },
      },
    },
  };

  // Gradient background using QuickChart's built-in gradient support
  const gradientConfig = {
    ...chartConfig,
    options: {
      ...chartConfig.options,
      plugins: {
        ...chartConfig.options.plugins,
        // Custom background gradient effect
      },
    },
  };

  const encodedConfig = encodeURIComponent(JSON.stringify(gradientConfig));
  return `https://quickchart.io/chart?c=${encodedConfig}&backgroundColor=%231a1a2e&width=600&height=300&devicePixelRatio=2`;
}

module.exports = {
  name: 'stats',
  description: 'Show bot and server statistics',
  async execute(message) {
    const client = message.client;
    const guild = message.guild;
    const author = message.author;

    const totalServers = client.guilds.cache.size;
    const totalUsers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
    const uptime = client.uptime;
    const days = Math.floor(uptime / 86400000);
    const hours = Math.floor(uptime / 3600000) % 24;
    const minutes = Math.floor(uptime / 60000) % 60;
    const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const ping = client.ws.ping;

    const serverMembers = guild.memberCount;
    const serverChannels = guild.channels.cache.size;
    const serverRoles = guild.roles.cache.size;
    const serverBoosts = guild.premiumSubscriptionCount || 0;

    const chartUrl = generateChartUrl(
      ['Members', 'Channels', 'Roles', 'Boosts'],
      [serverMembers, serverChannels, serverRoles, serverBoosts]
    );

    const container = new ContainerBuilder()
      .setAccentColor(0x9B59B6)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${emojis.star} ${client.user.username} Statistics`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.info} General Info**\n` +
          `${emojis.arrowRight} **Bot:** ${client.user.username}\n` +
          `${emojis.arrowRight} **Ping:** ${ping}ms\n` +
          `${emojis.arrowRight} **Memory:** ${memory} MB\n` +
          `${emojis.arrowRight} **Uptime:** ${days}d ${hours}h ${minutes}m`
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
          `**${emojis.chart} Server Chart**`
        )
      )
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL(chartUrl)
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.user} Requested By**\n` +
          `${emojis.arrowRight} **User:** ${author.tag}`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Powered by **${client.user.username}**`
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
