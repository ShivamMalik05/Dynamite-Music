const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
} = require('discord.js');
const emojis = require('../../emojis/emojis');

function makeSep() {
  try {
    const sep = new SeparatorBuilder();
    if (typeof sep.setSpacing === 'function') sep.setSpacing(1);
    if (typeof sep.setDivider === 'function') sep.setDivider(true);
    return sep;
  } catch {
    return { type: 14, divider: true, spacing: 1 };
  }
}

// ===== GENERATE CHART URL =====
function generateChartUrl(labels, data) {
  const chartConfig = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Server Stats',
          data: data,
          borderColor: '#FFFFFF',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderWidth: 3,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 9,
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
            color: '#FFFFFF',
            font: { size: 14, weight: 'bold' },
          },
        },
        title: {
          display: true,
          text: 'Server Overview',
          color: '#FFFFFF',
          font: { size: 20, weight: 'bold' },
          padding: { top: 10, bottom: 20 },
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          borderColor: '#FFFFFF',
          borderWidth: 1,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#FFFFFF',
            font: { size: 12 },
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.15)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
        },
        x: {
          ticks: {
            color: '#FFFFFF',
            font: { size: 12 },
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.15)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
        },
      },
    },
  };

  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&backgroundColor=%231a1a2e&width=700&height=350&devicePixelRatio=2`;
}

// ===== GENERATE BAR CHART =====
function generateBarChartUrl(labels, data) {
  const chartConfig = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Count',
          data: data,
          backgroundColor: [
            'rgba(255, 255, 255, 0.7)',
            'rgba(255, 255, 255, 0.5)',
            'rgba(255, 255, 255, 0.6)',
            'rgba(255, 255, 255, 0.4)',
            'rgba(255, 255, 255, 0.8)',
          ],
          borderColor: '#FFFFFF',
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Server Distribution',
          color: '#FFFFFF',
          font: { size: 18, weight: 'bold' },
          padding: { top: 10, bottom: 20 },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#FFFFFF' },
          grid: { color: 'rgba(255, 255, 255, 0.15)' },
        },
        x: {
          ticks: { color: '#FFFFFF' },
          grid: { color: 'rgba(255, 255, 255, 0.15)' },
        },
      },
    },
  };

  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&backgroundColor=%231a1a2e&width=700&height=350&devicePixelRatio=2`;
}

module.exports = {
  name: 'stats',
  description: 'Show bot and server statistics',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Show bot and server statistics'),

  async execute(context) {
    const isSlash = context.isChatInputCommand && context.isChatInputCommand();
    const client = context.client;
    const guild = context.guild;

    if (!isSlash) {
      setTimeout(() => context.delete().catch(() => {}), 500);
    }

    const totalServers = client.guilds.cache.size;
    const totalUsers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
    const uptime = client.uptime;
    const days = Math.floor(uptime / 86400000);
    const hours = Math.floor(uptime / 3600000) % 24;
    const minutes = Math.floor(uptime / 60000) % 60;
    const seconds = Math.floor(uptime / 1000) % 60;
    const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const ping = client.ws.ping;

    const serverMembers = guild.memberCount;
    const serverChannels = guild.channels.cache.size;
    const serverRoles = guild.roles.cache.size;
    const serverBoosts = guild.premiumSubscriptionCount || 0;
    const serverEmojis = guild.emojis.cache.size;
    const serverOwner = await guild.fetchOwner().catch(() => null);

    // Chart URLs
    const lineChartUrl = generateChartUrl(
      ['Members', 'Channels', 'Roles', 'Boosts'],
      [serverMembers, serverChannels, serverRoles, serverBoosts]
    );

    const barChartUrl = generateBarChartUrl(
      ['Members', 'Channels', 'Roles', 'Emojis', 'Boosts'],
      [serverMembers, serverChannels, serverRoles, serverEmojis, serverBoosts]
    );

    const container = new ContainerBuilder()
      .setAccentColor(0xFFFFFF)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${emojis.stats} ${client.user.username} Statistics\n` +
          `**Bot & Server Information**`
        )
      )
      .addSeparatorComponents(makeSep())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.info} General Info**\n` +
          `${emojis.dot} **Bot:** ${client.user.username}\n` +
          `${emojis.dot} **Ping:** ${ping}ms\n` +
          `${emojis.dot} **Memory:** ${memory} MB\n` +
          `${emojis.dot} **Uptime:** ${days}d ${hours}h ${minutes}m ${seconds}s`
        )
      )
      .addSeparatorComponents(makeSep())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.home} Server Stats**\n` +
          `${emojis.dot} **Name:** ${guild.name}\n` +
          `${emojis.dot} **Owner:** ${serverOwner ? serverOwner.user.tag : 'Unknown'}\n` +
          `${emojis.dot} **Members:** ${serverMembers}\n` +
          `${emojis.dot} **Channels:** ${serverChannels}\n` +
          `${emojis.dot} **Roles:** ${serverRoles}\n` +
          `${emojis.dot} **Emojis:** ${serverEmojis}\n` +
          `${emojis.dot} **Boosts:** ${serverBoosts}`
        )
      )
      .addSeparatorComponents(makeSep())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.verified} Bot Stats**\n` +
          `${emojis.dot} **Servers:** ${totalServers}\n` +
          `${emojis.dot} **Users:** ${totalUsers}`
        )
      )
      .addSeparatorComponents(makeSep())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${emojis.chart} Server Overview**`)
      )
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL(lineChartUrl)
        )
      )
      .addSeparatorComponents(makeSep())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${emojis.chart} Server Distribution**`)
      )
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL(barChartUrl)
        )
      )
      .addSeparatorComponents(makeSep())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('stats_close')
        .setLabel('Close')
        .setEmoji('❌')
        .setStyle(ButtonStyle.Danger)
    );

    await context.reply({
      components: [container, row],
      flags: 1 << 15,
    });
  },

  // ===== BUTTON HANDLER =====
  async handleButton(interaction, client) {
    const id = interaction.customId;
    if (!id.startsWith('stats_')) return false;

    if (id === 'stats_close') {
      try {
        await interaction.message.delete();
      } catch (err) {
        try {
          await interaction.update({ content: 'Stats closed.', components: [], embeds: [] });
        } catch (err2) {
          console.error('Stats close failed:', err2.message);
        }
      }
      return true;
    }

    return false;
  },
};
