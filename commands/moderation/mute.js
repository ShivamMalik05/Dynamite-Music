const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const { sendLog } = require('../../utils/logger');
const { checkPermission } = require('../../utils/permissions');

function formatDuration(minutes) {
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  return parts.join(' ') || '0m';
}

module.exports = {
  name: 'mute',
  description: 'Mute a user (timeout)',
  category: 'Moderation',
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a user (timeout)')
    .addUserOption(option =>
      option.setName('user').setDescription('User to mute').setRequired(true))
    .addIntegerOption(option =>
      option.setName('minutes').setDescription('Duration in minutes (default 10)').setRequired(false))
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for mute').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(context, args) {
    if (!(await checkPermission(context, 'mute'))) return;

    const isSlash = context.isChatInputCommand && context.isChatInputCommand();
    let member, minutes, reason, moderatorTag, moderatorId, client, guild;

    if (isSlash) {
      const user = context.options.getUser('user');
      member = await context.guild.members.fetch(user.id).catch(() => null);
      minutes = context.options.getInteger('minutes') || 10;
      reason = context.options.getString('reason') || 'No reason provided';
      moderatorTag = context.user.tag;
      moderatorId = context.user.id;
      client = context.client;
      guild = context.guild;
    } else {
      // Delete user's command message (after 500ms)
      setTimeout(() => context.delete().catch(() => {}), 500);

      if (!context.member.permissions.has('ModerateMembers')) {
        const msg = await context.reply(`${emojis.error} You do not have permission!`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
        return;
      }
      member = context.mentions.members.first();
      if (!member) {
        const msg = await context.reply(`${emojis.error} Mention a user to mute!`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
        return;
      }
      minutes = parseInt(args[1]) || 10;
      reason = args.slice(2).join(' ') || 'No reason provided';
      moderatorTag = context.author.tag;
      moderatorId = context.author.id;
      client = context.client;
      guild = context.guild;
    }

    if (!member) {
      const msg = await context.reply(`${emojis.error} User not found in this server.`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    if (!member.moderatable) {
      const msg = await context.reply(`${emojis.error} Cannot mute this user!`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    if (member.id === moderatorId) {
      const msg = await context.reply(`${emojis.error} You cannot mute yourself!`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    if (minutes < 1 || minutes > 10080) {
      const msg = await context.reply(`${emojis.error} Minutes must be between 1 and 10080 (7 days).`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    const user = member.user;
    const durationText = formatDuration(minutes);

    // DM to target before mute
    try {
      const dmEmbed = new EmbedBuilder()
        .setColor(0x9B59B6)
        .setAuthor({
          name: `Muted in ${guild.name}`,
          iconURL: guild.iconURL({ dynamic: true, size: 128 }) || client.user.displayAvatarURL({ dynamic: true, size: 128 })
        })
        .setTitle(`${emojis.mute} You Have Been Muted`)
        .setDescription(`You have been muted in **${guild.name}**.`)
        .addFields(
          { name: `${emojis.reason} Reason`, value: `\`\`\`${reason}\`\`\``, inline: false },
          { name: `${emojis.duration} Duration`, value: durationText, inline: true }
        )
        .setFooter({ text: 'Powered by Dynamite Music' })
        .setTimestamp();

      await user.send({ embeds: [dmEmbed] });
    } catch (err) {}

    // Mute
    try {
      await member.timeout(minutes * 60 * 1000, reason);
    } catch (err) {
      const msg = await context.reply(`${emojis.error} Failed to mute: ${err.message}`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    // Public embed
    const publicEmbed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setAuthor({
        name: 'Moderation Action',
        iconURL: client.user.displayAvatarURL({ dynamic: true, size: 128 })
      })
      .setTitle(`${emojis.mute} User Muted`)
      .setDescription(
        `> **${user.tag}** has been muted.\n\n` +
        `**${emojis.reason} Reason:** ${reason}\n` +
        `**${emojis.duration} Duration:** ${durationText}`
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setFooter({
        text: 'Powered by Dynamite Music',
        iconURL: client.user.displayAvatarURL({ dynamic: true, size: 64 })
      })
      .setTimestamp();

    let sentMsg;
    if (isSlash) {
      sentMsg = await context.reply({ embeds: [publicEmbed] });
      setTimeout(() => context.deleteReply().catch(() => {}), 3000);
    } else {
      sentMsg = await context.reply({ embeds: [publicEmbed] });
      setTimeout(() => sentMsg.delete().catch(() => {}), 3000);
    }

    // Log
    await sendLog(client, 'moderation', {
      emoji: emojis.mute,
      title: 'User Muted',
      subtitle: 'A user was muted',
      fields: [
        { name: '👤 User', value: `${user.tag} (${user.id})` },
        { name: '🛡️ Moderator', value: `${moderatorTag} (${moderatorId})` },
        { name: '📝 Reason', value: reason },
        { name: '⏱️ Duration', value: durationText },
      ],
    });
  },
};
