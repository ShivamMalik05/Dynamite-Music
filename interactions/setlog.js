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
} = require('discord.js');
const { loadConfig, saveConfig } = require('../utils/logger');
const emojis = require('../emojis/emojis');

const LOG_TYPES = [
  { id: 'moderation', label: 'Moderation', emoji: '🔨' },
  { id: 'messages', label: 'Messages', emoji: '💬' },
  { id: 'members', label: 'Members', emoji: '👥' },
  { id: 'channels', label: 'Channels', emoji: '📢' },
  { id: 'roles', label: 'Roles', emoji: '🎭' },
  { id: 'voice', label: 'Voice', emoji: '🔊' },
  { id: 'server', label: 'Server', emoji: '🏠' },
];

function buildPanel(config) {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.star} Log Setup Panel\n**Configure where each type of log goes**`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

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

  container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`));

  return container;
}

function buildButtons() {
  const row1 = new ActionRowBuilder().addComponents(
    LOG_TYPES.slice(0, 4).map(type =>
      new ButtonBuilder().setCustomId(`setlog_${type.id}`).setLabel(type.label).setEmoji(type.emoji).setStyle(ButtonStyle.Secondary)
    )
  );
  const row2 = new ActionRowBuilder().addComponents(
    LOG_TYPES.slice(4).map(type =>
      new ButtonBuilder().setCustomId(`setlog_${type.id}`).setLabel(type.label).setEmoji(type.emoji).setStyle(ButtonStyle.Secondary)
    )
  );
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('setlog_toggle').setLabel('Toggle All').setEmoji('🔄').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('setlog_reset').setLabel('Reset All').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
  );
  return [row1, row2, row3];
}

async function handleButton(interaction) {
  const config = loadConfig();

  if (!['setlog_reset', 'setlog_toggle'].includes(interaction.customId)) {
    const type = interaction.customId.replace('setlog_', '');
    if (!LOG_TYPES.map(t => t.id).includes(type)) return false;

    const row = new ActionRowBuilder().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId(`setlog_channel_${type}`)
        .setPlaceholder(`Select channel for ${type} logs`)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setMinValues(1).setMaxValues(1)
    );

    await interaction.reply({ content: `Select channel for **${type}** logs:`, components: [row], ephemeral: true });
    return true;
  }

  if (interaction.customId === 'setlog_reset') {
    config.logChannels = { moderation: '', messages: '', members: '', channels: '', roles: '', voice: '', server: '' };
    saveConfig(config);
    await interaction.update({ components: [buildPanel(config), ...buildButtons()], flags: 1 << 15 });
    return true;
  }

  if (interaction.customId === 'setlog_toggle') {
    const allEnabled = Object.values(config.logging).every(v => v === true);
    for (const key of Object.keys(config.logging)) config.logging[key] = !allEnabled;
    saveConfig(config);
    await interaction.update({ components: [buildPanel(config), ...buildButtons()], flags: 1 << 15 });
    return true;
  }

  return false;
}

async function handleChannelSelect(interaction) {
  const type = interaction.customId.replace('setlog_channel_', '');
  const channel = interaction.channels.first();
  const config = loadConfig();
  config.logChannels[type] = channel.id;
  saveConfig(config);

  await interaction.update({
    content: `${emojis.success} **${type}** logs will now be sent to ${channel}.`,
    components: [],
  });
  return true;
}

module.exports = {
  LOG_TYPES,
  buildPanel,
  buildButtons,
  handleButton,
  handleChannelSelect,
  isSetlogButton: (id) => id.startsWith('setlog_'),
  isSetlogChannel: (id) => id.startsWith('setlog_channel_'),
};
