const core = require('../core');

module.exports = {
  // Handle slash command execution
  async handleCommand(interaction, client) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Permission check
    const level = core.permissions.getLevel(interaction.member);
    if (command.ownerOnly && level !== 'owner') {
      return interaction.reply({
        embeds: [core.embeds.error('This command is only available to **Owner**.')],
        ephemeral: true,
      });
    }
    if (command.adminOnly && !['owner', 'admin'].includes(level)) {
      return interaction.reply({
        embeds: [core.embeds.error('This command is only available to **Admin**.')],
        ephemeral: true,
      });
    }
    if (command.modOnly && !['owner', 'admin', 'moderator'].includes(level)) {
      return interaction.reply({
        embeds: [core.embeds.error('This command is only available to **Moderator**.')],
        ephemeral: true,
      });
    }

    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error(`[InteractionHandler] ${interaction.commandName}:`, err);
      const msg = { embeds: [core.embeds.error('An error occurred while running this command.')], ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(msg).catch(() => null);
      } else {
        await interaction.reply(msg).catch(() => null);
      }
    }
  },

  // Handle button interactions
  async handleButton(interaction, client) {
    const [prefix, ...args] = interaction.customId.split(':');
    const handler = client.buttons?.get(prefix);
    if (!handler) return;

    try {
      await handler.execute(interaction, args, client);
    } catch (err) {
      console.error(`[ButtonHandler] ${prefix}:`, err);
      await interaction.reply({
        embeds: [core.embeds.error('Button error.')],
        ephemeral: true,
      }).catch(() => null);
    }
  },

  // Handle select menu interactions
  async handleSelect(interaction, client) {
    const [prefix, ...args] = interaction.customId.split(':');
    const handler = client.selects?.get(prefix);
    if (!handler) return;

    try {
      await handler.execute(interaction, args, client);
    } catch (err) {
      console.error(`[SelectHandler] ${prefix}:`, err);
      await interaction.reply({
        embeds: [core.embeds.error('Select menu error.')],
        ephemeral: true,
      }).catch(() => null);
    }
  },

  // Handle modal submissions
  async handleModal(interaction, client) {
    const [prefix, ...args] = interaction.customId.split(':');
    const handler = client.modals?.get(prefix);
    if (!handler) return;

    try {
      await handler.execute(interaction, args, client);
    } catch (err) {
      console.error(`[ModalHandler] ${prefix}:`, err);
      await interaction.reply({
        embeds: [core.embeds.error('Modal error.')],
        ephemeral: true,
      }).catch(() => null);
    }
  },
};
