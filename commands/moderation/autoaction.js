const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const { sendLog } = require('../../utils/logger');
const { checkPermission } = require('../../utils/permissions');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', '..', 'config', 'warnings.js');

function loadConfig() {
  try {
    delete require.cache[require.resolve(configPath)];
    return require(configPath);
  } catch {
    return {
      autoAction: { enabled: false, muteAt: 3, muteDuration: 60, kickAt: 5, banAt: 7 },
      expiry: { enabled: false, defaultDays: 30 },
    };
  }
}

function saveConfig(config) {
  const content = `module.exports = ${JSON.stringify(config, null, 2)};\n`;
  fs.writeFileSync(configPath, content);
}

function makeSep() {
  try {
    const sep = new SeparatorBuilder();
    if (typeof sep.setSpacing === 'function') sep.setSpacing(1);
    if (typeof sep.setDivider === 'function') sep.setDivider(true);
    return sep;
  } catch {
    return { type: 14, divider: true, spacing: 1 };
  }
}

// ===== BUILD SETTINGS PANEL =====
function buildSettingsPanel(config, client) {
  const aa = config.autoAction || {};
  const status = aa.enabled ? '✅ Enabled' : '❌ Disabled';

  const container = new ContainerBuilder()
    .setAccentColor(aa.enabled ? 0x57F287 : 0xED4245)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.shield} Auto-Action Settings\n` +
        `**Automatic moderation based on warnings**`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## Status\n**Auto-Action:** ${status}`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## Thresholds\n` +
        `${emojis.mute} **Mute At:** \`${aa.muteAt || 3}\` warnings\n` +
        `└ Duration: \`${aa.muteDuration || 60}\` minutes\n\n` +
        `${emojis.kick} **Kick At:** \`${aa.kickAt || 5}\` warnings\n\n` +
        `${emojis.ban} **Ban At:** \`${aa.banAt || 7}\` warnings`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## How It Works\n` +
        `When a user reaches a threshold, the action is applied automatically.\n` +
        `• ${emojis.mute} Mute = Timeout\n` +
        `• ${emojis.kick} Kick = Remove from server\n` +
        `• ${emojis.ban} Ban = Permanent removal`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
    );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('aa_toggle')
      .setLabel(aa.enabled ? 'Disable' : 'Enable')
      .setEmoji(aa.enabled ? '❌' : '✅')
      .setStyle(aa.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
    new ButtonBuilder().setCustomId('aa_set_mute').setLabel('Set Mute').setEmoji('🔇').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('aa_set_kick').setLabel('Set Kick').setEmoji('👢').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('aa_set_ban').setLabel('Set Ban').setEmoji('🔨').setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('aa_reset').setLabel('Reset to Default').setEmoji('🔄').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('aa_refresh').setLabel('Refresh').setEmoji('🔄').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('aa_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row1, row2];
}

module.exports = {
  name: 'autoaction',
  description: 'Configure auto-action for warnings',
  category: 'Moderation',
  data: new SlashCommandBuilder()
    .setName('autoaction')
    .setDescription('Configure auto-action for warnings')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(context) {
    if (!context.isChatInputCommand || !context.isChatInputCommand()) {
      return context.reply('Use /autoaction (slash command).');
    }

    if (!(await checkPermission(context, 'autoaction'))) return;

    const config = loadConfig();
    const panel = buildSettingsPanel(config, context.client);

    await context.reply({
      components: panel,
      flags: 1 << 15 | 1 << 6,
    });
  },

  async handleButton(interaction, client) {
    const id = interaction.customId;
    if (!id.startsWith('aa_')) return false;

    const config = loadConfig();

    if (id === 'aa_close') {
      await interaction.update({ components: [] });
      return true;
    }

    if (id === 'aa_refresh') {
      const panel = buildSettingsPanel(config, client);
      await interaction.update({ components: panel, flags: 1 << 15 });
      return true;
    }

    if (id === 'aa_toggle') {
      config.autoAction.enabled = !config.autoAction.enabled;
      saveConfig(config);
      const panel = buildSettingsPanel(config, client);
      await interaction.update({ components: panel, flags: 1 << 15 });
      await sendLog(client, 'moderation', {
        emoji: emojis.shield,
        title: 'Auto-Action Toggled',
        subtitle: config.autoAction.enabled ? 'Auto-action enabled' : 'Auto-action disabled',
        fields: [
          { name: 'By', value: interaction.user.tag },
        ],
      });
      return true;
    }

    if (id === 'aa_reset') {
      config.autoAction = { enabled: false, muteAt: 3, muteDuration: 60, kickAt: 5, banAt: 7 };
      saveConfig(config);
      const panel = buildSettingsPanel(config, client);
      await interaction.update({ components: panel, flags: 1 << 15 });
      return true;
    }

    // Set thresholds via modal
    if (id === 'aa_set_mute' || id === 'aa_set_kick' || id === 'aa_set_ban') {
      const type = id.replace('aa_set_', '');
      const modal = new ModalBuilder()
        .setCustomId(`aa_modal_${type}`)
        .setTitle(`Set ${type.charAt(0).toUpperCase() + type.slice(1)} Threshold`);

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('threshold')
            .setLabel('Warning count threshold')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        )
      );

      if (type === 'mute') {
        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('duration')
              .setLabel('Mute duration (minutes)')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );
      }

      await interaction.showModal(modal);
      return true;
    }

    return false;
  },

  async handleModal(interaction, client) {
    const id = interaction.customId;
    if (!id.startsWith('aa_modal_')) return false;

    const config = loadConfig();
    const type = id.replace('aa_modal_', '');
    const threshold = parseInt(interaction.fields.getTextInputValue('threshold'));

    if (isNaN(threshold) || threshold < 1) {
      return interaction.reply({ content: `${emojis.error} Invalid threshold.`, ephemeral: true });
    }

    if (type === 'mute') {
      const duration = parseInt(interaction.fields.getTextInputValue('duration'));
      if (isNaN(duration) || duration < 1) {
        return interaction.reply({ content: `${emojis.error} Invalid duration.`, ephemeral: true });
      }
      config.autoAction.muteAt = threshold;
      config.autoAction.muteDuration = duration;
    } else if (type === 'kick') {
      config.autoAction.kickAt = threshold;
    } else if (type === 'ban') {
      config.autoAction.banAt = threshold;
    }

    saveConfig(config);
    await interaction.reply({ content: `${emojis.success} Updated!`, ephemeral: true });
    return true;
  },
};
