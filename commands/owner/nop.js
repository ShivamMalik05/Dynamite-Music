const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const core = require('../../core');
const nopConfig = require('../../config/nop');

module.exports = {
  name: 'nop',
  category: 'owner',
  ownerOnly: true,
  data: new SlashCommandBuilder()
    .setName('nop')
    .setDescription('Manage No-Prefix settings')
    .addSubcommand(sub =>
      sub.setName('toggle').setDescription('Enable or disable NOP globally')
    )
    .addSubcommand(sub =>
      sub.setName('status').setDescription('Show current NOP status')
    )
    .addSubcommand(sub =>
      sub.setName('addserver').setDescription('Add a server to NOP whitelist')
        .addStringOption(opt => opt.setName('guild_id').setDescription('Server ID').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('removeserver').setDescription('Remove a server from NOP whitelist')
        .addStringOption(opt => opt.setName('guild_id').setDescription('Server ID').setRequired(true))
    ),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'toggle') {
      nopConfig.enabled = !nopConfig.enabled;
      core.config.nop.enabled = nopConfig.enabled;
      return interaction.reply({
        embeds: [core.embeds.success(`NOP is now **${nopConfig.enabled ? 'enabled' : 'disabled'}**.`)],
        ephemeral: true,
      });
    }

    if (sub === 'status') {
      const embed = core.embeds.info([
        `**Enabled:** ${nopConfig.enabled ? '✅' : '❌'}`,
        `**Categories:** ${nopConfig.categories.length ? nopConfig.categories.join(', ') : 'none'}`,
        `**Servers:** ${nopConfig.servers.length}`,
        `**Log Channel:** ${nopConfig.logs.channel || 'not set'}`,
      ].join('\n'), 'NOP Status');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'addserver') {
      const guildId = interaction.options.getString('guild_id');
      if (nopConfig.servers.includes(guildId)) {
        return interaction.reply({ embeds: [core.embeds.warning('Server already in NOP whitelist.')], ephemeral: true });
      }
      nopConfig.servers.push(guildId);
      return interaction.reply({ embeds: [core.embeds.success(`Added \`${guildId}\` to NOP whitelist.`)], ephemeral: true });
    }

    if (sub === 'removeserver') {
      const guildId = interaction.options.getString('guild_id');
      const idx = nopConfig.servers.indexOf(guildId);
      if (idx === -1) {
        return interaction.reply({ embeds: [core.embeds.warning('Server not found in NOP whitelist.')], ephemeral: true });
      }
      nopConfig.servers.splice(idx, 1);
      return interaction.reply({ embeds: [core.embeds.success(`Removed \`${guildId}\` from NOP whitelist.`)], ephemeral: true });
    }
  },
};
