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

function generateDoughnutChart(labels, data, title = '') {
  const chartConfig = {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          '#000000', '#333333', '#666666', '#999999',
          '#CCCCCC', '#1a1a1a', '#4d4d4d', '#808080',
        ],
        borderColor: '#FFFFFF',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: { color: '#000000', font: { size: 13, weight: 'bold' }, padding: 12, boxWidth: 15 },
        },
        title: {
          display: !!title,
          text: title,
          color: '#000000',
          font: { size: 18, weight: 'bold' },
          padding: { top: 10, bottom: 15 },
        },
        tooltip: {
          backgroundColor: '#000000',
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
        },
      },
    },
  };
  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&backgroundColor=%23FFFFFF&width=600&height=400&devicePixelRatio=2`;
}

async function getServerData(guild) {
  const owner = await guild.fetchOwner().catch(() => null);
  const totalChannels = guild.channels.cache.size;
  const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
  const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
  const categoryChannels = guild.channels.cache.filter(c => c.type === 4).size;
  const announcementChannels = guild.channels.cache.filter(c => c.type === 5).size;
  const stageChannels = guild.channels.cache.filter(c => c.type === 13).size;
  const forumChannels = guild.channels.cache.filter(c => c.type === 15).size;
  const totalRoles = guild.roles.cache.size;
  const managedRoles = guild.roles.cache.filter(r => r.managed).size;
  const highestRole = guild.roles.highest;
  const totalMembers = guild.memberCount;
  const bots = guild.members.cache.filter(m => m.user.bot).size;
  const humans = totalMembers - bots;
  const online = guild.members.cache.filter(m => m.presence?.status === 'online').size;
  const idle = guild.members.cache.filter(m => m.presence?.status === 'idle').size;
  const dnd = guild.members.cache.filter(m => m.presence?.status === 'dnd').size;
  const offline = totalMembers - (online + idle + dnd);
  const totalEmojis = guild.emojis.cache.size;
  const animatedEmojis = guild.emojis.cache.filter(e => e.animated).size;
  const staticEmojis = totalEmojis - animatedEmojis;
  const totalStickers = guild.stickers?.cache.size || 0;
  const boostCount = guild.premiumSubscriptionCount || 0;
  const boostLevel = guild.premiumTier || 0;

  return {
    owner, totalChannels, textChannels, voiceChannels, categoryChannels,
    announcementChannels, stageChannels, forumChannels,
    totalRoles, managedRoles, highestRole,
    totalMembers, bots, humans, online, idle, dnd, offline,
    totalEmojis, animatedEmojis, staticEmojis, totalStickers,
    boostCount, boostLevel,
  };
}

function buildFrontPage(guild, client) {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.home} ${guild.name}\n**Server Information Panel**`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.info} About**\n` +
        `This panel shows detailed information about **${guild.name}**.\n\n` +
        `**${emojis.info} How to use:**\n` +
        `${emojis.arrow} Click a button below\n` +
        `${emojis.arrow} Each page shows different stats\n` +
        `${emojis.arrow} Charts show distribution`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('si_overview').setLabel('Overview').setEmoji('📊').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('si_members').setLabel('Members').setEmoji('👥').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('si_channels').setLabel('Channels').setEmoji('📢').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('si_roles').setLabel('Roles').setEmoji('🎭').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('si_boosts').setLabel('Boosts').setEmoji('💎').setStyle(ButtonStyle.Success)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('si_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row, row2];
}

async function buildOverviewPage(guild, client) {
  const d = await getServerData(guild);

  const chartUrl = generateDoughnutChart(
    ['Text', 'Voice', 'Category', 'Announcement', 'Stage', 'Forum'],
    [d.textChannels, d.voiceChannels, d.categoryChannels, d.announcementChannels, d.stageChannels, d.forumChannels],
    'Channel Distribution'
  );

  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${emojis.chart || '📊'} Overview\n**${guild.name}**`)
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.info} General**\n` +
        `${emojis.arrow} **Owner:** ${d.owner ? d.owner.user.tag : 'Unknown'}\n` +
        `${emojis.arrow} **ID:** \`${guild.id}\`\n` +
        `${emojis.arrow} **Created:** <t:${Math.floor(guild.createdTimestamp / 1000)}:R>`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.stats} Quick Stats**\n` +
        `${emojis.arrow} **Members:** \`${d.totalMembers}\`\n` +
        `${emojis.arrow} **Channels:** \`${d.totalChannels}\`\n` +
        `${emojis.arrow} **Roles:** \`${d.totalRoles}\`\n` +
        `${emojis.arrow} **Emojis:** \`${d.totalEmojis}\``
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**${emojis.chart || '📊'} Channel Chart**`)
    )
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(chartUrl))
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('si_home').setLabel('Home').setEmoji('🏠').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('si_members').setLabel('Members').setEmoji('👥').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('si_channels').setLabel('Channels').setEmoji('📢').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('si_roles').setLabel('Roles').setEmoji('🎭').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('si_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row];
}

async function buildMembersPage(guild, client) {
  const d = await getServerData(guild);
  const chartUrl = generateDoughnutChart(
    ['Online', 'Idle', 'DND', 'Offline'],
    [d.online, d.idle, d.dnd, d.offline],
    'Member Status'
  );

  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${emojis.person} Members\n**${guild.name}**`)
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.stats} Total**\n` +
        `${emojis.arrow} **Members:** \`${d.totalMembers}\`\n` +
        `${emojis.arrow} **Humans:** \`${d.humans}\`\n` +
        `${emojis.arrow} **Bots:** \`${d.bots}\``
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.dot} Status**\n` +
        `${emojis.arrow} **Online:** \`${d.online}\`\n` +
        `${emojis.arrow} **Idle:** \`${d.idle}\`\n` +
        `${emojis.arrow} **DND:** \`${d.dnd}\`\n` +
        `${emojis.arrow} **Offline:** \`${d.offline}\``
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**${emojis.chart || '📊'} Member Chart**`)
    )
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(chartUrl))
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('si_home').setLabel('Home').setEmoji('🏠').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('si_overview').setLabel('Overview').setEmoji('📊').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('si_channels').setLabel('Channels').setEmoji('📢').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('si_roles').setLabel('Roles').setEmoji('🎭').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('si_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row];
}

async function buildChannelsPage(guild, client) {
  const d = await getServerData(guild);
  const chartUrl = generateDoughnutChart(
    ['Text', 'Voice', 'Category', 'Announcement', 'Stage', 'Forum'],
    [d.textChannels, d.voiceChannels, d.categoryChannels, d.announcementChannels, d.stageChannels, d.forumChannels],
    'Channel Types'
  );

  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${emojis.home} Channels\n**${guild.name}**`)
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**${emojis.stats} Total Channels:** \`${d.totalChannels}\``)
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.info} Breakdown**\n` +
        `${emojis.arrow} **Text:** \`${d.textChannels}\`\n` +
        `${emojis.arrow} **Voice:** \`${d.voiceChannels}\`\n` +
        `${emojis.arrow} **Category:** \`${d.categoryChannels}\`\n` +
        `${emojis.arrow} **Announcement:** \`${d.announcementChannels}\`\n` +
        `${emojis.arrow} **Stage:** \`${d.stageChannels}\`\n` +
        `${emojis.arrow} **Forum:** \`${d.forumChannels}\``
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**${emojis.chart || '📊'} Channel Chart**`)
    )
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(chartUrl))
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('si_home').setLabel('Home').setEmoji('🏠').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('si_overview').setLabel('Overview').setEmoji('📊').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('si_members').setLabel('Members').setEmoji('👥').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('si_roles').setLabel('Roles').setEmoji('🎭').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('si_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row];
}

async function buildRolesPage(guild, client) {
  const d = await getServerData(guild);

  const topRoles = guild.roles.cache
    .filter(r => r.id !== guild.id)
    .sort((a, b) => b.members.size - a.members.size)
    .first(5);

  const roleNames = topRoles.map(r => r.name.slice(0, 15));
  const roleCounts = topRoles.map(r => r.members.size);

  const chartUrl = generateDoughnutChart(roleNames, roleCounts, 'Top Roles by Members');

  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${emojis.mod} Roles\n**${guild.name}**`)
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.stats} Total Roles:** \`${d.totalRoles}\`\n` +
        `${emojis.arrow} **Managed:** \`${d.managedRoles}\`\n` +
        `${emojis.arrow} **Highest:** ${d.highestRole}`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.stats} Top 5 Roles**\n` +
        topRoles.map((r, i) => `${emojis.arrow} **#${i + 1}** ${r} — \`${r.members.size}\` members`).join('\n')
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**${emojis.chart || '📊'} Role Chart**`)
    )
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(chartUrl))
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('si_home').setLabel('Home').setEmoji('🏠').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('si_overview').setLabel('Overview').setEmoji('📊').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('si_members').setLabel('Members').setEmoji('👥').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('si_channels').setLabel('Channels').setEmoji('📢').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('si_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row];
}

async function buildBoostsPage(guild, client) {
  const d = await getServerData(guild);
  const maxBoost = [0, 2, 7, 14][d.boostLevel] || 14;
  const remaining = maxBoost - d.boostCount;

  const chartUrl = generateDoughnutChart(
    ['Current Boosts', 'Remaining'],
    [d.boostCount, Math.max(0, remaining)],
    `Boost Progress (Level ${d.boostLevel})`
  );

  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${emojis.verified} Boosts\n**${guild.name}**`)
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.stats} Boost Info**\n` +
        `${emojis.arrow} **Count:** \`${d.boostCount}\`\n` +
        `${emojis.arrow} **Level:** \`${d.boostLevel}\`\n` +
        `${emojis.arrow} **Next Level:** \`${Math.max(0, remaining)}\` more needed`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.info} Emoji Stats**\n` +
        `${emojis.arrow} **Total:** \`${d.totalEmojis}\`\n` +
        `${emojis.arrow} **Static:** \`${d.staticEmojis}\`\n` +
        `${emojis.arrow} **Animated:** \`${d.animatedEmojis}\`\n` +
        `${emojis.arrow} **Stickers:** \`${d.totalStickers}\``
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**${emojis.chart || '📊'} Boost Chart**`)
    )
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(chartUrl))
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('si_home').setLabel('Home').setEmoji('🏠').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('si_overview').setLabel('Overview').setEmoji('📊').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('si_members').setLabel('Members').setEmoji('👥').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('si_roles').setLabel('Roles').setEmoji('🎭').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('si_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row];
}

module.exports = {
  name: 'serverinfo',
  description: 'Show server information',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Show server information'),

  async execute(context) {
    const isSlash = context.isChatInputCommand && context.isChatInputCommand();
    const guild = context.guild;
    const client = context.client;

    if (!isSlash) {
      setTimeout(() => context.delete().catch(() => {}), 500);
    }

    const components = buildFrontPage(guild, client);
    await context.reply({ components, flags: 1 << 15 });
  },

  async handleButton(interaction, client) {
    const id = interaction.customId;
    if (!id.startsWith('si_')) return false;

    const guild = interaction.guild;

    if (id === 'si_close') {
      try {
        await interaction.message.delete();
      } catch (err) {
        try {
          await interaction.update({ content: 'Closed.', components: [], embeds: [] });
        } catch (err2) {}
      }
      return true;
    }

    let components;
    if (id === 'si_home') components = buildFrontPage(guild, client);
    else if (id === 'si_overview') components = await buildOverviewPage(guild, client);
    else if (id === 'si_members') components = await buildMembersPage(guild, client);
    else if (id === 'si_channels') components = await buildChannelsPage(guild, client);
    else if (id === 'si_roles') components = await buildRolesPage(guild, client);
    else if (id === 'si_boosts') components = await buildBoostsPage(guild, client);
    else return false;

    await interaction.update({ components, flags: 1 << 15 });
    return true;
  },
};
