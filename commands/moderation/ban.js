const emojis = require('../../emojis/emojis');

module.exports = {
  name: 'ban',
  description: 'Ban a user',
  async execute(message, args) {
    if (!message.member.permissions.has('BanMembers')) {
      return message.reply(`${emojis.error} You do not have permission!`);
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply(`${emojis.error} Mention a user to ban!`);
    }

    if (!member.bannable) {
      return message.reply(`${emojis.error} Cannot ban this user!`);
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await member.ban({ reason });
      message.reply(`${emojis.success} Banned **${member.user.tag}**. Reason: ${reason}`);
    } catch (error) {
      console.error(error);
      message.reply(`${emojis.error} Failed to ban this user.`);
    }
  },
};
