const emojis = require('../../emojis/emojis');

module.exports = {
  name: 'say',
  description: 'Make the bot say something',
  async execute(message, args) {
    const text = args.join(' ');
    if (!text) {
      return message.reply(`${emojis.error} Provide some text!`);
    }

    try {
      await message.delete().catch(() => {});
      message.channel.send(text);
    } catch (error) {
      console.error(error);
      message.reply(`${emojis.error} Failed to send message.`);
    }
  },
};
