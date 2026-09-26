const { SlashCommandBuilder } = require('discord.js');
const core = require('../../core');
const hybridHandler = require('../../handlers/hybridHandler');

module.exports = {
  name: 'reload',
  category: 'owner',
  ownerOnly: true,
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reload all commands and events'),

  async execute(interaction, client) {
    try {
      // Clear require cache for commands
      const commandsPath = require('path').join(__dirname, '..');
      for (const key of Object.keys(require.cache)) {
        if (key.startsWith(commandsPath)) {
          delete require.cache[key];
        }
      }

      // Reload commands
      hybridHandler.loadCommands(client);

      // Re-register slash commands
      const commands = [];
      for (const cmd of client.commands.values()) {
        if (cmd.data) commands.push(cmd.data.toJSON());
      }
      await client.application.commands.set(commands);

      await interaction.reply({
        embeds: [core.embeds.success(`Reloaded ${client.commands.size} slash & ${client.prefixCommands.size} prefix commands.`)],
        ephemeral: true,
      });
    } catch (err) {
      console.error('[Reload]', err);
      await interaction.reply({
        embeds: [core.embeds.error(`Reload failed: ${err.message}`)],
        ephemeral: true,
      });
    }
  },
};
