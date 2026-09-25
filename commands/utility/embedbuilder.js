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
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const emojis = require('../../emojis/emojis');

module.exports = {
  name: 'embedbuilder',
  description: 'Build and send custom embeds',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('embedbuilder')
    .setDescription('Build and send custom embeds')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(context) {
    if (!context.isChatInputCommand || !context.isChatInputCommand()) {
      return context.reply('Please use `/embedbuilder` (slash command).');
    }

    const container = new ContainerBuilder()
      .setAccentColor(0xFFFFFF)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${emojis.star} Embed Builder\n` +
          `**Create and send custom messages or embeds**\n` +
          `*Choose an option below to get started.*`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emojis.arrowRight} Available Options**\n` +
          `📝 **Message** — Send a plain text message\n` +
          `📋 **V1 Embed** — Classic Discord embed\n` +
          `✨ **V2 Embed** — Components V2 container\n` +
          `✏️ **Edit by ID** — Edit an existing message/embed\n` +
          `📤 **Send to Channel** — Send to a specific channel`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `*Powered by Dynamite Music*`
        )
      );

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('embed_msg')
        .setLabel('Message')
        .setEmoji('📝')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('embed_v1')
        .setLabel('V1 Embed')
        .setEmoji('📋')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('embed_v2')
        .setLabel('V2 Embed')
        .setEmoji('✨')
        .setStyle(ButtonStyle.Success)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('embed_edit')
        .setLabel('Edit by ID')
        .setEmoji('✏️')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('embed_channel')
        .setLabel('Send to Channel')
        .setEmoji('📤')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('embed_close')
        .setLabel('Close')
        .setEmoji('❌')
        .setStyle(ButtonStyle.Danger)
    );

    await context.reply({
      components: [container, row1, row2],
      flags: 1 << 15,
    });
  },
};
