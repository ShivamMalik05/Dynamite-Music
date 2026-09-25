const emojis = require('../../emojis/emojis');

module.exports = {
  name: 'unmute',
  description: 'Unmute a user',
  async execute(message, args) {
    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply(`${emojis.error} You do not have permission!`);
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply(`${emojis.error} Mention a user to unmute!`);

    try {
      await member.timeout(null);
      message.reply(`${emojis.success} Unmuted **${member.user.tag}**.`);
    } catch (error) {
      console.error(error);
      message.reply(`${emojis.error} Failed to unmute this user.`);
    }
  },
};
