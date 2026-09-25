const emojis = require('../../emojis/emojis');

module.exports = {
  name: 'unlock',
  description: 'Unlock a channel',
  async execute(message) {
    if (!message.member.permissions.has('ManageChannels')) {
      return message.reply(`${emojis.error} You do not have permission!`);
    }

    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: null,
      });
      message.reply(`${emojis.success} Channel unlocked.`);
    } catch (error) {
      console.error(error);
      message.reply(`${emojis.error} Failed to unlock channel.`);
    }
  },
};
