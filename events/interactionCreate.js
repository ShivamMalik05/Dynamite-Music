const interactionHandler = require('../handlers/interactionHandler');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {
    try {
      // Slash command
      if (interaction.isChatInputCommand()) {
        return interactionHandler.handleCommand(interaction, client);
      }

      // Button
      if (interaction.isButton()) {
        return interactionHandler.handleButton(interaction, client);
      }

      // Select menu (String, User, Role, Channel, Mentionable)
      if (interaction.isAnySelectMenu()) {
        return interactionHandler.handleSelect(interaction, client);
      }

      // Modal submit
      if (interaction.isModalSubmit()) {
        return interactionHandler.handleModal(interaction, client);
      }

      // Autocomplete
      if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (command && command.autocomplete) {
          await command.autocomplete(interaction, client);
        }
        return;
      }
    } catch (err) {
      console.error('[InteractionCreate]', err);

      const errorMsg = {
        embeds: [require('../core').embeds.error('An unexpected error occurred.')],
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMsg).catch(() => null);
      } else {
        await interaction.reply(errorMsg).catch(() => null);
      }
    }
  },
};
