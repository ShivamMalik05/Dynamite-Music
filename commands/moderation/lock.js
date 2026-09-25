const emojis = require('../../emojis/emojis');

module.exports = {
  name: 'lock',
  description: 'Lock a channel',
  async execute(message) {
    if (!message.member.permissions.has('ManageChannels')) {
      return message.reply(`${emojis.error} You do not have permission!`);
    }

    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false,
      });
      message.reply(`${emojis.success} Channel locked.`);
    } catch (error) {
      console.error(error);
      message.reply(`${emojis.error} Failed to lock channel.`);
    }
  },
};
