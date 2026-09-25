const setlog = require('../interactions/setlog');
const embedbuilder = require('../interactions/embedbuilder');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    // ===== SLASH COMMANDS =====
    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
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
      if (setlog.isSetlogButton(interaction.customId)) {
        await setlog.handleButton(interaction);
        return;
      }
      if (embedbuilder.isEmbedButton(interaction.customId)) {
        await embedbuilder.handleButton(interaction, client);
        return;
      }
    }

    // ===== CHANNEL SELECT =====
    if (interaction.isChannelSelectMenu()) {
      if (setlog.isSetlogChannel(interaction.customId)) {
        await setlog.handleChannelSelect(interaction);
        return;
      }
    }

    // ===== MODALS =====
    if (interaction.isModalSubmit()) {
      if (embedbuilder.isEmbedModal(interaction.customId)) {
        await embedbuilder.handleModal(interaction, client);
        return;
      }
    }
  },
};
