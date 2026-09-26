const { SlashCommandBuilder, ChannelType } = require('discord.js');
const core = require('../../core');
const logConfig = require('../../config/logs');

module.exports = {
  name: 'setlog',
  category: 'admin',
  adminOnly: true,
  data: new SlashCommandBuilder()
    .setName('setlog')
    .setDescription('Configure log channels')
    .addStringOption(opt =>
      opt.setName('type')
        .setDescription('Log type to configure')
        .setRequired(true)
        .addChoices(
          { name: 'Moderation', value: 'moderation' },
          { name: 'Warn', value: 'warn' },
          { name: 'Auto-Action', value: 'autoaction' },
          { name: 'Lock', value: 'lock' },
          { name: 'Messages', value: 'messages' },
          { name: 'Members', value: 'members' },
          { name: 'Channels', value: 'channels' },
          { name: 'Roles', value: 'roles' },
          { name: 'Voice', value: 'voice' },
          { name: 'Server', value: 'server' },
          { name: 'NOP', value: 'nop' },
          { name: 'Music', value: 'music' }
        )
    )
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Channel to send logs to')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const type = interaction.options.getString('type');
    const channel = interaction.options.getChannel('channel');

    logConfig.channels[type] = channel.id;
    core.config.logs.channels[type] = channel.id;

    await interaction.reply({
      embeds: [core.embeds.success(`**${type}** logs will now be sent to ${channel}.`)],
      ephemeral: true,
    });
  },
};
