const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const emojis = require('../../../emojis/emojis');
const { sendLog } = require('../../../utils/logger');
const fs = require('fs');
const path = require('path');
const {
  buildMainPanel,
  buildSettingsPanel,
  buildPresetsPanel,
  buildAnalyticsPanel,
} = require('./panels');
const PRESETS = require('./presets');

const configPath = path.join(__dirname, '..', '..', '..', 'config', 'warnings.js');

function loadConfig() {
  try {
    delete require.cache[require.resolve(configPath)];
    const config = require(configPath);
    // Ensure all fields exist
    if (!config.rules) config.rules = [];
    if (!config.autoDelete) config.autoDelete = { enabled: false, days: 30 };
    if (!config.decay) config.decay = { enabled: false, days: 7, factor: 0.5 };
    if (!config.notify) config.notify = { enabled: false };
    if (config.silentMode === undefined) config.silentMode = false;
    if (!config.customDM) config.customDM = {};
    return config;
  } catch {
    return {
      rules: [],
      autoDelete: { enabled: false, days: 30 },
      decay: { enabled: false, days: 7, factor: 0.5 },
      notify: { enabled: false },
      silentMode: false,
      customDM: {},
    };
  }
}

function saveConfig(config) {
  const content = `module.exports = ${JSON.stringify(config, null, 2)};\n`;
  fs.writeFileSync(configPath, content);
}

// ===== BUTTON HANDLER =====
async function handleButton(interaction, client) {
  const id = interaction.customId;
  if (!id.startsWith('aa_')) return false;

  const config = loadConfig();

  // CLOSE
  if (id === 'aa_close') {
    try {
      await interaction.message.delete();
    } catch {
      await interaction.update({ content: 'Closed.', components: [] });
    }
    return true;
  }

  // REFRESH / BACK
  if (id === 'aa_refresh' || id === 'aa_back') {
    const panel = buildMainPanel(config);
    await interaction.update({ components: panel, flags: 1 << 15 });
    return true;
  }

  // SETTINGS
  if (id === 'aa_settings') {
    const panel = buildSettingsPanel(config);
    await interaction.update({ components: panel, flags: 1 << 15 });
    return true;
  }

  // PRESETS
  if (id === 'aa_presets') {
    const panel = buildPresetsPanel();
    await interaction.update({ components: panel, flags: 1 << 15 });
    return true;
  }

  // ANALYTICS
  if (id === 'aa_analytics') {
    const panel = buildAnalyticsPanel();
    await interaction.update({ components: panel, flags: 1 << 15 });
    return true;
  }

  // TOGGLE SETTINGS
  if (id === 'aa_toggle_autodelete') {
    config.autoDelete.enabled = !config.autoDelete.enabled;
    saveConfig(config);
    const panel = buildSettingsPanel(config);
    await interaction.update({ components: panel, flags: 1 << 15 });
    return true;
  }
  if (id === 'aa_toggle_decay') {
    config.decay.enabled = !config.decay.enabled;
    saveConfig(config);
    const panel = buildSettingsPanel(config);
    await interaction.update({ components: panel, flags: 1 << 15 });
    return true;
  }
  if (id === 'aa_toggle_notify') {
    config.notify.enabled = !config.notify.enabled;
    saveConfig(config);
    const panel = buildSettingsPanel(config);
    await interaction.update({ components: panel, flags: 1 << 15 });
    return true;
  }
  if (id === 'aa_toggle_silent') {
    config.silentMode = !config.silentMode;
    saveConfig(config);
    const panel = buildSettingsPanel(config);
    await interaction.update({ components: panel, flags: 1 << 15 });
    return true;
  }

  // SET DAYS MODAL
  if (id === 'aa_set_autodelete_days') {
    const modal = new ModalBuilder().setCustomId('aa_modal_autodelete_days').setTitle('Auto-Delete Days');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('days').setLabel('Days (7, 30, 90, or 0 for never)').setStyle(TextInputStyle.Short).setRequired(true)
      )
    );
    await interaction.showModal(modal);
    return true;
  }

  if (id === 'aa_set_decay') {
    const modal = new ModalBuilder().setCustomId('aa_modal_decay').setTitle('Decay Settings');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('days').setLabel('Days before decay').setStyle(TextInputStyle.Short).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('factor').setLabel('Decay factor (0.1 - 0.9)').setStyle(TextInputStyle.Short).setRequired(true)
      )
    );
    await interaction.showModal(modal);
    return true;
  }

  // ADD RULE MODAL
  if (id === 'aa_add_rule') {
    const modal = new ModalBuilder().setCustomId('aa_modal_add_rule').setTitle('Add Auto-Action Rule');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('warnings').setLabel('Warning count').setStyle(TextInputStyle.Short).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('action').setLabel('Action (mute/kick/ban)').setStyle(TextInputStyle.Short).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('duration').setLabel('Duration in minutes (mute only)').setStyle(TextInputStyle.Short).setRequired(false)
      )
    );
    await interaction.showModal(modal);
    return true;
  }

  // DELETE RULE MODAL
  if (id === 'aa_delete_rule') {
    const modal = new ModalBuilder().setCustomId('aa_modal_delete_rule').setTitle('Delete Rule');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('rule_id').setLabel('Rule ID').setStyle(TextInputStyle.Short).setRequired(true)
      )
    );
    await interaction.showModal(modal);
    return true;
  }

  // TOGGLE RULE MODAL
  if (id === 'aa_toggle_rule') {
    const modal = new ModalBuilder().setCustomId('aa_modal_toggle_rule').setTitle('Toggle Rule');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('rule_id').setLabel('Rule ID').setStyle(TextInputStyle.Short).setRequired(true)
      )
    );
    await interaction.showModal(modal);
    return true;
  }

  // PRESETS
  if (id === 'aa_preset_lenient' || id === 'aa_preset_balanced' || id === 'aa_preset_strict') {
    const type = id.replace('aa_preset_', '');
    config.rules = JSON.parse(JSON.stringify(PRESETS[type]));
    saveConfig(config);
    const panel = buildMainPanel(config);
    await interaction.update({ components: panel, flags: 1 << 15 });
    await sendLog(client, 'moderation', {
      emoji: emojis.star,
      title: 'Preset Applied',
      subtitle: `Preset: ${type}`,
      fields: [{ name: 'By', value: interaction.user.tag }],
    });
    return true;
  }

  return false;
}

// ===== MODAL HANDLER =====
async function handleModal(interaction, client) {
  const id = interaction.customId;
  if (!id.startsWith('aa_modal_')) return false;

  const config = loadConfig();

  // AUTO-DELETE DAYS
  if (id === 'aa_modal_autodelete_days') {
    const days = parseInt(interaction.fields.getTextInputValue('days'));
    if (isNaN(days) || days < 0) {
      return interaction.reply({ content: `${emojis.error} Invalid days.`, ephemeral: true });
    }
    config.autoDelete.days = days;
    config.autoDelete.enabled = days > 0;
    saveConfig(config);
    await interaction.reply({ content: `${emojis.success} Auto-delete: ${days === 0 ? 'never' : days + ' days'}`, ephemeral: true });
    return true;
  }

  // DECAY
  if (id === 'aa_modal_decay') {
    const days = parseInt(interaction.fields.getTextInputValue('days'));
    const factor = parseFloat(interaction.fields.getTextInputValue('factor'));
    if (isNaN(days) || days < 1 || isNaN(factor) || factor < 0.1 || factor > 0.9) {
      return interaction.reply({ content: `${emojis.error} Invalid input.`, ephemeral: true });
    }
    config.decay.days = days;
    config.decay.factor = factor;
    config.decay.enabled = true;
    saveConfig(config);
    await interaction.reply({ content: `${emojis.success} Decay: ${days} days, factor ${factor}`, ephemeral: true });
    return true;
  }

  // ADD RULE
  if (id === 'aa_modal_add_rule') {
    const warnings = parseInt(interaction.fields.getTextInputValue('warnings'));
    const action = interaction.fields.getTextInputValue('action').toLowerCase();
    const durationStr = interaction.fields.getTextInputValue('duration');
    const duration = durationStr ? parseInt(durationStr) : null;

    if (isNaN(warnings) || warnings < 1) {
      return interaction.reply({ content: `${emojis.error} Invalid warning count.`, ephemeral: true });
    }
    if (!['mute', 'kick', 'ban'].includes(action)) {
      return interaction.reply({ content: `${emojis.error} Action must be mute, kick, or ban.`, ephemeral: true });
    }
    if (action === 'mute' && (!duration || duration < 1)) {
      return interaction.reply({ content: `${emojis.error} Mute requires duration.`, ephemeral: true });
    }

    // Ensure rules array exists
    if (!config.rules) config.rules = [];

    const newId = Math.max(0, ...config.rules.map(r => r.id)) + 1;
    const newPriority = Math.max(0, ...config.rules.map(r => r.priority)) + 1;

    config.rules.push({
      id: newId,
      warnings,
      action,
      duration: action === 'mute' ? duration : null,
      enabled: true,
      priority: newPriority,
    });
    config.rules.sort((a, b) => a.warnings - b.warnings);
    saveConfig(config);

    await interaction.reply({ content: `${emojis.success} Rule #${newId} added: **${warnings}** warnings → **${action}**${duration ? ` (${duration}m)` : ''}`, ephemeral: true });
    return true;
  }

  // DELETE RULE
  if (id === 'aa_modal_delete_rule') {
    if (!config.rules) config.rules = [];
    const ruleId = parseInt(interaction.fields.getTextInputValue('rule_id'));
    const idx = config.rules.findIndex(r => r.id === ruleId);
    if (idx === -1) {
      return interaction.reply({ content: `${emojis.error} Rule not found.`, ephemeral: true });
    }
    config.rules.splice(idx, 1);
    saveConfig(config);
    await interaction.reply({ content: `${emojis.success} Rule #${ruleId} deleted.`, ephemeral: true });
    return true;
  }

  // TOGGLE RULE
  if (id === 'aa_modal_toggle_rule') {
    if (!config.rules) config.rules = [];
    const ruleId = parseInt(interaction.fields.getTextInputValue('rule_id'));
    const rule = config.rules.find(r => r.id === ruleId);
    if (!rule) {
      return interaction.reply({ content: `${emojis.error} Rule not found.`, ephemeral: true });
    }
    rule.enabled = !rule.enabled;
    saveConfig(config);
    await interaction.reply({ content: `${emojis.success} Rule #${ruleId} is now **${rule.enabled ? 'enabled' : 'disabled'}**.`, ephemeral: true });
    return true;
  }

  return false;
}

module.exports = { handleButton, handleModal };
