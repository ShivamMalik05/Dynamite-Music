const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const emojis = require('../../../emojis/emojis');
const fs = require('fs');
const path = require('path');

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

const ACTION_EMOJIS = {
  mute: emojis.mute,
  kick: emojis.kick,
  ban: emojis.ban,
  role_add: emojis.success,
  role_remove: emojis.cancel,
};

// ===== MAIN PANEL =====
function buildMainPanel(config) {
  const rules = config.rules || [];

  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.shield} Auto-Action Panel\n` +
        `**Automatic moderation based on warnings**`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.info} Status**\n` +
        `${emojis.arrow} **Rules:** \`${rules.length}\`\n` +
        `${emojis.arrow} **Auto-Delete:** ${config.autoDelete?.enabled ? `✅ ${config.autoDelete.days}d` : '❌'}\n` +
        `${emojis.arrow} **Decay:** ${config.decay?.enabled ? `✅ ${config.decay.days}d` : '❌'}\n` +
        `${emojis.arrow} **Threshold Notify:** ${config.notify?.enabled ? '✅' : '❌'}\n` +
        `${emojis.arrow} **Silent Mode:** ${config.silentMode ? '✅' : '❌'}`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.stats} Rules**\n` +
        (rules.length > 0
          ? rules.sort((a, b) => a.priority - b.priority).map(r => {
              const icon = ACTION_EMOJIS[r.action] || '❓';
              const status = r.enabled ? '✅' : '❌';
              const duration = r.duration ? ` (${r.duration}m)` : '';
              return `\`#${r.id}\` ${icon} **${r.warnings} warnings** → ${r.action}${duration} ${status}`;
            }).join('\n')
          : '*No rules configured*')
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
    );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('aa_add_rule').setLabel('Add Rule').setEmoji('➕').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('aa_delete_rule').setLabel('Delete Rule').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('aa_toggle_rule').setLabel('Toggle Rule').setEmoji('🔄').setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('aa_settings').setLabel('Settings').setEmoji('⚙️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('aa_analytics').setLabel('Analytics').setEmoji('📊').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('aa_presets').setLabel('Presets').setEmoji('🎯').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('aa_refresh').setLabel('Refresh').setEmoji('🔄').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('aa_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row1, row2];
}

// ===== SETTINGS PANEL =====
function buildSettingsPanel(config) {
  const container = new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.info} Auto-Action Settings\n` +
        `**Configure auto-delete, decay, and more**`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.stats} Current Settings**\n` +
        `${emojis.arrow} **Auto-Delete:** ${config.autoDelete?.enabled ? `✅ ${config.autoDelete.days} days` : '❌ Disabled'}\n` +
        `${emojis.arrow} **Decay:** ${config.decay?.enabled ? `✅ ${config.decay.days} days (factor ${config.decay.factor})` : '❌ Disabled'}\n` +
        `${emojis.arrow} **Threshold Notify:** ${config.notify?.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
        `${emojis.arrow} **Silent Mode:** ${config.silentMode ? '✅ Enabled' : '❌ Disabled'}`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
    );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('aa_toggle_autodelete').setLabel(`Auto-Delete: ${config.autoDelete?.enabled ? 'ON' : 'OFF'}`).setEmoji('🗑️').setStyle(config.autoDelete?.enabled ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('aa_toggle_decay').setLabel(`Decay: ${config.decay?.enabled ? 'ON' : 'OFF'}`).setEmoji('⏳').setStyle(config.decay?.enabled ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('aa_toggle_notify').setLabel(`Notify: ${config.notify?.enabled ? 'ON' : 'OFF'}`).setEmoji('🔔').setStyle(config.notify?.enabled ? ButtonStyle.Success : ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('aa_toggle_silent').setLabel(`Silent: ${config.silentMode ? 'ON' : 'OFF'}`).setEmoji('🔕').setStyle(config.silentMode ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('aa_set_autodelete_days').setLabel('Set Delete Days').setEmoji('📅').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('aa_set_decay').setLabel('Set Decay').setEmoji('⏳').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('aa_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Secondary)
  );

  return [container, row1, row2];
}

// ===== PRESETS PANEL =====
function buildPresetsPanel() {
  const container = new ContainerBuilder()
    .setAccentColor(0x57F287)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.star} Rule Presets\n` +
        `**Choose a preset for your server**`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.info} Available Presets**\n\n` +
        `**🟢 Lenient**\n` +
        `${emojis.arrow} 5 = mute 10m\n` +
        `${emojis.arrow} 10 = mute 60m\n` +
        `${emojis.arrow} 15 = kick\n\n` +
        `**🟡 Balanced**\n` +
        `${emojis.arrow} 3 = mute 10m\n` +
        `${emojis.arrow} 5 = mute 60m\n` +
        `${emojis.arrow} 7 = kick\n` +
        `${emojis.arrow} 10 = ban\n\n` +
        `**🔴 Strict**\n` +
        `${emojis.arrow} 1 = mute 5m\n` +
        `${emojis.arrow} 2 = mute 30m\n` +
        `${emojis.arrow} 3 = mute 60m\n` +
        `${emojis.arrow} 4 = kick\n` +
        `${emojis.arrow} 5 = ban`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('aa_preset_lenient').setLabel('Lenient').setEmoji('🟢').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('aa_preset_balanced').setLabel('Balanced').setEmoji('🟡').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('aa_preset_strict').setLabel('Strict').setEmoji('🔴').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('aa_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Secondary)
  );

  return [container, row];
}

// ===== ANALYTICS PANEL =====
function buildAnalyticsPanel() {
  const warningsPath = path.join(__dirname, '..', '..', '..', 'data', 'warnings.json');
  let data = { warnings: {} };
  if (fs.existsSync(warningsPath)) {
    try { data = JSON.parse(fs.readFileSync(warningsPath, 'utf8')); } catch {}
  }

  const reasonCounts = {};
  const modCounts = {};
  let total = 0;

  for (const [userId, warnings] of Object.entries(data.warnings || {})) {
    for (const w of warnings) {
      total++;
      reasonCounts[w.reason] = (reasonCounts[w.reason] || 0) + 1;
      modCounts[w.moderator] = (modCounts[w.moderator] || 0) + 1;
    }
  }

  const topReasons = Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([r, c]) => `${emojis.arrow} ${r} — \`${c}\``)
    .join('\n') || '*None*';

  const topMods = Object.entries(modCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([m, c]) => `${emojis.arrow} ${m} — \`${c}\``)
    .join('\n') || '*None*';

  const container = new ContainerBuilder()
    .setAccentColor(0xEB459E)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.stats} Warning Analytics\n` +
        `**Total Warnings:** \`${total}\``
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.info} Top 5 Reasons**\n${topReasons}`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**${emojis.mod} Top 5 Moderators**\n${topMods}`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('aa_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Secondary)
  );

  return [container, row];
}

module.exports = {
  makeSep,
  ACTION_EMOJIS,
  buildMainPanel,
  buildSettingsPanel,
  buildPresetsPanel,
  buildAnalyticsPanel,
};
