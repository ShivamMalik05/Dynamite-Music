const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require('discord.js');
const { loadConfig, saveConfig } = require('../utils/logger');

const LOG_TYPES = [
  { id: 'moderation', label: 'Moderation', emoji: '🛡️', color: 0xED4245, desc: 'Bans, kicks, warns, timeouts' },
  { id: 'messages', label: 'Messages', emoji: '💬', color: 0xFEE75C, desc: 'Message edits and deletes' },
  { id: 'members', label: 'Members', emoji: '👥', color: 0x57F287, desc: 'Joins, leaves, nickname changes' },
  { id: 'channels', label: 'Channels', emoji: '📢', color: 0x5865F2, desc: 'Channel create, delete, update' },
  { id: 'roles', label: 'Roles', emoji: '🎭', color: 0xEB459E, desc: 'Role create, delete, update' },
  { id: 'voice', label: 'Voice', emoji: '🔊', color: 0x1ABC9C, desc: 'Voice join, leave, move' },
  { id: 'server', label: 'Server', emoji: '🏠', color: 0x9B59B6, desc: 'Server updates and changes' },
];

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

function buildPanel(config) {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# 📋 Log Setup Panel\n` +
        `**Configure where each type of log goes**`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Available Log Types** — ${LOG_TYPES.length} total\n` +
        `Use the dropdown below to configure each one.`
      )
    );

  for (const type of LOG_TYPES) {
    const channelId = config.channels[type.id];
    const channelText = channelId ? `<#${channelId}>` : '`Not set`';
    const status = config.enabled[type.id] ? '✅' : '❌';
    const statusText = config.enabled[type.id] ? 'Enabled' : 'Disabled';

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${type.emoji} **${type.label}** ${status} — *${statusText}*\n` +
        `└ ${channelText}`
      )
    );
  }

  container.addSeparatorComponents(makeSep());
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**How to use:**\n` +
      `1. Select a log type from the dropdown\n` +
      `2. Choose a channel for it\n` +
      `3. Toggle it on/off with the button\n\n` +
      `**Tips:**\n` +
      `• Use **Toggle All** to enable/disable everything\n` +
      `• Use **Test** to send a test log\n` +
      `• Use **Reset** to clear all channel settings`
    )
  );
  container.addSeparatorComponents(makeSep());
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
  );

  return container;
}

function buildTypeSelect() {
  const options = LOG_TYPES.map(t => ({
    label: t.label,
    value: t.id,
    emoji: t.emoji,
    description: t.desc,
  }));

  const menu = new StringSelectMenuBuilder()
    .setCustomId('setlog_type_select')
    .setPlaceholder('📋 Select a log type to configure')
    .addOptions(options);

  return [new ActionRowBuilder().addComponents(menu)];
}

function buildButtons() {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('setlog_toggle_all').setLabel('Toggle All').setEmoji('🔄').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('setlog_test').setLabel('Test Log').setEmoji('🧪').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('setlog_reset').setLabel('Reset Channels').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('setlog_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );
  return [row];
}

async function handleButton(interaction, client) {
  const config = loadConfig();
  const id = interaction.customId;

  if (id === 'setlog_close') {
    await interaction.update({ components: [] });
    return true;
  }

  if (id === 'setlog_toggle_all') {
    const allEnabled = Object.values(config.enabled).every(v => v === true);
    for (const key of Object.keys(config.enabled)) config.enabled[key] = !allEnabled;
    saveConfig(config);
    await interaction.update({
      components: [buildPanel(config), ...buildTypeSelect(), ...buildButtons()],
      flags: 1 << 15,
    });
    return true;
  }

  if (id === 'setlog_reset') {
    for (const key of Object.keys(config.channels)) config.channels[key] = '';
    saveConfig(config);
    await interaction.update({
      components: [buildPanel(config), ...buildTypeSelect(), ...buildButtons()],
      flags: 1 << 15,
    });
    return true;
  }

  if (id === 'setlog_test') {
    const { sendLog } = require('../utils/logger');
    await sendLog(client, 'moderation', {
      emoji: '🧪',
      title: 'Test Log',
      subtitle: 'This is a test log message',
      fields: [
        { name: 'Test', value: 'If you see this, logs are working!' },
      ],
    });
    await interaction.reply({
      content: '🧪 Test log sent to the configured moderation channel.',
      ephemeral: true,
    });
    return true;
  }

  return false;
}

async function handleSelect(interaction) {
  const type = interaction.values[0];
  const validTypes = LOG_TYPES.map(t => t.id);
  if (!validTypes.includes(type)) return false;

  const row = new ActionRowBuilder().addComponents(
    new ChannelSelectMenuBuilder()
      .setCustomId(`setlog_channel_${type}`)
      .setPlaceholder(`Select channel for ${type} logs`)
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
      .setMinValues(1).setMaxValues(1)
  );

  await interaction.reply({
    content: `Select the channel for **${type}** logs:`,
    components: [row],
    ephemeral: true,
  });
  return true;
}

async function handleChannelSelect(interaction) {
  const type = interaction.customId.replace('setlog_channel_', '');
  const channel = interaction.channels.first();
  const config = loadConfig();
  config.channels[type] = channel.id;
  saveConfig(config);

  await interaction.update({
    content: `✅ **${type}** logs will now be sent to ${channel}.`,
    components: [],
  });
  return true;
}

module.exports = {
  LOG_TYPES,
  buildPanel,
  buildButtons,
  buildTypeSelect,
  handleButton,
  handleSelect,
  handleChannelSelect,
  isSetlogButton: (id) => id.startsWith('setlog_') && !id.startsWith('setlog_channel_'),
  isSetlogSelect: (id) => id === 'setlog_type_select',
  isSetlogChannel: (id) => id.startsWith('setlog_channel_'),
};
