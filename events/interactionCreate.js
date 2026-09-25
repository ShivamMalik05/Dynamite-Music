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
          console.error(error);
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Error!', ephemeral: true });
          } else {
            await interaction.reply({ content: 'Error!', ephemeral: true });
          }
        }
        return;
      }

      if (interaction.isButton()) {
        if (setlog.isSetlogButton(interaction.customId)) return await setlog.handleButton(interaction);
        if (embedbuilder.isEmbedButton(interaction.customId)) return await embedbuilder.handleButton(interaction, client);
      }

      if (interaction.isChannelSelectMenu()) {
        if (setlog.isSetlogChannel(interaction.customId)) return await setlog.handleChannelSelect(interaction);
      }

      if (interaction.isModalSubmit()) {
        if (embedbuilder.isEmbedModal(interaction.customId)) return await embedbuilder.handleModal(interaction, client);
      }
    } catch (error) {
      console.error('Interaction error:', error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: `Error: ${error.message}`, ephemeral: true });
        }
      } catch (e) {}
    }
  },
};
