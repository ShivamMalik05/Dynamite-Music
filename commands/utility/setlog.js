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
} = require('discord.js');
const { loadConfig } = require('../../utils/logger');
const emojis = require('../../emojis/emojis');

const LOG_TYPES = [
  { id: 'moderation', label: 'Moderation', emoji: '🔨', color: 0xED4245, style: ButtonStyle.Danger },
  { id: 'messages', label: 'Messages', emoji: '💬', color: 0xFEE75C, style: ButtonStyle.Primary },
  { id: 'members', label: 'Members', emoji: '👥', color: 0x57F287, style: ButtonStyle.Success },
  { id: 'channels', label: 'Channels', emoji: '📢', color: 0x5865F2, style: ButtonStyle.Primary },
  { id: 'roles', label: 'Roles', emoji: '🎭', color: 0xEB459E, style: ButtonStyle.Secondary },
  { id: 'voice', label: 'Voice', emoji: '🔊', color: 0x1ABC9C, style: ButtonStyle.Success },
  { id: 'server', label: 'Server', emoji: '🏠', color: 0x9B59B6, style: ButtonStyle.Secondary },
];

function buildMainPanel(config) {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.star} Log Setup Panel\n` +
        `**Configure where each type of log goes**\n` +
        `*Click a button below to set the channel for that log type.*`
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );

  for (const type of LOG_TYPES) {
    const channelId = config.logChannels[type.id];
    const channelText = channelId ? `<#${channelId}>` : '*Not set*';
    const status = config.logging[type.id] ? `${emojis.success} Enabled` : `${emojis.error} Disabled`;

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${type.emoji} **${type.label}**\n` +
        `${emojis.arrowRight} Channel: ${channelText}\n` +
        `${emojis.arrowRight} Status: ${status}`
      )
    );
  }

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `*Powered by Dynamite Music*`
    )
  );

  return container;
}

function buildButtons() {
  const row1 = new ActionRowBuilder().addComponents(
    LOG_TYPES.slice(0, 4).map(type =>
      new ButtonBuilder()
        .setCustomId(`setlog_${type.id}`)
        .setLabel(type.label)
        .setEmoji(type.emoji)
        .setStyle(type.style)
    )
  );

  const row2 = new ActionRowBuilder().addComponents(
    LOG_TYPES.slice(4).map(type =>
      new ButtonBuilder()
        .setCustomId(`setlog_${type.id}`)
        .setLabel(type.label)
        .setEmoji(type.emoji)
        .setStyle(type.style)
    )
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('setlog_toggle')
      .setLabel('Toggle All')
      .setEmoji('🔄')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('setlog_reset')
      .setLabel('Reset All')
      .setEmoji('🗑️')
      .setStyle(ButtonStyle.Danger)
  );

  return [row1, row2, row3];
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
      return context.reply('Please use `/setlog` (slash command) for the interactive panel.');
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
