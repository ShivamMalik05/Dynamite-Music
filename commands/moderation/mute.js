const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'mute',
  description: 'Mute a user (timeout)',
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a user (timeout)')
    .addUserOption(option =>
      option.setName('user').setDescription('User to mute').setRequired(true))
    .addIntegerOption(option =>
      option.setName('minutes').setDescription('Duration in minutes').setRequired(false))
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(context, args) {
    let member, minutes, reason;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      const user = context.options.getUser('user');
      member = await context.guild.members.fetch(user.id);
      minutes = context.options.getInteger('minutes') || 10;
      reason = context.options.getString('reason') || 'No reason provided';
    } else {
      if (!context.member.permissions.has('ModerateMembers')) {
        return context.reply('You do not have permission!');
      }
      member = context.mentions.members.first();
      if (!member) return context.reply('Mention a user to mute!');
      minutes = parseInt(args[1]) || 10;
      reason = args.slice(2).join(' ') || 'No reason provided';
    }

    if (!member.moderatable) {
      return context.isChatInputCommand?.() 
        ? context.reply({ content: 'Cannot mute this user!', ephemeral: true })
        : context.reply('Cannot mute this user!');
    }
    if (minutes < 1 || minutes > 10080) {
      return context.isChatInputCommand?.()
        ? context.reply({ content: 'Minutes must be 1-10080.', ephemeral: true })
        : context.reply('Minutes must be 1-10080.');
    }

    await member.timeout(minutes * 60 * 1000, reason);
    const msg = `Muted **${member.user.tag}** for **${minutes}** minute(s). Reason: ${reason}`;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      await context.reply(msg);
    } else {
      context.reply(msg);
    }
  },
};
