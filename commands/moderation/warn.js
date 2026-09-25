const emojis = require('../../emojis/emojis');
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
  async execute(message, args) {
    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply(`${emojis.error} You do not have permission!`);
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply(`${emojis.error} Mention a user to warn!`);
    if (member.id === message.author.id) return message.reply(`${emojis.error} You cannot warn yourself!`);

    const reason = args.slice(1).join(' ') || 'No reason provided';

    const warnings = loadWarnings();
    if (!warnings[member.id]) warnings[member.id] = [];
    warnings[member.id].push({
      reason,
      moderator: message.author.tag,
      date: new Date().toISOString(),
    });
    saveWarnings(warnings);

    message.reply(`${emojis.warn} Warned **${member.user.tag}**. Reason: ${reason} (Total: ${warnings[member.id].length})`);
  },
};
