const { SlashCommandBuilder } = require('discord.js');
const core = require('../../core');
const warningConfig = require('../../config/warnings');

module.exports = {
  name: 'autoaction',
  category: 'admin',
  adminOnly: true,
  data: new SlashCommandBuilder()
    .setName('autoaction')
    .setDescription('Manage auto-action rules')
    .addSubcommand(sub =>
      sub.setName('list').setDescription('List all auto-action rules')
    )
    .addSubcommand(sub =>
      sub.setName('toggle').setDescription('Enable or disable a rule')
        .addIntegerOption(opt => opt.setName('rule_id').setDescription('Rule ID').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('add').setDescription('Add a new auto-action rule')
        .addIntegerOption(opt => opt.setName('warnings').setDescription('Warning threshold').setRequired(true))
        .addStringOption(opt =>
          opt.setName('action').setDescription('Action to take').setRequired(true)
            .addChoices(
              { name: 'Mute', value: 'mute' },
              { name: 'Kick', value: 'kick' },
              { name: 'Ban', value: 'ban' }
            )
        )
        .addIntegerOption(opt => opt.setName('duration').setDescription('Duration in minutes (for mute)').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('remove').setDescription('Remove an auto-action rule')
        .addIntegerOption(opt => opt.setName('rule_id').setDescription('Rule ID').setRequired(true))
    ),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'list') {
      const list = warningConfig.rules
        .map(r => `**#${r.id}** — ${r.warnings} warns → ${r.action}${r.duration ? ` (${r.duration}m)` : ''} — ${r.enabled ? '✅' : '❌'}`)
        .join('\n');
      return interaction.reply({
        embeds: [core.embeds.info(list || 'No rules set.', 'Auto-Action Rules')],
        ephemeral: true,
      });
    }

    if (sub === 'toggle') {
      const ruleId = interaction.options.getInteger('rule_id');
      const rule = warningConfig.rules.find(r => r.id === ruleId);
      if (!rule) {
        return interaction.reply({ embeds: [core.embeds.error('Rule not found.')], ephemeral: true });
      }
      rule.enabled = !rule.enabled;
      return interaction.reply({
        embeds: [core.embeds.success(`Rule **#${rule.id}** is now **${rule.enabled ? 'enabled' : 'disabled'}**.`)],
        ephemeral: true,
      });
    }

    if (sub === 'add') {
      const warnings = interaction.options.getInteger('warnings');
      const action = interaction.options.getString('action');
      const duration = interaction.options.getInteger('duration') || 0;

      const newId = Math.max(0, ...warningConfig.rules.map(r => r.id)) + 1;
      warningConfig.rules.push({
        id: newId,
        warnings,
        action,
        duration,
        enabled: true,
        priority: newId,
      });

      return interaction.reply({
        embeds: [core.embeds.success(`Added rule **#${newId}**: ${warnings} warns → ${action}`)],
        ephemeral: true,
      });
    }

    if (sub === 'remove') {
      const ruleId = interaction.options.getInteger('rule_id');
      const idx = warningConfig.rules.findIndex(r => r.id === ruleId);
      if (idx === -1) {
        return interaction.reply({ embeds: [core.embeds.error('Rule not found.')], ephemeral: true });
      }
      warningConfig.rules.splice(idx, 1);
      return interaction.reply({
        embeds: [core.embeds.success(`Removed rule **#${ruleId}**.`)],
        ephemeral: true,
      });
    }
  },
};
