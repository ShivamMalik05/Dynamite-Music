const {
  SlashCommandBuilder,
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

const emojis = require('../../emojis/emojis');

function generateChartUrl(labels, data) {
  const chartConfig = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Server Stats',
        data: data,
        borderColor: '#9B59B6',
        backgroundColor: 'rgba(155, 89, 182, 0.3)',
        borderWidth: 3,
        pointBackgroundColor: '#9B59B6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        tension: 0.4,
        fill: true,
      }],
    },
    options: {
      plugins: {
        legend: { labels: { color: '#ffffff' } },
        title: { display: true, text: 'Server Overview', color: '#ffffff', font: { size: 18 } },
      },
      scales: {
        y: { beginAtZero: true, ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
        x: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      },
    },
  };
  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&backgroundColor=%231a1a2e&width=600&height=300`;
}

async function buildStats(client, guild, author) {
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

  return new ContainerBuilder()
    .setAccentColor(0x9B59B6)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${emojis.star} ${client.user.username} Statistics`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.info} General Info**\n` +
        `${emojis.arrowRight} **Bot:** ${client.user.username}\n` +
        `${emojis.arrowRight} **Ping:** ${ping}ms\n` +
        `${emojis.arrowRight} **Memory:** ${memory} MB\n` +
        `${emojis.arrowRight} **Uptime:** ${days}d ${hours}h ${minutes}m`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
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
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**${emojis.chart} Server Chart**`))
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(chartUrl))
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.user} Requested By**\n${emojis.arrowRight} **User:** ${author.tag}`
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('stats_close')
          .setLabel('Close')
          .setStyle(ButtonStyle.Danger)
      )
    );
}

module.exports = {
  name: 'stats',
  description: 'Show bot and server statistics',
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Show bot and server statistics'),

  async execute(context) {
    if (context.isChatInputCommand && context.isChatInputCommand()) {
      const container = await buildStats(context.client, context.guild, context.user);
      await context.reply({ components: [container], flags: 1 << 15 });
    } else {
      const container = await buildStats(context.client, context.guild, context.author);
      await context.reply({ components: [container], flags: 1 << 15 });
    }
  },
};
