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
  { id: 'moderation', label: 'Moderation', emoji: '🔨', color: 0xED4245 },
  { id: 'messages', label: 'Messages', emoji: '💬', color: 0xFEE75C },
  { id: 'members', label: 'Members', emoji: '👥', color: 0x57F287 },
  { id: 'channels', label: 'Channels', emoji: '📢', color: 0x5865F2 },
  { id: 'roles', label: 'Roles', emoji: '🎭', color: 0xEB459E },
  { id: 'voice', label: 'Voice', emoji: '🔊', color: 0x1ABC9C },
  { id: 'server', label: 'Server', emoji: '🏠', color: 0x9B59B6 },
];

function buildPanel(config) {
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
        .setStyle(ButtonStyle.Secondary)
    )
  );

  const row2 = new ActionRowBuilder().addComponents(
    LOG_TYPES.slice(4).map(type =>
      new ButtonBuilder()
        .setCustomId(`setlog_${type.id}`)
        .setLabel(type.label)
        .setEmoji(type.emoji)
        .setStyle(ButtonStyle.Secondary)
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
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    // Slash commands
    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'Something went wrong!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'Something went wrong!', ephemeral: true });
        }
      }
      return;
    }

    // Buttons
    if (interaction.isButton()) {
      const config = loadConfig();

      if (interaction.customId.startsWith('setlog_') && interaction.customId !== 'setlog_reset' && interaction.customId !== 'setlog_toggle') {
        const type = interaction.customId.replace('setlog_', '');
        const validTypes = LOG_TYPES.map(t => t.id);
        if (!validTypes.includes(type)) return;

        const selectMenu = new ChannelSelectMenuBuilder()
          .setCustomId(`setlog_channel_${type}`)
          .setPlaceholder(`Select channel for ${type} logs`)
          .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
          .setMinValues(1)
          .setMaxValues(1);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
          content: `Select the channel where **${type}** logs should be sent:`,
          components: [row],
          ephemeral: true,
        });
        return;
      }

      if (interaction.customId === 'setlog_reset') {
        config.logChannels = {
          moderation: '',
          messages: '',
          members: '',
          channels: '',
          roles: '',
          voice: '',
          server: '',
        };
        saveConfig(config);

        const container = buildPanel(config);
        const buttons = buildButtons();

        await interaction.update({
          components: [container, ...buttons],
          flags: 1 << 15,
        });
        return;
      }

      if (interaction.customId === 'setlog_toggle') {
        const allEnabled = Object.values(config.logging).every(v => v === true);
        for (const key of Object.keys(config.logging)) {
          config.logging[key] = !allEnabled;
        }
        saveConfig(config);

        const container = buildPanel(config);
        const buttons = buildButtons();

        await interaction.update({
          components: [container, ...buttons],
          flags: 1 << 15,
        });
        return;
      }
    }

    // Channel select menu
    if (interaction.isChannelSelectMenu()) {
      if (interaction.customId.startsWith('setlog_channel_')) {
        const type = interaction.customId.replace('setlog_channel_', '');
        const channel = interaction.channels.first();

        const config = loadConfig();
        config.logChannels[type] = channel.id;
        saveConfig(config);

        await interaction.update({
          content: `${emojis.success} **${type}** logs will now be sent to ${channel}.`,
          components: [],
        });
        return;
      }
    }
  },
};
