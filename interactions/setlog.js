const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
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

function buildPanel(config) {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# 📋 Log Setup Panel\n` +
        `**Configure where each type of log goes**`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Available Log Types**\n` +
        `Configure each one to receive its own events.`
      )
    );

  for (const type of LOG_TYPES) {
    const channelId = config.channels[type.id];
    const channelText = channelId ? `<#${channelId}>` : '`Not set`';
    const status = config.enabled[type.id] ? '✅' : '❌';

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${type.emoji} **${type.label}** ${status}\n` +
        `└ ${channelText}`
      )
    );
  }

  container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**How to use:**\n` +
        `1. Click the dropdown below\n` +
        `2. Choose a log type\n` +
        `3. Select a channel\n\n` +
        `**Tips:**\n` +
        `• Use **Toggle All** to enable/disable all logs\n` +
        `• Use **Reset All** to clear all channel settings`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
    );

  return container;
}

function buildButtons() {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('setlog_toggle').setLabel('Toggle All').setEmoji('🔄').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('setlog_reset').setLabel('Reset All').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('setlog_refresh').setLabel('Refresh').setEmoji('🔃').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('setlog_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );
  return [row];
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
    .setPlaceholder('Select a log type to configure')
    .addOptions(options);

  return [new ActionRowBuilder().addComponents(menu)];
}

async function handleButton(interaction) {
  const config = loadConfig();
  const id = interaction.customId;

  if (id === 'setlog_close') {
    await interaction.update({ components: [] });
    return true;
  }

  if (id === 'setlog_toggle') {
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

  if (id === 'setlog_refresh') {
    await interaction.update({
      components: [buildPanel(config), ...buildTypeSelect(), ...buildButtons()],
      flags: 1 << 15,
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
