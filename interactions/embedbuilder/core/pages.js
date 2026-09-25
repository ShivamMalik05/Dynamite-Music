const {
  ContainerBuilder,
  TextDisplayBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const {
  makeSeparator,
  buildEmbedFromBlocks,
  buildMessageOnly,
} = require('./builders');

// ===== START PAGE =====
function buildStartPage() {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# 🎨 Ultimate Embed Builder\n` +
        `**Create stunning embeds — unlike anything else on Discord**`
      )
    )
    .addSeparatorComponents(makeSeparator())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**📋 V1 Builder**\n` +
        `Classic embeds — Title, Text, Field, Author, Thumbnail, Image, Footer\n\n` +
        `**✨ V2 Builder**\n` +
        `Components V2 — also includes Separators and Sections\n\n` +
        `**💬 Message Only**\n` +
        `Plain text message, no embed container\n\n` +
        `**✏️ Edit Existing**\n` +
        `Edit old messages by channel ID + message ID`
      )
    )
    .addSeparatorComponents(makeSeparator())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Advanced Features:**\n` +
        `🎭 Role buttons — add, remove, or toggle roles\n` +
        `🔗 Link buttons — direct links\n` +
        `📜 History — every edit tracked\n` +
        `💾 Export/Import — save and reload your embeds\n` +
        `📊 Block positioning — place content anywhere`
      )
    )
    .addSeparatorComponents(makeSeparator())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
    );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_start_v1').setLabel('V1 Builder').setEmoji('📋').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_start_v2').setLabel('V2 Builder').setEmoji('✨').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('eb_start_msg').setLabel('Message Only').setEmoji('💬').setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_start_edit').setLabel('Edit Existing').setEmoji('✏️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_start_import').setLabel('Import JSON').setEmoji('📥').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_start_help').setLabel('Help').setEmoji('❓').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row1, row2];
}

// ===== BUILDER PAGE =====
function buildBuilderPage(data, mode = 'v1') {
  const isV2 = mode === 'v2';
  const isMsg = mode === 'msg';

  const header = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `### ${isMsg ? '💬 Message Only' : isV2 ? '✨ V2 Builder' : '📋 V1 Builder'}\n` +
        `*Blocks: ${data.blocks?.length || 0} · Buttons: ${data.buttons?.length || 0}*`
      )
    );

  let previewRows = [];
  if (isMsg) {
    const msgData = buildMessageOnly(data);
    previewRows = msgData.components || [];
  } else {
    previewRows = buildEmbedFromBlocks(data);
  }

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_blocks').setLabel('Blocks').setEmoji('🧱').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_buttons').setLabel('Buttons').setEmoji('🔗').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_style').setLabel('Style').setEmoji('🎨').setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_manage_blocks').setLabel('Manage Blocks').setEmoji('🔧').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_history').setLabel('History').setEmoji('📜').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_export').setLabel('Export').setEmoji('💾').setStyle(ButtonStyle.Secondary)
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_preview').setLabel('Send').setEmoji('📤').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('eb_send_channel').setLabel('Send to Channel').setEmoji('📨').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_reset').setLabel('Reset').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_home').setLabel('Home').setEmoji('🏠').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [header, ...previewRows, row1, row2, row3];
}

// ===== HELP PAGE =====
function buildHelpPage() {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ❓ Help\n**How to use the Ultimate Embed Builder**`)
    )
    .addSeparatorComponents(makeSeparator())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**1. Choose Builder Mode**\n` +
        `V1 = Classic embed\n` +
        `V2 = Components V2 with separators and sections\n` +
        `Message Only = Plain text, no embed\n\n` +
        `**2. Add Content Blocks**\n` +
        `Use the dropdown menu to add blocks.\n\n` +
        `**3. Manage Blocks**\n` +
        `Move, delete, or swap any block.\n\n` +
        `**4. Add Buttons**\n` +
        `Link buttons or role buttons.\n\n` +
        `**5. Send or Edit**\n` +
        `Send to current channel, or edit an existing message.\n\n` +
        `**Edit Existing:**\n` +
        `Enter channel ID + message ID. The bot will load the existing message and let you edit it.`
      )
    )
    .addSeparatorComponents(makeSeparator());

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_home').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Secondary)
  );

  return [container, row];
}

module.exports = {
  buildStartPage,
  buildBuilderPage,
  buildHelpPage,
};
