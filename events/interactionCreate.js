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

      if (interaction.customId.startsWith('setlog_')) {
        const type = interaction.customId.replace('setlog_', '');
        const validTypes = ['moderation', 'messages', 'members', 'channels', 'roles', 'voice', 'server'];
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

        await interaction.reply({
          content: `${emojis.success} All log channels have been reset.`,
          ephemeral: true,
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
