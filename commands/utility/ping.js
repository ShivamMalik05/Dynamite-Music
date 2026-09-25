const emojis = require('../../emojis/emojis');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  // Prefix command
  name: 'ping',
  description: 'Check bot latency',

  // Slash command
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency'),

  // Execute — handles both
  async execute(context, args) {
    if (context.isChatInputCommand && context.isChatInputCommand()) {
      // Slash command
      const sent = await context.reply({ content: 'Pinging...', fetchReply: true });
      const latency = sent.createdTimestamp - context.createdTimestamp;
      await context.editReply(`Pong! Latency: **${latency}ms**`);
    } else {
      // Prefix command
      const sent = await context.reply('Pinging...');
      const latency = sent.createdTimestamp - context.createdTimestamp;
      sent.edit(`Pong! Latency: **${latency}ms**`);
    }
  },
};
