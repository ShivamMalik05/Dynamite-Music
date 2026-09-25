const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'lock',
  description: 'Lock a channel',
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(context) {
    if (!context.isChatInputCommand?.() && !context.member.permissions.has('ManageChannels')) {
      return context.reply('You do not have permission!');
    }

    await context.channel.permissionOverwrites.edit(context.guild.roles.everyone, {
      SendMessages: false,
    });

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      await context.reply('Channel locked.');
    } else {
      context.reply('Channel locked.');
    }
  },
};
