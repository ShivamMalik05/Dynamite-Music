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
        if (embedbuilder.isRoleButton(interaction.customId)) return await embedbuilder.handleRoleButton(interaction);
        if (setlog.isSetlogButton(interaction.customId)) return await setlog.handleButton(interaction);
        if (embedbuilder.isEmbedButton(interaction.customId)) return await embedbuilder.handleButton(interaction, client);
      }

      if (interaction.isStringSelectMenu()) {
        if (setlog.isSetlogSelect(interaction.customId)) return await setlog.handleSelect(interaction);
        if (embedbuilder.isEmbedSelect(interaction.customId)) return await embedbuilder.handleSelect(interaction, client);
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
