const setlog = require('../interactions/setlog');
const embedbuilder = require('../interactions/embedbuilder');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    try {
      // ===== SLASH COMMANDS =====
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

      // ===== BUTTONS =====
      if (interaction.isButton()) {
        // Role buttons (embed ke saath aaye buttons — add/remove/toggle role)
        if (embedbuilder.isRoleButton(interaction.customId)) {
          return await embedbuilder.handleRoleButton(interaction);
        }
        // Setlog buttons
        if (setlog.isSetlogButton(interaction.customId)) {
          return await setlog.handleButton(interaction);
        }
        // Embed builder buttons
        if (embedbuilder.isEmbedButton(interaction.customId)) {
          return await embedbuilder.handleButton(interaction, client);
        }
      }

      // ===== CHANNEL SELECT MENU =====
      if (interaction.isChannelSelectMenu()) {
        if (setlog.isSetlogChannel(interaction.customId)) {
          return await setlog.handleChannelSelect(interaction);
        }
      }

      // ===== MODALS =====
      if (interaction.isModalSubmit()) {
        if (embedbuilder.isEmbedModal(interaction.customId)) {
          return await embedbuilder.handleModal(interaction, client);
        }
      }
    } catch (error) {
      console.error('Interaction error:', error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: `Error: ${error.message}`, ephemeral: true });
        } else {
          await interaction.followUp({ content: `Error: ${error.message}`, ephemeral: true });
        }
      } catch (e) {
        console.error('Failed to reply:', e);
      }
    }
  },
};
