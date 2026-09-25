const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
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
    // Custom permission check
    if (!(await checkPermission(context, 'warn'))) return;

    let targetUser, targetId, moderatorTag, reason, client;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      targetUser = context.options.getUser('user');
      targetId = targetUser.id;
      moderatorTag = context.user.tag;
      reason = context.options.getString('reason') || 'No reason provided';
      client = context.client;
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
      reason = args.slice(1).join(' ') || 'No reason provided';
      client = context.client;
    }

    const warnings = loadWarnings();
    if (!warnings[targetId]) warnings[targetId] = [];
    warnings[targetId].push({
      reason,
      moderator: moderatorTag,
      date: new Date().toISOString(),
    });
    saveWarnings(warnings);

    const embed = new EmbedBuilder()
      .setColor(0xFEE75C)
      .setTitle(`${emojis.warn} User Warned`)
      .setDescription(`**${targetUser.tag}** has been warned.`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: `${emojis.user} User`, value: `${targetUser} (${targetUser.tag})`, inline: true },
        { name: `${emojis.moderator} Moderator`, value: moderatorTag, inline: true },
        { name: `${emojis.reason} Reason`, value: reason, inline: false },
        { name: `${emojis.warnings} Total Warnings`, value: `${warnings[targetId].length}`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Powered by Dynamite Music' });

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      await context.reply({ embeds: [embed] });
    } else {
      context.reply({ embeds: [embed] });
    }

    await sendLog(client, 'moderation', {
      emoji: emojis.warn,
      title: 'User Warned',
      subtitle: 'A user was warned',
      fields: [
        { name: 'User', value: `${targetUser.tag} (${targetId})` },
        { name: 'Moderator', value: moderatorTag },
        { name: 'Reason', value: reason },
        { name: 'Total Warnings', value: `${warnings[targetId].length}` },
      ],
    });
  },
};
