const emojis = require('../../emojis/emojis');
const fs = require('fs');
const path = require('path');

const warningsPath = path.join(__dirname, '..', '..', 'data', 'warnings.json');

module.exports = {
  name: 'warnings',
  description: 'Show user warnings',
  async execute(message) {
    const user = message.mentions.users.first() || message.author;

    if (!fs.existsSync(warningsPath)) {
      return message.reply(`${emojis.info} **${user.tag}** has no warnings.`);
    }

    const warnings = JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
    const userWarnings = warnings[user.id] || [];

    if (userWarnings.length === 0) {
      return message.reply(`${emojis.info} **${user.tag}** has no warnings.`);
    }

    const list = userWarnings
      .map((w, i) => `**${i + 1}.** ${w.reason} — by ${w.moderator}`)
      .join('\n');

    message.reply(`${emojis.warn} **${user.tag}** has ${userWarnings.length} warning(s):\n${list}`);
  },
};
