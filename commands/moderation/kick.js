const emojis = require('../../emojis/emojis');

module.exports = {
  name: 'kick',
  description: 'Kick a user',
  async execute(message, args) {
    if (!message.member.permissions.has('KickMembers')) {
      return message.reply(`${emojis.error} You do not have permission!`);
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply(`${emojis.error} Mention a user to kick!`);
    }

    if (!member.kickable) {
      return message.reply(`${emojis.error} Cannot kick this user!`);
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await member.kick(reason);
      message.reply(`${emojis.success} Kicked **${member.user.tag}**. Reason: ${reason}`);
    } catch (error) {
      console.error(error);
      message.reply(`${emojis.error} Failed to kick this user.`);
    }
  },
};
