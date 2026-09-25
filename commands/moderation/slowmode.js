const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'slowmode',
  description: 'Set channel slowmode',
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set channel slowmode')
    .addIntegerOption(option =>
      option.setName('seconds').setDescription('Seconds (0-21600)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(context, args) {
    let seconds;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      seconds = context.options.getInteger('seconds');
    } else {
      if (!context.member.permissions.has('ManageChannels')) {
        return context.reply('You do not have permission!');
      }
      seconds = parseInt(args[0]);
    }

    if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
      const msg = 'Provide seconds between 0 and 21600.';
      return context.isChatInputCommand?.()
        ? context.reply({ content: msg, ephemeral: true })
        : context.reply(msg);
    }

    await context.channel.setRateLimitPerUser(seconds);
    const msg = seconds === 0 ? 'Slowmode disabled.' : `Slowmode set to **${seconds}** second(s).`;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      await context.reply(msg);
    } else {
      context.reply(msg);
    }
  },
};
