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
const emojis = require('../../emojis/emojis');

module.exports = {
  name: 'embedbuilder',
  description: 'Build and send custom embeds (V1 and V2)',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('embedbuilder')
    .setDescription('Build and send custom embeds (V1 and V2)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(context) {
    if (!context.isChatInputCommand || !context.isChatInputCommand()) {
      return context.reply('Please use `/embedbuilder` (slash command).');
    }

    if (!context.client.embedBuilders) context.client.embedBuilders = new Map();
    context.client.embedBuilders.set(context.user.id, {
      title: null, description: null, color: null, author: null, authorIcon: null,
      thumbnail: null, image: null, footer: null, fields: [], buttons: [], sections: [],
      mode: 'v1', ephemeral: true, history: [],
    });

    const data = context.client.embedBuilders.get(context.user.id);
    const preview = require('../../interactions/embedbuilder/menus').buildLivePreview(data, data.mode);

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('eb_open_v1').setLabel('Classic (V1)').setEmoji('📋').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('eb_open_v2').setLabel('Modern (V2)').setEmoji('✨').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('eb_toggle_ephemeral').setLabel('Ephemeral: ON').setEmoji('👁️').setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('eb_content').setLabel('Content').setEmoji('📝').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('eb_media').setLabel('Media').setEmoji('🖼️').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('eb_fields').setLabel('Fields').setEmoji('📋').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('eb_buttons').setLabel('Buttons').setEmoji('🔗').setStyle(ButtonStyle.Secondary)
    );

    const row3 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('eb_preview').setLabel('Send').setEmoji('📤').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('eb_send_channel').setLabel('Send to Channel').setEmoji('📨').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('eb_reset').setLabel('Reset').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
    );

    await context.reply({
      components: [...preview, row1, row2, row3],
      flags: 1 << 15 | 1 << 6,
    });
  },
};
