const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'unlock',
  description: 'Unlock a channel',
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(context) {
    if (!context.isChatInputCommand?.() && !context.member.permissions.has('ManageChannels')) {
      return context.reply('You do not have permission!');
    }

    await context.channel.permissionOverwrites.edit(context.guild.roles.everyone, {
      SendMessages: null,
    });

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      await context.reply('Channel unlocked.');
    } else {
      context.reply('Channel unlocked.');
    }
  },
};
