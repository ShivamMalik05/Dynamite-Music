const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
} = require('discord.js');
const emojis = require('../../emojis/emojis');

function makeSep() {
  try {
    const sep = new SeparatorBuilder();
    if (typeof sep.setSpacing === 'function') sep.setSpacing(1);
    if (typeof sep.setDivider === 'function') sep.setDivider(true);
    return sep;
  } catch {
    return { type: 14, divider: true, spacing: 1 };
  }
}

module.exports = {
  name: 'say',
  description: 'Make the bot say something',
  category: 'Fun',
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Make the bot say something')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to say')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send to (defaults to current)')
        .setRequired(false)),

  async execute(context, args) {
    const isSlash = context.isChatInputCommand && context.isChatInputCommand();
    let text, channel;

    if (isSlash) {
      text = context.options.getString('text');
      channel = context.options.getChannel('channel') || context.channel;
    } else {
      // Delete user's message
      setTimeout(() => context.delete().catch(() => {}), 500);

      text = args.join(' ');
      channel = context.channel;

      if (!text) {
        const msg = await context.reply(`${emojis.error} Provide some text!`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
        return;
      }
    }

    // Send message (no embed, just plain text)
    await channel.send(text);
  },
};
