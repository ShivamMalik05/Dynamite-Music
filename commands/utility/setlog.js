const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
} = require('discord.js');
const { loadConfig, saveConfig } = require('../../utils/logger');
const emojis = require('../../emojis/emojis');

const LOG_TYPES = [
  { id: 'moderation', label: 'Moderation', emoji: '🔨', color: 0xED4245 },
  { id: 'messages', label: 'Messages', emoji: '💬', color: 0xFEE75C },
  { id: 'members', label: 'Members', emoji: '👥', color: 0x57F287 },
  { id: 'channels', label: 'Channels', emoji: '📢', color: 0x5865F2 },
  { id: 'roles', label: 'Roles', emoji: '🎭', color: 0xEB459E },
  { id: 'voice', label: 'Voice', emoji: '🔊', color: 0x1ABC9C },
  { id: 'server', label: 'Server', emoji: '🏠', color: 0x9B59B6 },
];

function buildMainPanel(config) {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.star} Log Setup Panel\n` +
        `**Configure where each type of log goes**`
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );

  for (const type of LOG_TYPES) {
    const channelId = config.logChannels[type.id];
    const channelText = channelId ? `<#${channelId}>` : '*Not set*';
    const status = config.logging[type.id] ? '✅ Enabled' : '❌ Disabled';

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${type.emoji} **${type.label}**\n` +
        `Channel: ${channelText}\n` +
        `Status: ${status}`
      )
    );
  }

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `*Use the buttons below to configure*`
    )
  );

  return container;
}

function buildButtons() {
  const row1 = new ActionRowBuilder().addComponents(
    ...LOG_TYPES.slice(0, 5).map(type =>
      new ButtonBuilder()
        .setCustomId(`setlog_${type.id}`)
        .setLabel(type.label)
        .setEmoji(type.emoji)
        .setStyle(ButtonStyle.Secondary)
    )
  );

  const row2 = new ActionRowBuilder().addComponents(
    ...LOG_TYPES.slice(5).map(type =>
      new ButtonBuilder()
        .setCustomId(`setlog_${type.id}`)
        .setLabel(type.label)
        .setEmoji(type.emoji)
        .setStyle(ButtonStyle.Secondary)
    ),
    new ButtonBuilder()
      .setCustomId('setlog_reset')
      .setLabel('Reset All')
      .setEmoji('🔄')
      .setStyle(ButtonStyle.Danger)
  );

  return [row1, row2];
}

module.exports = {
  name: 'setlog',
  description: 'Setup log channels with buttons',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('setlog')
    .setDescription('Setup log channels with buttons')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(context) {
    if (!context.isChatInputCommand || !context.isChatInputCommand()) {
      return context.reply('Use slash command: /setlog');
    }

    const config = loadConfig();
    const container = buildMainPanel(config);
    const buttons = buildButtons();

    await context.reply({
      components: [container, ...buttons],
      flags: 1 << 15,
    });
  },
};
