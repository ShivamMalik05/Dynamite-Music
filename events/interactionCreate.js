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
        if (embedbuilder.isRoleButton(interaction.customId)) {
          return await embedbuilder.handleRoleButton(interaction);
        }
        if (setlog.isSetlogButton(interaction.customId)) {
          return await setlog.handleButton(interaction, client);
        }
        if (embedbuilder.isEmbedButton(interaction.customId)) {
          return await embedbuilder.handleButton(interaction, client);
        }
        if (interaction.customId.startsWith('sp_')) {
          const setperm = client.slashCommands.get('setperm');
          if (setperm && setperm.handleButton) {
            return await setperm.handleButton(interaction, client);
          }
        }
      }

      // ===== STRING SELECT MENUS =====
      if (interaction.isStringSelectMenu()) {
        if (setlog.isSetlogSelect(interaction.customId)) {
          return await setlog.handleSelect(interaction);
        }
        if (embedbuilder.isEmbedSelect(interaction.customId)) {
          return await embedbuilder.handleSelect(interaction, client);
        }
      }

      // ===== USER / ROLE SELECT MENUS =====
      if (interaction.isUserSelectMenu() || interaction.isRoleSelectMenu()) {
        if (interaction.customId.startsWith('sp_select_')) {
          const setperm = client.slashCommands.get('setperm');
          if (setperm && setperm.handleSelect) {
            return await setperm.handleSelect(interaction, client);
          }
        }
      }

      // ===== CHANNEL SELECT MENUS =====
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
        }
      } catch (e) {}
    }
  },
};
