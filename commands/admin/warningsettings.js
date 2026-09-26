const { SlashCommandBuilder } = require('discord.js');
const core = require('../../core');
const warningConfig = require('../../config/warnings');

module.exports = {
  name: 'warningsettings',
  category: 'admin',
  adminOnly: true,
  data: new SlashCommandBuilder()
    .setName('warningsettings')
    .setDescription('Configure warning system settings')
    .addSubcommand(sub =>
      sub.setName('view').setDescription('View current warning settings')
    )
    .addSubcommand(sub =>
      sub.setName('decay').setDescription('Configure warning decay')
        .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable decay').setRequired(true))
        .addIntegerOption(opt => opt.setName('days').setDescription('Days before decay').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('autodelete').setDescription('Auto-delete old warnings')
        .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable auto-delete').setRequired(true))
        .addIntegerOption(opt => opt.setName('days').setDescription('Days after which warnings delete').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('silentmode').setDescription('Toggle silent mode (no DM to user)')
        .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable silent mode').setRequired(true))
    ),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'view') {
      const embed = core.embeds.info([
        `**Decay:** ${warningConfig.decay.enabled ? '✅' : '❌'} (${warningConfig.decay.days} days, factor ${warningConfig.decay.factor})`,
        `**Auto-Delete:** ${warningConfig.autoDelete.enabled ? '✅' : '❌'} (${warningConfig.autoDelete.days} days)`,
        `**Notify:** ${warningConfig.notify.enabled ? '✅' : '❌'}`,
        `**Silent Mode:** ${warningConfig.silentMode ? '✅' : '❌'}`,
        `**Rules:** ${warningConfig.rules.length}`,
      ].join('\n'), 'Warning Settings');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'decay') {
      warningConfig.decay.enabled = interaction.options.getBoolean('enabled');
      const days = interaction.options.getInteger('days');
      if (days) warningConfig.decay.days = days;
      return interaction.reply({
        embeds: [core.embeds.success(`Warning decay is now **${warningConfig.decay.enabled ? 'enabled' : 'disabled'}**.`)],
        ephemeral: true,
      });
    }

    if (sub === 'autodelete') {
      warningConfig.autoDelete.enabled = interaction.options.getBoolean('enabled');
      const days = interaction.options.getInteger('days');
      if (days) warningConfig.autoDelete.days = days;
      return interaction.reply({
        embeds: [core.embeds.success(`Auto-delete is now **${warningConfig.autoDelete.enabled ? 'enabled' : 'disabled'}**.`)],
        ephemeral: true,
      });
    }

    if (sub === 'silentmode') {
      warningConfig.silentMode = interaction.options.getBoolean('enabled');
      return interaction.reply({
        embeds: [core.embeds.success(`Silent mode is now **${warningConfig.silentMode ? 'enabled' : 'disabled'}**.`)],
        ephemeral: true,
      });
    }
  },
};
