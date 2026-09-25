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

    // Initialize data
    if (!context.client.embedBuilders) context.client.embedBuilders = new Map();
    context.client.embedBuilders.set(context.user.id, {
      title: null, description: null, color: null, author: null, authorIcon: null,
      thumbnail: null, image: null, footer: null, fields: [], buttons: [], sections: [],
      mode: 'v1', ephemeral: true,
    });

    const container = new ContainerBuilder()
      .setAccentColor(0xFFFFFF)
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `# ${emojis.star} Embed Builder\n**Craft beautiful embeds — classic or modern.**`))
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `**Choose your embed style below.**\n\n` +
        `📋 **Classic Embed (V1)**\n` +
        `${emojis.arrowRight} Title, Description, Color\n` +
        `${emojis.arrowRight} Author, Thumbnail, Image, Footer\n` +
        `${emojis.arrowRight} Fields, Link buttons\n\n` +
        `✨ **Modern Embed (V2)**\n` +
        `${emojis.arrowRight} Components V2 container\n` +
        `${emojis.arrowRight} Sections with thumbnails\n` +
        `${emojis.arrowRight} Everything from V1 + more`))
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `**Ephemeral:** ✅ On (only you see it)\n` +
        `*Click **Toggle Ephemeral** to change.*`
      ));

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('eb_open_v1').setLabel('Classic Embed (V1)').setEmoji('📋').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('eb_open_v2').setLabel('Modern Embed (V2)').setEmoji('✨').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('eb_toggle_ephemeral').setLabel('Toggle Ephemeral').setEmoji('👁️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
    );

    await context.reply({
      components: [container, row],
      flags: 1 << 15 | 1 << 6,
    });
  },
};
