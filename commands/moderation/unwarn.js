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
  name: 'unwarn',
  description: 'Remove a warning from a user',
  data: new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('Remove a warning from a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User to remove warning from').setRequired(true))
    .addIntegerOption(option =>
      option.setName('number').setDescription('Warning number to remove (see !warnings)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(context, args) {
    let targetUser, targetId, warningNumber;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      targetUser = context.options.getUser('user');
      targetId = targetUser.id;
      warningNumber = context.options.getInteger('number');
    } else {
      if (!context.member.permissions.has('ModerateMembers')) {
        return context.reply('You do not have permission!');
      }
      const member = context.mentions.members.first();
      if (!member) return context.reply('Mention a user to unwarn!');
      targetUser = member.user;
      targetId = member.id;
      warningNumber = parseInt(args[1]);
      if (!warningNumber) return context.reply('Provide a warning number! (see !warnings @user)');
    }

    const warnings = loadWarnings();
    const userWarnings = warnings[targetId] || [];

    if (userWarnings.length === 0) {
      const msg = `**${targetUser.tag}** has no warnings to remove.`;
      return context.isChatInputCommand?.()
        ? context.reply({ content: msg, ephemeral: true })
        : context.reply(msg);
    }

    if (warningNumber < 1 || warningNumber > userWarnings.length) {
      const msg = `Invalid warning number. **${targetUser.tag}** has ${userWarnings.length} warning(s).`;
      return context.isChatInputCommand?.()
        ? context.reply({ content: msg, ephemeral: true })
        : context.reply(msg);
    }

    const removed = userWarnings.splice(warningNumber - 1, 1)[0];
    warnings[targetId] = userWarnings;
    saveWarnings(warnings);

    const msg = `Removed warning **#${warningNumber}** from **${targetUser.tag}**.\nReason was: ${removed.reason}`;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      await context.reply(msg);
    } else {
      context.reply(msg);
    }
  },
};
