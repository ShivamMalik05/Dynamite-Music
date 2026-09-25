const emojis = require('../../emojis/emojis');

module.exports = {
  name: 'nickname',
  description: 'Change a user nickname',
  async execute(message, args) {
    if (!message.member.permissions.has('ManageNicknames')) {
      return message.reply(`${emojis.error} You do not have permission!`);
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply(`${emojis.error} Mention a user!`);

    const nickname = args.slice(1).join(' ');
    if (!nickname) return message.reply(`${emojis.error} Provide a nickname!`);

    try {
      await member.setNickname(nickname);
      message.reply(`${emojis.success} Changed **${member.user.tag}** nickname to **${nickname}**.`);
    } catch (error) {
      console.error(error);
      message.reply(`${emojis.error} Failed to change nickname.`);
    }
  },
};
