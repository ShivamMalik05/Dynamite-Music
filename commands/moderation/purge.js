const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'purge',
  description: 'Delete messages',
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete messages')
    .addIntegerOption(option =>
      option.setName('amount').setDescription('Number of messages (1-100)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(context, args) {
    let amount;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      amount = context.options.getInteger('amount');
      if (amount < 1 || amount > 100) {
        return context.reply({ content: 'Provide a number between 1 and 100!', ephemeral: true });
      }
      await context.channel.bulkDelete(amount, true);
      await context.reply({ content: `Deleted **${amount}** messages.`, ephemeral: true });
    } else {
      if (!context.member.permissions.has('ManageMessages')) {
        return context.reply('You do not have permission!');
      }
      amount = parseInt(args[0]);
      if (!amount || amount < 1 || amount > 100) {
        return context.reply('Provide a number between 1 and 100!');
      }
      await context.channel.bulkDelete(amount, true);
      const reply = await context.reply(`Deleted **${amount}** messages.`);
      setTimeout(() => reply.delete().catch(() => {}), 3000);
    }
  },
};
