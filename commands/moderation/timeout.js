const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'timeout',
  description: 'Timeout a user',
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to timeout')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('minutes')
        .setDescription('Duration in minutes (1-10080)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for timeout')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(context, args) {
    let member, minutes, reason;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      const user = context.options.getUser('user');
      member = await context.guild.members.fetch(user.id);
      minutes = context.options.getInteger('minutes');
      reason = context.options.getString('reason') || 'No reason provided';
    } else {
      if (!context.member.permissions.has('ModerateMembers')) {
        return context.reply('You do not have permission!');
      }
      member = context.mentions.members.first();
      if (!member) return context.reply('Mention a user to timeout!');
      minutes = parseInt(args[1]);
      reason = args.slice(2).join(' ') || 'No reason provided';
    }

    if (!member.moderatable) {
      const msg = 'Cannot timeout this user!';
      return context.isChatInputCommand?.()
        ? context.reply({ content: msg, ephemeral: true })
        : context.reply(msg);
    }

    if (!minutes || minutes < 1 || minutes > 10080) {
      const msg = 'Minutes must be between 1 and 10080 (7 days).';
      return context.isChatInputCommand?.()
        ? context.reply({ content: msg, ephemeral: true })
        : context.reply(msg);
    }

    await member.timeout(minutes * 60 * 1000, reason);
    const msg = `Timed out **${member.user.tag}** for **${minutes}** minute(s). Reason: ${reason}`;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      await context.reply(msg);
    } else {
      context.reply(msg);
    }
  },
};
