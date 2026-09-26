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
        const id = interaction.customId;

        // Warning Manager buttons (warn_*)
        if (id.startsWith('warn_') && !id.startsWith('warnlogs_')) {
          const warning = client.slashCommands.get('warning');
          if (warning && warning.handleButton) {
            const handled = await warning.handleButton(interaction, client);
            if (handled) return;
          }
        }

        // Warnlogs buttons
        if (id.startsWith('warnlogs_')) {
          const warnlogs = client.slashCommands.get('warnlogs');
          if (warnlogs && warnlogs.handleButton) {
            const handled = await warnlogs.handleButton(interaction, client);
            if (handled) return;
          }
        }

        // Autoaction buttons
        if (id.startsWith('aa_')) {
          const autoaction = client.slashCommands.get('autoaction');
          if (autoaction && autoaction.handleButton) {
            const handled = await autoaction.handleButton(interaction, client);
            if (handled) return;
          }
        }

        // Serverinfo buttons
        if (id.startsWith('si_')) {
          const serverinfo = client.slashCommands.get('serverinfo');
          if (serverinfo && serverinfo.handleButton) {
            const handled = await serverinfo.handleButton(interaction, client);
            if (handled) return;
          }
        }

        // Stats buttons
        if (id.startsWith('stats_')) {
          const stats = client.slashCommands.get('stats');
          if (stats && stats.handleButton) {
            const handled = await stats.handleButton(interaction, client);
            if (handled) return;
          }
        }

        // Help buttons
        if (id.startsWith('help_')) {
          const help = client.slashCommands.get('help');
          if (help && help.handleButton) {
            const handled = await help.handleButton(interaction, client);
            if (handled) return;
          }
        }

        // Setperm buttons
        if (id.startsWith('sp_')) {
          const setperm = client.slashCommands.get('setperm');
          if (setperm && setperm.handleButton) {
            const handled = await setperm.handleButton(interaction, client);
            if (handled) return;
          }
        }

        // Embed builder role buttons
        if (embedbuilder.isRoleButton(id)) {
          return await embedbuilder.handleRoleButton(interaction);
        }

        // Setlog buttons
        if (setlog.isSetlogButton(id)) {
          return await setlog.handleButton(interaction, client);
        }

        // Embed builder buttons
        if (embedbuilder.isEmbedButton(id)) {
          return await embedbuilder.handleButton(interaction, client);
        }
      }

      // ===== STRING SELECT MENUS =====
      if (interaction.isStringSelectMenu()) {
        const id = interaction.customId;

        // Help menu
        if (id === 'help_menu') {
          const help = client.slashCommands.get('help');
          if (help && help.handleSelect) {
            const handled = await help.handleSelect(interaction, client);
            if (handled) return;
          }
        }

        // Setlog menus
        if (setlog.isSetlogSelect(id)) {
          return await setlog.handleSelect(interaction);
        }

        // Embed builder menus
        if (embedbuilder.isEmbedSelect(id)) {
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
        const id = interaction.customId;

        // Warning Manager modals
        if (id.startsWith('warn_modal_')) {
          const warning = client.slashCommands.get('warning');
          if (warning && warning.handleModal) {
            return await warning.handleModal(interaction, client);
          }
        }

        // Autoaction modals
        if (id.startsWith('aa_modal_')) {
          const autoaction = client.slashCommands.get('autoaction');
          if (autoaction && autoaction.handleModal) {
            return await autoaction.handleModal(interaction, client);
          }
        }

        // Embed builder modals
        if (embedbuilder.isEmbedModal(id)) {
          return await embedbuilder.handleModal(interaction, client);
        }
      }
    } catch (error) {
      console.error('Interaction error:', error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: `Error: ${error.message}`, ephemeral: true });
        }
      } catch (e) {
        console.error('Failed to reply:', e.message);
      }
    }
  },
};
