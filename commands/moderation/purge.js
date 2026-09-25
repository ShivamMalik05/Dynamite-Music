const emojis = require('../../emojis/emojis');

module.exports = {
  name: 'purge',
  description: 'Delete messages',
  async execute(message, args) {
    if (!message.member.permissions.has('ManageMessages')) {
      return message.reply(`${emojis.error} You do not have permission!`);
    }

    const amount = parseInt(args[0]);
    if (!amount || amount < 1 || amount > 100) {
      return message.reply(`${emojis.error} Provide a number between 1 and 100!`);
    }

    try {
      await message.channel.bulkDelete(amount, true);
      const reply = await message.reply(`${emojis.success} Deleted **${amount}** messages.`);
      setTimeout(() => reply.delete().catch(() => {}), 3000);
    } catch (error) {
      console.error(error);
      message.reply(`${emojis.error} Failed to delete messages. Messages may be older than 14 days.`);
    }
  },
};
