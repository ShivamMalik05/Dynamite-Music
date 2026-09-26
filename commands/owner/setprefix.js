const { SlashCommandBuilder } = require('discord.js');
const core = require('../../core');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'setprefix',
  category: 'owner',
  ownerOnly: true,
  data: new SlashCommandBuilder()
    .setName('setprefix')
    .setDescription('Change the bot prefix')
    .addStringOption(opt =>
      opt.setName('prefix').setDescription('New prefix').setRequired(true)
    ),

  async execute(interaction, client) {
    const newPrefix = interaction.options.getString('prefix');

    if (newPrefix.length > 5) {
      return interaction.reply({
        embeds: [core.embeds.error('Prefix must be 5 characters or less.')],
        ephemeral: true,
      });
    }

    try {
      const configPath = path.join(__dirname, '..', '..', 'config', 'config.js');
      const config = require(configPath);
      config.prefix = newPrefix;

      const content = `module.exports = ${JSON.stringify(config, null, 2)};\n`;
      fs.writeFileSync(configPath, content);

      // Update live config
      core.config.prefix = newPrefix;

      await interaction.reply({
        embeds: [core.embeds.success(`Prefix updated to \`${newPrefix}\``)],
        ephemeral: true,
      });
    } catch (err) {
      console.error('[SetPrefix]', err);
      await interaction.reply({
        embeds: [core.embeds.error('Failed to update prefix.')],
        ephemeral: true,
      });
    }
  },
};
