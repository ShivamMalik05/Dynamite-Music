const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const { sendLog } = require('../../utils/logger');
const { checkPermission } = require('../../utils/permissions');
const fs = require('fs');
const path = require('path');

const tempBansPath = path.join(__dirname, '..', '..', 'data', 'tempbans.json');

function loadTempBans() {
  if (!fs.existsSync(tempBansPath)) return { bans: {} };
  try {
    const data = JSON.parse(fs.readFileSync(tempBansPath, 'utf8'));
    if (!data.bans) data.bans = {};
    return data;
  } catch {
    return { bans: {} };
  }
}

function saveTempBans(data) {
  const dir = path.dirname(tempBansPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(tempBansPath, JSON.stringify(data, null, 2));
}

function parseDuration(str) {
  if (!str) return null;
  const match = str.match(/^(\d+)([smhdw])$/i);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000 };
  return value * multipliers[unit];
}

function formatDuration(ms) {
  if (!ms) return 'Permanent';
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  return parts.join(' ') || '0m';
}

module.exports = {
  name: 'ban',
  description: 'Ban a user (temp or permanent)',
  category: 'Moderation',
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user (temp or permanent)')
    .addUserOption(option =>
      option.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for ban').setRequired(false))
    .addStringOption(option =>
      option.setName('duration').setDescription('Duration (e.g. 7d, 12h, 30m)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(context, args) {
    if (!(await checkPermission(context, 'ban'))) return;

    const isSlash = context.isChatInputCommand && context.isChatInputCommand();
    let member, reason, duration, moderatorTag, moderatorId, client, guild;

    if (isSlash) {
      const user = context.options.getUser('user');
      reason = context.options.getString('reason') || 'No reason provided';
      duration = context.options.getString('duration');
      member = await context.guild.members.fetch(user.id).catch(() => null);
      moderatorTag = context.user.tag;
      moderatorId = context.user.id;
      client = context.client;
      guild = context.guild;
    } else {
      // Delete user's command message (after 500ms)
      setTimeout(() => context.delete().catch(() => {}), 500);

      if (!context.member.permissions.has('BanMembers')) {
        const msg = await context.reply(`${emojis.error} You do not have permission!`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
        return;
      }
      member = context.mentions.members.first();
      if (!member) {
        const msg = await context.reply(`${emojis.error} Mention a user to ban!`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
        return;
      }
      let remaining = args.slice(1);
      if (remaining[0] && parseDuration(remaining[0])) {
        duration = remaining.shift();
      }
      reason = remaining.join(' ') || 'No reason provided';
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

    if (!member.bannable) {
      const msg = await context.reply(`${emojis.error} Cannot ban this user!`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    if (member.id === moderatorId) {
      const msg = await context.reply(`${emojis.error} You cannot ban yourself!`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    const user = member.user;
    const durationMs = parseDuration(duration);
    const isTemp = durationMs !== null;

    // DM to target BEFORE ban
    try {
      const dmEmbed = new EmbedBuilder()
        .setColor(0xED4245)
        .setAuthor({
          name: `Banned from ${guild.name}`,
          iconURL: guild.iconURL({ dynamic: true, size: 128 }) || client.user.displayAvatarURL({ dynamic: true, size: 128 })
        })
        .setTitle(`${emojis.ban} You Have Been Banned`)
        .setDescription(`You have been banned from **${guild.name}**.`)
        .addFields(
          { name: `${emojis.reason} Reason`, value: `\`\`\`${reason}\`\`\``, inline: false },
          { name: `${emojis.duration} Duration`, value: isTemp ? formatDuration(durationMs) : 'Permanent', inline: true }
        )
        .setFooter({ text: 'Powered by Dynamite Music' })
        .setTimestamp();

      await user.send({ embeds: [dmEmbed] });
    } catch (err) {}

    // Ban
    try {
      await member.ban({ reason });
    } catch (err) {
      const msg = await context.reply(`${emojis.error} Failed to ban: ${err.message}`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    // Save temp ban
    if (isTemp) {
      const tempBans = loadTempBans();
      tempBans.bans[user.id] = {
        userId: user.id,
        userTag: user.tag,
        guildId: guild.id,
        moderator: moderatorTag,
        moderatorId,
        reason,
        unbanAt: Date.now() + durationMs,
      };
      saveTempBans(tempBans);
    }

    // Public embed
    const publicEmbed = new EmbedBuilder()
      .setColor(0xED4245)
      .setAuthor({
        name: 'Moderation Action',
        iconURL: client.user.displayAvatarURL({ dynamic: true, size: 128 })
      })
      .setTitle(`${emojis.ban} User Banned`)
      .setDescription(
        `> **${user.tag}** has been banned.\n\n` +
        `**${emojis.reason} Reason:** ${reason}\n` +
        `**${emojis.duration} Duration:** ${isTemp ? formatDuration(durationMs) : 'Permanent'}`
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
      emoji: emojis.ban,
      title: 'User Banned',
      subtitle: 'A user was banned',
      fields: [
        { name: '👤 User', value: `${user.tag} (${user.id})` },
        { name: '🛡️ Moderator', value: `${moderatorTag} (${moderatorId})` },
        { name: '📝 Reason', value: reason },
        { name: '⏱️ Duration', value: isTemp ? formatDuration(durationMs) : 'Permanent' },
      ],
    });
  },
};
