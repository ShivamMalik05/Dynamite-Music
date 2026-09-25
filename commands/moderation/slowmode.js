const emojis = require('../../emojis/emojis');

module.exports = {
  name: 'slowmode',
  description: 'Set channel slowmode',
  async execute(message, args) {
    if (!message.member.permissions.has('ManageChannels')) {
      return message.reply(`${emojis.error} You do not have permission!`);
    }

    const seconds = parseInt(args[0]);
    if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
      return message.reply(`${emojis.error} Provide seconds between 0 and 21600 (6 hours).`);
    }

    try {
      await message.channel.setRateLimitPerUser(seconds);
      if (seconds === 0) {
        message.reply(`${emojis.success} Slowmode disabled.`);
      } else {
        message.reply(`${emojis.success} Slowmode set to **${seconds}** second(s).`);
      }
    } catch (error) {
      console.error(error);
      message.reply(`${emojis.error} Failed to set slowmode.`);
    }
  },
};
