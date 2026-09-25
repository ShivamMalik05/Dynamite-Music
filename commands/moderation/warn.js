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

const warningsPath = path.join(__dirname, '..', '..', 'data', 'warnings.json');

function loadWarnings() {
  if (!fs.existsSync(warningsPath)) return {};
  return JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
}

function saveWarnings(data) {
  const dir = path.dirname(warningsPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(warningsPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: 'warn',
  description: 'Warn a user',
  category: 'Moderation',
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(context, args) {
    // Permission check
    if (!(await checkPermission(context, 'warn'))) return;

    let targetUser, targetId, moderatorTag, moderatorId, reason, client, guild;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      targetUser = context.options.getUser('user');
      targetId = targetUser.id;
      moderatorTag = context.user.tag;
      moderatorId = context.user.id;
      reason = context.options.getString('reason') || 'No reason provided';
      client = context.client;
      guild = context.guild;
    } else {
      if (!context.member.permissions.has('ModerateMembers')) {
        return context.reply(`${emojis.error} You do not have permission!`);
      }
      const member = context.mentions.members.first();
      if (!member) return context.reply(`${emojis.error} Mention a user to warn!`);
      if (member.id === context.author.id) return context.reply(`${emojis.error} You cannot warn yourself!`);
      targetUser = member.user;
      targetId = member.id;
      moderatorTag = context.author.tag;
      moderatorId = context.author.id;
      reason = args.slice(1).join(' ') || 'No reason provided';
      client = context.client;
      guild = context.guild;
    }

    // Save warning
    const warnings = loadWarnings();
    if (!warnings[targetId]) warnings[targetId] = [];
    warnings[targetId].push({
      reason,
      moderator: moderatorTag,
      moderatorId,
      date: new Date().toISOString(),
    });
    saveWarnings(warnings);

    const totalWarnings = warnings[targetId].length;

    // ===== PUBLIC REPLY EMBED =====
    const publicEmbed = new EmbedBuilder()
      .setColor(0xFEE75C)
      .setAuthor({
        name: 'Moderation Action',
        iconURL: client.user.displayAvatarURL({ dynamic: true, size: 128 })
      })
      .setTitle(`${emojis.warn} Warning Issued`)
      .setDescription(
        `> ${targetUser} has received a warning.\n\n` +
        `**Please make sure to follow the server rules.**\n` +
        `Continued violations may result in further action.`
      )
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: `${emojis.reason} Reason`, value: `\`\`\`${reason}\`\`\``, inline: false },
        { name: `${emojis.warnings} Total Warnings`, value: `\`${totalWarnings}\``, inline: true },
        { name: `${emojis.timeout} Issued`, value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
      )
      .setFooter({
        text: 'Powered by Dynamite Music',
        iconURL: client.user.displayAvatarURL({ dynamic: true, size: 64 })
      })
      .setTimestamp();

    const replyPayload = {
      content: `${targetUser}`,
      embeds: [publicEmbed]
    };

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      await context.reply(replyPayload);
    } else {
      context.reply(replyPayload);
    }

    // ===== DM TO TARGET =====
    const dmEmbed = new EmbedBuilder()
      .setColor(0xFEE75C)
      .setAuthor({
        name: `Warning from ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true, size: 128 }) || client.user.displayAvatarURL({ dynamic: true, size: 128 })
      })
      .setTitle(`${emojis.warn} You Have Been Warned`)
      .setDescription(
        `You have received a warning in **${guild.name}**.\n\n` +
        `Please review the server rules to avoid further actions.`
      )
      .addFields(
        { name: `${emojis.reason} Reason`, value: `\`\`\`${reason}\`\`\``, inline: false },
        { name: `${emojis.moderator} Moderator`, value: moderatorTag, inline: true },
        { name: `${emojis.warnings} Total Warnings`, value: `\`${totalWarnings}\``, inline: true }
      )
      .setFooter({ text: 'Powered by Dynamite Music' })
      .setTimestamp();

    try {
      await targetUser.send({ embeds: [dmEmbed] });
    } catch (err) {
      // DM failed, ignore
    }

    // ===== LOG (moderator visible here only) =====
    await sendLog(client, 'moderation', {
      emoji: emojis.warn,
      title: 'User Warned',
      subtitle: 'A user was warned',
      fields: [
        { name: '👤 User', value: `${targetUser.tag} (${targetId})` },
        { name: '🛡️ Moderator', value: `${moderatorTag} (${moderatorId})` },
        { name: '📝 Reason', value: reason },
        { name: '📊 Total Warnings', value: `${totalWarnings}` },
      ],
    });
  },
};
