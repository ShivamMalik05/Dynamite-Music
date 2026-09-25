const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'say',
  description: 'Make the bot say something',
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Make the bot say something')
    .addStringOption(option =>
      option.setName('text').setDescription('Text to say').setRequired(true)),

  async execute(context, args) {
    let text;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      text = context.options.getString('text');
      await context.reply(text);
    } else {
      text = args.join(' ');
      if (!text) return context.reply('Provide some text!');
      await context.delete().catch(() => {});
      context.channel.send(text);
    }
  },
};
