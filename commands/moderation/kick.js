const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'kick',
  description: 'Kick a user',
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(context, args) {
    if (context.isChatInputCommand && context.isChatInputCommand()) {
      const user = context.options.getUser('user');
      const reason = context.options.getString('reason') || 'No reason provided';
      const member = await context.guild.members.fetch(user.id);

      if (!member.kickable) {
        return context.reply({ content: 'Cannot kick this user!', ephemeral: true });
      }
      await member.kick(reason);
      await context.reply(`Kicked **${user.tag}**. Reason: ${reason}`);
    } else {
      if (!context.member.permissions.has('KickMembers')) {
        return context.reply('You do not have permission!');
      }
      const member = context.mentions.members.first();
      if (!member) return context.reply('Mention a user to kick!');
      if (!member.kickable) return context.reply('Cannot kick this user!');
      const reason = args.slice(1).join(' ') || 'No reason provided';
      await member.kick(reason);
      context.reply(`Kicked **${member.user.tag}**. Reason: ${reason}`);
    }
  },
};
