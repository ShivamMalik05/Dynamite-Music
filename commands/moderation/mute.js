const emojis = require('../../emojis/emojis');

module.exports = {
  name: 'mute',
  description: 'Mute a user (timeout)',
  async execute(message, args) {
    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply(`${emojis.error} You do not have permission!`);
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply(`${emojis.error} Mention a user to mute!`);
    if (!member.moderatable) return message.reply(`${emojis.error} Cannot mute this user!`);

    const minutes = parseInt(args[1]) || 10;
    if (minutes < 1 || minutes > 10080) {
      return message.reply(`${emojis.error} Provide minutes between 1 and 10080 (7 days).`);
    }

    const reason = args.slice(2).join(' ') || 'No reason provided';

    try {
      await member.timeout(minutes * 60 * 1000, reason);
      message.reply(`${emojis.mute} Muted **${member.user.tag}** for **${minutes}** minute(s). Reason: ${reason}`);
    } catch (error) {
      console.error(error);
      message.reply(`${emojis.error} Failed to mute this user.`);
    }
  },
};
