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

    // ===== FRONT PAGE =====
    const container = new ContainerBuilder()
      .setAccentColor(0xFFFFFF)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${emojis.star} Embed Builder\n` +
          `**Create and send custom messages or embeds**`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Welcome to the **Embed Builder** — a powerful tool to create and send custom messages, embeds, and Components V2 containers.\n\n` +
          `**What you can do:**\n` +
          `${emojis.arrowRight} Send plain text messages\n` +
          `${emojis.arrowRight} Create classic V1 embeds\n` +
          `${emojis.arrowRight} Create modern V2 embeds\n` +
          `${emojis.arrowRight} Edit messages by ID\n` +
          `${emojis.arrowRight} Send to any channel by ID\n\n` +
          `*Click **Get Started** below to begin.*`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
      );

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('embed_getstarted')
        .setLabel('Get Started')
        .setEmoji('🚀')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('embed_close')
        .setLabel('Close')
        .setEmoji('❌')
        .setStyle(ButtonStyle.Danger)
    );

    await context.reply({
      components: [container, buttons],
      flags: 1 << 15,
    });
  },
};
