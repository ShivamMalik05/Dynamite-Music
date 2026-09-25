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
  name: 'warnings',
  description: 'Show or remove user warnings',
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Show or remove user warnings')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('remove')
        .setDescription('Warning number to remove (optional)')
        .setRequired(false)),

  async execute(context, args) {
    let user, removeNumber;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      user = context.options.getUser('user') || context.user;
      removeNumber = context.options.getInteger('remove');
    } else {
      user = context.mentions.users.first() || context.author;
      removeNumber = args[1] ? parseInt(args[1]) : null;
    }

    const warnings = loadWarnings();
    const userWarnings = warnings[user.id] || [];

    // === REMOVE MODE ===
    if (removeNumber !== null && removeNumber !== undefined) {
      if (!context.isChatInputCommand?.() && !context.member.permissions.has('ModerateMembers')) {
        return context.reply('You do not have permission to remove warnings!');
      }

      if (userWarnings.length === 0) {
        const msg = `**${user.tag}** has no warnings to remove.`;
        return context.isChatInputCommand?.()
          ? context.reply({ content: msg, ephemeral: true })
          : context.reply(msg);
      }

      if (removeNumber < 1 || removeNumber > userWarnings.length) {
        const msg = `Invalid number. **${user.tag}** has ${userWarnings.length} warning(s).`;
        return context.isChatInputCommand?.()
          ? context.reply({ content: msg, ephemeral: true })
          : context.reply(msg);
      }

      const removed = userWarnings.splice(removeNumber - 1, 1)[0];
      warnings[user.id] = userWarnings;
      saveWarnings(warnings);

      const msg = `Removed warning **#${removeNumber}** from **${user.tag}**.\nReason was: ${removed.reason}`;

      if (context.isChatInputCommand && context.isChatInputCommand()) {
        return context.reply(msg);
      }
      return context.reply(msg);
    }

    // === SHOW MODE ===
    if (userWarnings.length === 0) {
      const msg = `**${user.tag}** has no warnings.`;
      return context.isChatInputCommand?.()
        ? context.reply(msg)
        : context.reply(msg);
    }

    const list = userWarnings
      .map((w, i) => `**${i + 1}.** ${w.reason} — by ${w.moderator}`)
      .join('\n');
    const msg = `**${user.tag}** has ${userWarnings.length} warning(s):\n${list}`;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      await context.reply(msg);
    } else {
      context.reply(msg);
    }
  },
};
