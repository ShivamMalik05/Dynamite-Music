const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Ban a user',
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(context, args) {
    if (context.isChatInputCommand && context.isChatInputCommand()) {
      const user = context.options.getUser('user');
      const reason = context.options.getString('reason') || 'No reason provided';
      const member = await context.guild.members.fetch(user.id);

      if (!member.bannable) {
        return context.reply({ content: 'Cannot ban this user!', ephemeral: true });
      }
      await member.ban({ reason });
      await context.reply(`Banned **${user.tag}**. Reason: ${reason}`);
    } else {
      if (!context.member.permissions.has('BanMembers')) {
        return context.reply('You do not have permission!');
      }
      const member = context.mentions.members.first();
      if (!member) return context.reply('Mention a user to ban!');
      if (!member.bannable) return context.reply('Cannot ban this user!');
      const reason = args.slice(1).join(' ') || 'No reason provided';
      await member.ban({ reason });
      context.reply(`Banned **${member.user.tag}**. Reason: ${reason}`);
    }
  },
};
