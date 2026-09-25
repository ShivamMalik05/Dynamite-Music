const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'unmute',
  description: 'Unmute a user',
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User to unmute').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(context) {
    let member;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      const user = context.options.getUser('user');
      member = await context.guild.members.fetch(user.id);
    } else {
      if (!context.member.permissions.has('ModerateMembers')) {
        return context.reply('You do not have permission!');
      }
      member = context.mentions.members.first();
      if (!member) return context.reply('Mention a user to unmute!');
    }

    await member.timeout(null);
    const msg = `Unmuted **${member.user.tag}**.`;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      await context.reply(msg);
    } else {
      context.reply(msg);
    }
  },
};
