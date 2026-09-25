const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
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
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(context, args) {
    let targetUser, targetId, moderatorTag, reason;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      targetUser = context.options.getUser('user');
      targetId = targetUser.id;
      moderatorTag = context.user.tag;
      reason = context.options.getString('reason') || 'No reason provided';
    } else {
      if (!context.member.permissions.has('ModerateMembers')) {
        return context.reply('You do not have permission!');
      }
      const member = context.mentions.members.first();
      if (!member) return context.reply('Mention a user to warn!');
      if (member.id === context.author.id) return context.reply('You cannot warn yourself!');
      targetUser = member.user;
      targetId = member.id;
      moderatorTag = context.author.tag;
      reason = args.slice(1).join(' ') || 'No reason provided';
    }

    const warnings = loadWarnings();
    if (!warnings[targetId]) warnings[targetId] = [];
    warnings[targetId].push({
      reason,
      moderator: moderatorTag,
      date: new Date().toISOString(),
    });
    saveWarnings(warnings);

    const msg = `Warned **${targetUser.tag}**. Reason: ${reason} (Total: ${warnings[targetId].length})`;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      await context.reply(msg);
    } else {
      context.reply(msg);
    }
  },
};
