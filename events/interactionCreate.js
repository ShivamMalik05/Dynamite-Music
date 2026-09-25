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
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
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

function buildLogPanel(config) {
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
    new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
  );

  return container;
}

function buildLogButtons() {
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

    // ===== SETLOG BUTTONS =====
    if (interaction.isButton()) {
      const config = loadConfig();

      if (interaction.customId.startsWith('setlog_') && !['setlog_reset', 'setlog_toggle'].includes(interaction.customId)) {
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
          moderation: '', messages: '', members: '', channels: '',
          roles: '', voice: '', server: '',
        };
        saveConfig(config);

        const container = buildLogPanel(config);
        const buttons = buildLogButtons();

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

        const container = buildLogPanel(config);
        const buttons = buildLogButtons();

        await interaction.update({
          components: [container, ...buttons],
          flags: 1 << 15,
        });
        return;
      }

      // ===== EMBED BUILDER BUTTONS =====
      if (interaction.customId === 'embed_close') {
        await interaction.update({ components: [] });
        return;
      }

      if (interaction.customId === 'embed_msg') {
        const modal = new ModalBuilder()
          .setCustomId('modal_msg')
          .setTitle('Send a Message');

        const channelInput = new TextInputBuilder()
          .setCustomId('msg_channel')
          .setLabel('Channel ID (or leave empty for current)')
          .setStyle(TextInputStyle.Short)
          .setRequired(false);

        const contentInput = new TextInputBuilder()
          .setCustomId('msg_content')
          .setLabel('Message content')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(channelInput),
          new ActionRowBuilder().addComponents(contentInput)
        );

        await interaction.showModal(modal);
        return;
      }

      if (interaction.customId === 'embed_v1') {
        const modal = new ModalBuilder()
          .setCustomId('modal_v1')
          .setTitle('Create V1 Embed');

        const channelInput = new TextInputBuilder()
          .setCustomId('v1_channel')
          .setLabel('Channel ID (or leave empty for current)')
          .setStyle(TextInputStyle.Short)
          .setRequired(false);

        const titleInput = new TextInputBuilder()
          .setCustomId('v1_title')
          .setLabel('Title')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const descInput = new TextInputBuilder()
          .setCustomId('v1_description')
          .setLabel('Description')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        const colorInput = new TextInputBuilder()
          .setCustomId('v1_color')
          .setLabel('Color (hex, like #5865F2)')
          .setStyle(TextInputStyle.Short)
          .setRequired(false);

        const footerInput = new TextInputBuilder()
          .setCustomId('v1_footer')
          .setLabel('Footer text')
          .setStyle(TextInputStyle.Short)
          .setRequired(false);

        modal.addComponents(
          new ActionRowBuilder().addComponents(channelInput),
          new ActionRowBuilder().addComponents(titleInput),
          new ActionRowBuilder().addComponents(descInput),
          new ActionRowBuilder().addComponents(colorInput),
          new ActionRowBuilder().addComponents(footerInput)
        );

        await interaction.showModal(modal);
        return;
      }

      if (interaction.customId === 'embed_v2') {
        const modal = new ModalBuilder()
          .setCustomId('modal_v2')
          .setTitle('Create V2 Embed');

        const channelInput = new TextInputBuilder()
          .setCustomId('v2_channel')
          .setLabel('Channel ID (or leave empty for current)')
          .setStyle(TextInputStyle.Short)
          .setRequired(false);

        const titleInput = new TextInputBuilder()
          .setCustomId('v2_title')
          .setLabel('Title')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const contentInput = new TextInputBuilder()
          .setCustomId('v2_content')
          .setLabel('Content')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        const colorInput = new TextInputBuilder()
          .setCustomId('v2_color')
          .setLabel('Accent Color (hex, like #5865F2)')
          .setStyle(TextInputStyle.Short)
          .setRequired(false);

        modal.addComponents(
          new ActionRowBuilder().addComponents(channelInput),
          new ActionRowBuilder().addComponents(titleInput),
          new ActionRowBuilder().addComponents(contentInput),
          new ActionRowBuilder().addComponents(colorInput)
        );

        await interaction.showModal(modal);
        return;
      }

      if (interaction.customId === 'embed_edit') {
        const modal = new ModalBuilder()
          .setCustomId('modal_edit')
          .setTitle('Edit Message by ID');

        const channelInput = new TextInputBuilder()
          .setCustomId('edit_channel')
          .setLabel('Channel ID')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const msgInput = new TextInputBuilder()
          .setCustomId('edit_message')
          .setLabel('Message ID')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const contentInput = new TextInputBuilder()
          .setCustomId('edit_content')
          .setLabel('New content')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(channelInput),
          new ActionRowBuilder().addComponents(msgInput),
          new ActionRowBuilder().addComponents(contentInput)
        );

        await interaction.showModal(modal);
        return;
      }

      if (interaction.customId === 'embed_channel') {
        const modal = new ModalBuilder()
          .setCustomId('modal_channel')
          .setTitle('Send to Channel');

        const channelInput = new TextInputBuilder()
          .setCustomId('send_channel')
          .setLabel('Channel ID')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const contentInput = new TextInputBuilder()
          .setCustomId('send_content')
          .setLabel('Content')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(channelInput),
          new ActionRowBuilder().addComponents(contentInput)
        );

        await interaction.showModal(modal);
        return;
      }
    }

    // ===== CHANNEL SELECT MENU =====
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

    // ===== MODALS =====
    if (interaction.isModalSubmit()) {
      try {
        if (interaction.customId === 'modal_msg') {
          const channelId = interaction.fields.getTextInputValue('msg_channel');
          const content = interaction.fields.getTextInputValue('msg_content');

          const channel = channelId
            ? await interaction.guild.channels.fetch(channelId).catch(() => null)
            : interaction.channel;

          if (!channel) {
            return interaction.reply({ content: 'Channel not found.', ephemeral: true });
          }

          await channel.send(content);
          await interaction.reply({ content: `${emojis.success} Message sent to ${channel}.`, ephemeral: true });
          return;
        }

        if (interaction.customId === 'modal_v1') {
          const channelId = interaction.fields.getTextInputValue('v1_channel');
          const title = interaction.fields.getTextInputValue('v1_title');
          const description = interaction.fields.getTextInputValue('v1_description');
          const color = interaction.fields.getTextInputValue('v1_color') || '#5865F2';
          const footer = interaction.fields.getTextInputValue('v1_footer');

          const channel = channelId
            ? await interaction.guild.channels.fetch(channelId).catch(() => null)
            : interaction.channel;

          if (!channel) {
            return interaction.reply({ content: 'Channel not found.', ephemeral: true });
          }

          const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color.startsWith('#') ? parseInt(color.slice(1), 16) : 0x5865F2);

          if (footer) embed.setFooter({ text: footer });

          await channel.send({ embeds: [embed] });
          await interaction.reply({ content: `${emojis.success} V1 embed sent to ${channel}.`, ephemeral: true });
          return;
        }

        if (interaction.customId === 'modal_v2') {
          const channelId = interaction.fields.getTextInputValue('v2_channel');
          const title = interaction.fields.getTextInputValue('v2_title');
          const content = interaction.fields.getTextInputValue('v2_content');
          const color = interaction.fields.getTextInputValue('v2_color') || '#5865F2';

          const channel = channelId
            ? await interaction.guild.channels.fetch(channelId).catch(() => null)
            : interaction.channel;

          if (!channel) {
            return interaction.reply({ content: 'Channel not found.', ephemeral: true });
          }

          const container = new ContainerBuilder()
            .setAccentColor(color.startsWith('#') ? parseInt(color.slice(1), 16) : 0x5865F2)
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`# ${title}`)
            )
            .addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            )
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(content)
            )
            .addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            )
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
            );

          await channel.send({ components: [container], flags: 1 << 15 });
          await interaction.reply({ content: `${emojis.success} V2 embed sent to ${channel}.`, ephemeral: true });
          return;
        }

        if (interaction.customId === 'modal_edit') {
          const channelId = interaction.fields.getTextInputValue('edit_channel');
          const messageId = interaction.fields.getTextInputValue('edit_message');
          const content = interaction.fields.getTextInputValue('edit_content');

          const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
          if (!channel) {
            return interaction.reply({ content: 'Channel not found.', ephemeral: true });
          }

          const message = await channel.messages.fetch(messageId).catch(() => null);
          if (!message) {
            return interaction.reply({ content: 'Message not found.', ephemeral: true });
          }

          await message.edit(content);
          await interaction.reply({ content: `${emojis.success} Message edited.`, ephemeral: true });
          return;
        }

        if (interaction.customId === 'modal_channel') {
          const channelId = interaction.fields.getTextInputValue('send_channel');
          const content = interaction.fields.getTextInputValue('send_content');

          const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
          if (!channel) {
            return interaction.reply({ content: 'Channel not found.', ephemeral: true });
          }

          await channel.send(content);
          await interaction.reply({ content: `${emojis.success} Message sent to ${channel}.`, ephemeral: true });
          return;
        }
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
      }
    }
  },
};
