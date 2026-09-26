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
const { loadConfig, saveConfig, sendLog } = require('../utils/logger');

// ===== LOG CATEGORIES =====
const LOG_CATEGORIES = [
  {
    id: 'moderation',
    label: 'Moderation',
    emoji: '🛡️',
    color: 0xED4245,
    types: [
      { id: 'moderation', label: 'General', emoji: '🛡️', desc: 'Bans, kicks, general moderation' },
      { id: 'warn', label: 'Warnings', emoji: '⚠️', desc: 'Warn, warnings remove' },
      { id: 'autoaction', label: 'Auto-Action', emoji: '🤖', desc: 'Auto-mute/kick/ban triggered' },
      { id: 'lock', label: 'Lock/Unlock', emoji: '🔒', desc: 'Channel lock and unlock' },
    ],
  },
  {
    id: 'messages',
    label: 'Messages',
    emoji: '💬',
    color: 0xFEE75C,
    types: [
      { id: 'messages', label: 'Message Logs', emoji: '💬', desc: 'Edits and deletes' },
    ],
  },
  {
    id: 'members',
    label: 'Members',
    emoji: '👥',
    color: 0x57F287,
    types: [
      { id: 'members', label: 'Member Logs', emoji: '👥', desc: 'Joins, leaves, nickname' },
    ],
  },
  {
    id: 'channels',
    label: 'Channels',
    emoji: '📢',
    color: 0x5865F2,
    types: [
      { id: 'channels', label: 'Channel Logs', emoji: '📢', desc: 'Create, delete, update' },
    ],
  },
  {
    id: 'roles',
    label: 'Roles',
    emoji: '🎭',
    color: 0xEB459E,
    types: [
      { id: 'roles', label: 'Role Logs', emoji: '🎭', desc: 'Create, delete, update' },
    ],
  },
  {
    id: 'voice',
    label: 'Voice',
    emoji: '🔊',
    color: 0x1ABC9C,
    types: [
      { id: 'voice', label: 'Voice Logs', emoji: '🔊', desc: 'Join, leave, move' },
    ],
  },
  {
    id: 'server',
    label: 'Server',
    emoji: '🏠',
    color: 0x9B59B6,
    types: [
      { id: 'server', label: 'Server Logs', emoji: '🏠', desc: 'Server updates' },
    ],
  },
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

// ===== BUILD PAGE =====
function buildPage(config, pageIndex) {
  const category = LOG_CATEGORIES[pageIndex];
  const totalPages = LOG_CATEGORIES.length;

  const container = new ContainerBuilder()
    .setAccentColor(category.color)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${category.emoji} ${category.label} Logs\n` +
        `**Page ${pageIndex + 1} / ${totalPages}**`
      )
    )
    .addSeparatorComponents(makeSep());

  for (const type of category.types) {
    const channelId = config.channels?.[type.id];
    const channelText = channelId ? `<#${channelId}>` : '`Not set`';
    const status = config.enabled?.[type.id] !== false ? '✅' : '❌';

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${type.emoji} **${type.label}** ${status}\n` +
        `└ Channel: ${channelText}\n` +
        `└ *${type.desc}*`
      )
    );
  }

  container.addSeparatorComponents(makeSep());
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**How to use:**\n` +
      `1. Select a log type from the dropdown\n` +
      `2. Choose a channel\n` +
      `3. Toggle on/off with button\n\n` +
      `**Navigation:**\n` +
      `• ⬅️ ➡️ switch pages\n` +
      `• 📋 dropdown jump to category`
    )
  );
  container.addSeparatorComponents(makeSep());
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
  );

  return container;
}

// ===== NAVIGATION BUTTONS =====
function buildNavButtons(pageIndex) {
  const totalPages = LOG_CATEGORIES.length;

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`setlog_prev_${pageIndex}`)
      .setLabel('Previous')
      .setEmoji('⬅️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(pageIndex === 0),
    new ButtonBuilder()
      .setCustomId(`setlog_next_${pageIndex}`)
      .setLabel('Next')
      .setEmoji('➡️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(pageIndex === totalPages - 1),
    new ButtonBuilder()
      .setCustomId('setlog_toggle_all')
      .setLabel('Toggle All')
      .setEmoji('🔄')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('setlog_test')
      .setLabel('Test Log')
      .setEmoji('🧪')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('setlog_close')
      .setLabel('Close')
      .setEmoji('❌')
      .setStyle(ButtonStyle.Danger)
  );

  return [row];
}

// ===== CATEGORY DROPDOWN =====
function buildCategoryDropdown() {
  const options = LOG_CATEGORIES.map((cat, index) => ({
    label: cat.label,
    value: String(index),
    emoji: cat.emoji,
    description: cat.types.map(t => t.label).join(', ').slice(0, 100),
  }));

  const menu = new StringSelectMenuBuilder()
    .setCustomId('setlog_category_select')
    .setPlaceholder('📋 Jump to category')
    .addOptions(options);

  return [new ActionRowBuilder().addComponents(menu)];
}

// ===== TYPE DROPDOWN =====
function buildTypeDropdown(pageIndex) {
  const category = LOG_CATEGORIES[pageIndex];
  const options = category.types.map(t => ({
    label: t.label,
    value: t.id,
    emoji: t.emoji,
    description: t.desc.slice(0, 100),
  }));

  const menu = new StringSelectMenuBuilder()
    .setCustomId('setlog_type_select')
    .setPlaceholder(`📝 Select a ${category.label} log type`)
    .addOptions(options);

  return [new ActionRowBuilder().addComponents(menu)];
}

// ===== HANDLE BUTTON =====
async function handleButton(interaction, client) {
  const config = loadConfig();
  const id = interaction.customId;

  if (id === 'setlog_close') {
    await interaction.update({ components: [] });
    return true;
  }

  if (id.startsWith('setlog_prev_')) {
    const current = parseInt(id.replace('setlog_prev_', ''));
    const newPage = Math.max(0, current - 1);
    await interaction.update({
      components: [
        buildPage(config, newPage),
        ...buildTypeDropdown(newPage),
        ...buildCategoryDropdown(),
        ...buildNavButtons(newPage),
      ],
      flags: 1 << 15,
    });
    return true;
  }

  if (id.startsWith('setlog_next_')) {
    const current = parseInt(id.replace('setlog_next_', ''));
    const newPage = Math.min(LOG_CATEGORIES.length - 1, current + 1);
    await interaction.update({
      components: [
        buildPage(config, newPage),
        ...buildTypeDropdown(newPage),
        ...buildCategoryDropdown(),
        ...buildNavButtons(newPage),
      ],
      flags: 1 << 15,
    });
    return true;
  }

  if (id === 'setlog_toggle_all') {
    const allEnabled = Object.values(config.enabled || {}).every(v => v !== false);
    for (const key of Object.keys(config.enabled || {})) {
      config.enabled[key] = !allEnabled;
    }
    saveConfig(config);
    await interaction.update({
      components: [
        buildPage(config, 0),
        ...buildTypeDropdown(0),
        ...buildCategoryDropdown(),
        ...buildNavButtons(0),
      ],
      flags: 1 << 15,
    });
    return true;
  }

  if (id === 'setlog_test') {
    await sendLog(client, 'moderation', {
      emoji: '🧪',
      title: 'Test Log',
      subtitle: 'Testing log system',
      fields: [
        { name: 'Status', value: '✅ Working' },
        { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>` },
      ],
    });
    await interaction.reply({ content: '🧪 Test log sent!', ephemeral: true });
    return true;
  }

  return false;
}

// ===== HANDLE SELECT =====
async function handleSelect(interaction, client) {
  const config = loadConfig();
  const id = interaction.customId;
  const value = interaction.values[0];

  if (id === 'setlog_category_select') {
    const pageIndex = parseInt(value);
    await interaction.update({
      components: [
        buildPage(config, pageIndex),
        ...buildTypeDropdown(pageIndex),
        ...buildCategoryDropdown(),
        ...buildNavButtons(pageIndex),
      ],
      flags: 1 << 15,
    });
    return true;
  }

  if (id === 'setlog_type_select') {
    const row = new ActionRowBuilder().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId(`setlog_channel_${value}`)
        .setPlaceholder(`Select channel for ${value} logs`)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setMinValues(1).setMaxValues(1)
    );

    await interaction.reply({
      content: `Select the channel for **${value}** logs:`,
      components: [row],
      ephemeral: true,
    });
    return true;
  }

  return false;
}

// ===== HANDLE CHANNEL SELECT =====
async function handleChannelSelect(interaction) {
  const type = interaction.customId.replace('setlog_channel_', '');
  const channel = interaction.channels.first();
  const config = loadConfig();

  if (!config.channels) config.channels = {};
  config.channels[type] = channel.id;

  if (!config.enabled) config.enabled = {};
  config.enabled[type] = true;

  saveConfig(config);

  await interaction.update({
    content: `✅ **${type}** logs will now be sent to ${channel}.`,
    components: [],
  });
  return true;
}

module.exports = {
  LOG_CATEGORIES,
  buildPage,
  buildNavButtons,
  buildCategoryDropdown,
  buildTypeDropdown,
  handleButton,
  handleSelect,
  handleChannelSelect,
  isSetlogButton: (id) => id.startsWith('setlog_') && !id.startsWith('setlog_channel_'),
  isSetlogSelect: (id) => id === 'setlog_category_select' || id === 'setlog_type_select',
  isSetlogChannel: (id) => id.startsWith('setlog_channel_'),
};
