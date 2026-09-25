const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const warningsPath = path.join(__dirname, '..', '..', 'data', 'warnings.json');

module.exports = {
  name: 'warnings',
  description: 'Show user warnings',
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Show user warnings')
    .addUserOption(option =>
      option.setName('user').setDescription('User to check').setRequired(false)),

  async execute(context) {
    let user;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      user = context.options.getUser('user') || context.user;
    } else {
      user = context.mentions.users.first() || context.author;
    }

    if (!fs.existsSync(warningsPath)) {
      const msg = `**${user.tag}** has no warnings.`;
      return context.isChatInputCommand?.() ? context.reply(msg) : context.reply(msg);
    }

    const warnings = JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
    const userWarnings = warnings[user.id] || [];

    let content;
    if (userWarnings.length === 0) {
      content = `**${user.tag}** has no warnings.`;
    } else {
      const list = userWarnings.map((w, i) => `**${i + 1}.** ${w.reason} — by ${w.moderator}`).join('\n');
      content = `**${user.tag}** has ${userWarnings.length} warning(s):\n${list}`;
    }

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      await context.reply(content);
    } else {
      context.reply(content);
    }
  },
};
