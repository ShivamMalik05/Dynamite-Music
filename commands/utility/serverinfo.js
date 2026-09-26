const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require('discord.js');
const emojis = require('../../emojis/emojis');

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

    if (!guild) return;

    // Fetch owner
    const owner = await guild.fetchOwner().catch(() => null);

    // Channels
    const totalChannels = guild.channels.cache.size;
    const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
    const categoryChannels = guild.channels.cache.filter(c => c.type === 4).size;
    const announcementChannels = guild.channels.cache.filter(c => c.type === 5).size;
    const stageChannels = guild.channels.cache.filter(c => c.type === 13).size;
    const forumChannels = guild.channels.cache.filter(c => c.type === 15).size;

    // Roles
    const totalRoles = guild.roles.cache.size;
    const managedRoles = guild.roles.cache.filter(r => r.managed).size;
    const highestRole = guild.roles.highest;

    // Members
    const totalMembers = guild.memberCount;
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const humans = totalMembers - bots;
    const online = guild.members.cache.filter(m => m.presence?.status === 'online').size;
    const idle = guild.members.cache.filter(m => m.presence?.status === 'idle').size;
    const dnd = guild.members.cache.filter(m => m.presence?.status === 'dnd').size;
    const offline = totalMembers - (online + idle + dnd);

    // Emojis & Stickers
    const totalEmojis = guild.emojis.cache.size;
    const animatedEmojis = guild.emojis.cache.filter(e => e.animated).size;
    const staticEmojis = totalEmojis - animatedEmojis;
    const totalStickers = guild.stickers?.cache.size || 0;

    // Boosts
    const boostCount = guild.premiumSubscriptionCount || 0;
    const boostLevel = guild.premiumTier || 0;

    // Verification
    const verificationLevels = {
      0: 'None',
      1: 'Low',
      2: 'Medium',
      3: 'High',
      4: 'Very High',
    };

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setAuthor({
        name: guild.name,
        iconURL: guild.iconURL({ dynamic: true, size: 256 }) || undefined,
      })
      .setTitle(`${emojis.home} Server Information`)
      .setDescription(
        `**${guild.name}**\n` +
        (guild.description ? `*${guild.description}*` : '')
      )
      .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
      .addFields(
        {
          name: '📋 General',
          value:
            `${emojis.dot} **Owner:** ${owner ? owner.user.tag : 'Unknown'}\n` +
            `${emojis.dot} **ID:** \`${guild.id}\`\n` +
            `${emojis.dot} **Created:** <t:${Math.floor(guild.createdTimestamp / 1000)}:F>\n` +
            `${emojis.dot} **Verification:** ${verificationLevels[guild.verificationLevel] || 'Unknown'}`,
          inline: false,
        },
        {
          name: '👥 Members',
          value:
            `${emojis.dot} **Total:** \`${totalMembers}\`\n` +
            `${emojis.dot} **Humans:** \`${humans}\`\n` +
            `${emojis.dot} **Bots:** \`${bots}\`\n` +
            `${emojis.dot} **Online:** \`${online}\`\n` +
            `${emojis.dot} **Idle:** \`${idle}\`\n` +
            `${emojis.dot} **DND:** \`${dnd}\`\n` +
            `${emojis.dot} **Offline:** \`${offline}\``,
          inline: true,
        },
        {
          name: '📢 Channels',
          value:
            `${emojis.dot} **Total:** \`${totalChannels}\`\n` +
            `${emojis.dot} **Text:** \`${textChannels}\`\n` +
            `${emojis.dot} **Voice:** \`${voiceChannels}\`\n` +
            `${emojis.dot} **Category:** \`${categoryChannels}\`\n` +
            `${emojis.dot} **Announcement:** \`${announcementChannels}\`\n` +
            `${emojis.dot} **Stage:** \`${stageChannels}\`\n` +
            `${emojis.dot} **Forum:** \`${forumChannels}\``,
          inline: true,
        },
        {
          name: '🎭 Roles',
          value:
            `${emojis.dot} **Total:** \`${totalRoles}\`\n` +
            `${emojis.dot} **Managed:** \`${managedRoles}\`\n` +
            `${emojis.dot} **Highest:** ${highestRole}`,
          inline: true,
        },
        {
          name: '😄 Emojis & Stickers',
          value:
            `${emojis.dot} **Total Emojis:** \`${totalEmojis}\`\n` +
            `${emojis.dot} **Static:** \`${staticEmojis}\`\n` +
            `${emojis.dot} **Animated:** \`${animatedEmojis}\`\n` +
            `${emojis.dot} **Stickers:** \`${totalStickers}\``,
          inline: true,
        },
        {
          name: '💎 Boosts',
          value:
            `${emojis.dot} **Count:** \`${boostCount}\`\n` +
            `${emojis.dot} **Level:** \`${boostLevel}\``,
          inline: true,
        }
      )
      .setFooter({
        text: 'Powered by Dynamite Music',
        iconURL: client.user.displayAvatarURL({ dynamic: true, size: 64 }),
      })
      .setTimestamp();

    // Send without auto-delete
    await context.reply({ embeds: [embed] });
  },
};
