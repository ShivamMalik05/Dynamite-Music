const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'nickname',
  description: 'Change a user nickname',
  data: new SlashCommandBuilder()
    .setName('nickname')
    .setDescription('Change a user nickname')
    .addUserOption(option =>
      option.setName('user').setDescription('User').setRequired(true))
    .addStringOption(option =>
      option.setName('nickname').setDescription('New nickname').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

  async execute(context, args) {
    let member, nickname;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      const user = context.options.getUser('user');
      member = await context.guild.members.fetch(user.id);
      nickname = context.options.getString('nickname');
    } else {
      if (!context.member.permissions.has('ManageNicknames')) {
        return context.reply('You do not have permission!');
      }
      member = context.mentions.members.first();
      if (!member) return context.reply('Mention a user!');
      nickname = args.slice(1).join(' ');
      if (!nickname) return context.reply('Provide a nickname!');
    }

    await member.setNickname(nickname);
    const msg = `Changed **${member.user.tag}** nickname to **${nickname}**.`;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      await context.reply(msg);
    } else {
      context.reply(msg);
    }
  },
};
