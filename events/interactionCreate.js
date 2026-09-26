const setlog = require('../interactions/setlog');
const embedbuilder = require('../interactions/embedbuilder');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;
        try {
          await command.execute(interaction);
        } catch (error) {
          console.error('Slash error:', error);
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Something went wrong!', ephemeral: true });
          } else {
            await interaction.reply({ content: 'Something went wrong!', ephemeral: true });
          }
        }
        return;
      }

      if (interaction.isButton()) {
        // Warning history pagination
        if (interaction.customId.startsWith('warnhistory_')) {
          const warning = client.slashCommands.get('warning');
          if (warning && warning.handleButton) return await warning.handleButton(interaction, client);
        }

        // Autoaction
        if (interaction.customId.startsWith('aa_')) {
          const autoaction = client.slashCommands.get('autoaction');
          if (autoaction && autoaction.handleButton) return await autoaction.handleButton(interaction, client);
        }

        // Warnlogs
        if (interaction.customId.startsWith('warnlogs_')) {
          const warnlogs = client.slashCommands.get('warnlogs');
          if (warnlogs && warnlogs.handleButton) return await warnlogs.handleButton(interaction, client);
        }

        // setperm
        if (interaction.customId.startsWith('sp_')) {
          const setperm = client.slashCommands.get('setperm');
          if (setperm && setperm
