const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
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

function makeThumb(url) {
  if (!url) return null;
  try {
    return new ThumbnailBuilder().setURL(url);
  } catch {
    return null;
  }
}

function formatDate(date) {
  return `<t:${Math.floor(date.getTime() / 1000)}:F>\n<t:${Math.floor(date.getTime() / 1000)}:R>`;
}

module.exports = {
  name: 'userinfo',
  description: 'Show user information',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Show user information')
    .addUserOption(option =>
      option.setName('user').setDescription('User to get info about').setRequired(false)),

  async execute(context, args) {
    const isSlash = context.isChatInputCommand && context.isChatInputCommand();
    let user, member, guild, client;

    if (isSlash) {
      user = context.options.getUser('user') || context.user;
      member = await context.guild.members.fetch(user.id).catch(() => null);
      guild = context.guild;
      client = context.client;
    } else {
      // Delete command message
      setTimeout(() => context.delete().catch(() => {}), 500);

      user = context.mentions.users.first() || context.author;
      member = await context.guild.members.fetch(user.id).catch(() => null);
      guild = context.guild;
      client = context.client;
    }

    if (!member) {
      const msg = await context.reply(`${emojis.error} User not found in this server.`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    // Roles (excluding @everyone)
    const roles = member.roles.cache
      .filter(r => r.id !== guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => `<@&${r.id}>`)
      .slice(0, 15)
      .join(' ') || '*No roles*';

    const moreRoles = member.roles.cache.size - 1 > 15
      ? `\n*+${member.roles.cache.size - 16} more...*`
      : '';

    // Status
    const statusMap = {
      online: '🟢 Online',
      idle: '🟡 Idle',
      dnd: '🔴 Do Not Disturb',
      offline: '⚫ Offline',
    };
    const status = statusMap[member.presence?.status] || '⚫ Offline';

    // Badges
    const flags = user.flags?.toArray() || [];
    const badgeMap = {
      Staff: '👨‍💼',
      Partner: '🤝',
      Hypesquad: '🎉',
      BugHunterLevel1: '🐛',
      BugHunterLevel2: '🐛',
      HypeSquadOnlineHouse1: '🏠',
      HypeSquadOnlineHouse2: '🏠',
      HypeSquadOnlineHouse3: '🏠',
      PremiumEarlySupporter: '⭐',
      VerifiedDeveloper: '👨‍💻',
      ActiveDeveloper: '🔧',
    };
    const badges = flags.map(f => badgeMap[f] || '').filter(Boolean).join(' ') || '*None*';

    // Container
    const container = new ContainerBuilder()
      .setAccentColor(member.displayHexColor && member.displayHexColor !== '#000000' ? parseInt(member.displayHexColor.slice(1), 16) : 0xFFFFFF)
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# ${emojis.user} ${user.username}\n` +
              `**${user.tag}**`
            )
          )
          .setThumbnailAccessory(makeThumb(user.displayAvatarURL({ dynamic: true, size: 256 })))
      )
      .addSeparatorComponents(makeSep())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.info} General Info**\n` +
          `${emojis.arrowRight} **ID:** \`${user.id}\`\n` +
          `${emojis.arrowRight} **Nickname:** ${member.nickname || '*None*'}\n` +
          `${emojis.arrowRight} **Bot:** ${user.bot ? '✅ Yes' : '❌ No'}\n` +
          `${emojis.arrowRight} **Status:** ${status}`
        )
      )
      .addSeparatorComponents(makeSep())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.time} Timestamps**\n` +
          `${emojis.arrowRight} **Created:**\n${formatDate(user.createdAt)}\n` +
          `${emojis.arrowRight} **Joined:**\n${formatDate(member.joinedAt)}`
        )
      )
      .addSeparatorComponents(makeSep())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.star} Badges**\n${badges}`
        )
      )
      .addSeparatorComponents(makeSep())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.role || '🎭'} Roles (${member.roles.cache.size - 1})**\n${roles}${moreRoles}`
        )
      )
      .addSeparatorComponents(makeSep())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.chart || '📊'} Permissions**\n` +
          `${emojis.arrowRight} **Highest Role:** ${member.roles.highest}\n` +
          `${emojis.arrowRight} **Color:** \`${member.displayHexColor}\``
        )
      )
      .addSeparatorComponents(makeSep())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Avatar')
        .setEmoji('🖼️')
        .setURL(user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Banner')
        .setEmoji('🎨')
        .setURL(user.bannerURL({ dynamic: true, size: 1024 }) || 'https://discord.com')
        .setStyle(ButtonStyle.Link)
        .setDisabled(!user.banner)
    );

    if (isSlash) {
      await context.reply({
        components: [container, row],
        flags: 1 << 15,
      });
    } else {
      const sentMsg = await context.reply({
        components: [container, row],
        flags: 1 << 15,
      });
      setTimeout(() => sentMsg.delete().catch(() => {}), 30000);
    }
  },
};
