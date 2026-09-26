const { SlashCommandBuilder } = require('discord.js');
const core = require('../../core');
const ownerConfig = require('../../config/owners');

module.exports = {
  name: 'owners',
  category: 'owner',
  ownerOnly: true,
  data: new SlashCommandBuilder()
    .setName('owners')
    .setDescription('Manage bot owners')
    .addSubcommand(sub =>
      sub.setName('list').setDescription('List all bot owners')
    )
    .addSubcommand(sub =>
      sub.setName('add').setDescription('Add a new owner')
        .addUserOption(opt => opt.setName('user').setDescription('User to add').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('remove').setDescription('Remove an owner')
        .addUserOption(opt => opt.setName('user').setDescription('User to remove').setRequired(true))
    ),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'list') {
      const list = ownerConfig.owners.map(id => `• <@${id}> (\`${id}\`)`).join('\n');
      return interaction.reply({
        embeds: [core.embeds.info(list || 'No owners set.', 'Bot Owners')],
        ephemeral: true,
      });
    }

    if (sub === 'add') {
      const user = interaction.options.getUser('user');
      if (ownerConfig.owners.includes(user.id)) {
        return interaction.reply({ embeds: [core.embeds.warning('User is already an owner.')], ephemeral: true });
      }
      ownerConfig.owners.push(user.id);
      core.config.owners.push(user.id);
      return interaction.reply({ embeds: [core.embeds.success(`Added <@${user.id}> as owner.`)], ephemeral: true });
    }

    if (sub === 'remove') {
      const user = interaction.options.getUser('user');
      if (user.id === interaction.user.id) {
        return interaction.reply({ embeds: [core.embeds.error('You cannot remove yourself.')], ephemeral: true });
      }
      const idx = ownerConfig.owners.indexOf(user.id);
      if (idx === -1) {
        return interaction.reply({ embeds: [core.embeds.warning('User is not an owner.')], ephemeral: true });
      }
      ownerConfig.owners.splice(idx, 1);
      const idx2 = core.config.owners.indexOf(user.id);
      if (idx2 !== -1) core.config.owners.splice(idx2, 1);
      return interaction.reply({ embeds: [core.embeds.success(`Removed <@${user.id}> from owners.`)], ephemeral: true });
    }
  },
};
