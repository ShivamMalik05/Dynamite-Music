const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const emojis = require('../../emojis/emojis');

function buildFront() {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `# ${emojis.star} Embed Builder\n**Create and send custom messages or embeds**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `Welcome to the **Embed Builder** — build fully custom embeds.\n\n` +
      `**Features:**\n` +
      `${emojis.arrowRight} Title, Description, Color\n` +
      `${emojis.arrowRight} Author, Thumbnail, Image, Footer\n` +
      `${emojis.arrowRight} Fields with title + value\n` +
      `${emojis.arrowRight} Link buttons\n` +
      `${emojis.arrowRight} V2 Sections with thumbnails\n` +
      `${emojis.arrowRight} Preview before sending\n\n` +
      `*Click **Get Started** to begin.*`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`));

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('embed_getstarted').setLabel('Get Started').setEmoji('🚀').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, buttons];
}

function buildMain() {
  const container = new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `# ${emojis.star} Embed Builder — Main Menu\n**Choose what to add**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `📝 **Content** — Title, Description, Color\n` +
      `🖼️ **Media** — Author, Thumbnail, Image, Footer\n` +
      `📋 **Fields** — Title + value pairs\n` +
      `🔗 **Buttons** — Link buttons\n` +
      `✨ **V2 Sections** — Sections with thumbnails\n` +
      `👁️ **Preview & Send** — Review before sending`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`));

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_content').setLabel('Content').setEmoji('📝').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_media').setLabel('Media').setEmoji('🖼️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_fields').setLabel('Fields').setEmoji('📋').setStyle(ButtonStyle.Secondary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_buttons').setLabel('Buttons').setEmoji('🔗').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_sections').setLabel('V2 Sections').setEmoji('✨').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('eb_preview').setLabel('Preview & Send').setEmoji('👁️').setStyle(ButtonStyle.Success)
  );
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_reset').setLabel('Reset').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row1, row2, row3];
}

function buildContentMenu() {
  const container = new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 📝 Content\n**Title, Description, Color**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Choose what to edit:`));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_set_title').setLabel('Title').setEmoji('📌').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_set_desc').setLabel('Description').setEmoji('📄').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_set_color').setLabel('Color').setEmoji('🎨').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_main').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row];
}

function buildMediaMenu() {
  const container = new ContainerBuilder()
    .setAccentColor(0x9B59B6)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 🖼️ Media\n**Author, Thumbnail, Image, Footer**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Choose what to edit:`));

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_set_author').setLabel('Author').setEmoji('👤').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_set_thumb').setLabel('Thumbnail').setEmoji('🔳').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_set_image').setLabel('Image').setEmoji('🖼️').setStyle(ButtonStyle.Secondary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_set_footer').setLabel('Footer').setEmoji('📎').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_main').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row1, row2];
}

function buildFieldsMenu() {
  const container = new ContainerBuilder()
    .setAccentColor(0xEB459E)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 📋 Fields\n**Add title + value pairs**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Add fields to your embed:`));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_add_field').setLabel('Add Field').setEmoji('➕').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('eb_clear_fields').setLabel('Clear All').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_main').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row];
}

function buildButtonsMenu() {
  const container = new ContainerBuilder()
    .setAccentColor(0x1ABC9C)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 🔗 Buttons\n**Link buttons**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Add link buttons (max 5):`));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_add_button').setLabel('Add Button').setEmoji('➕').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('eb_clear_buttons').setLabel('Clear All').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_main').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row];
}

function buildSectionsMenu() {
  const container = new ContainerBuilder()
    .setAccentColor(0xEB459E)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ✨ V2 Sections\n**Sections with thumbnails**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Add V2 sections with text + thumbnail:`));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_add_section').setLabel('Add Section').setEmoji('➕').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('eb_clear_sections').setLabel('Clear All').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_main').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row];
}

function buildEmbedFromData(data) {
  const container = new ContainerBuilder().setAccentColor(data.color || 0x5865F2);
  if (data.title) container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${data.title}`));
  if (data.description) container.addTextDisplayComponents(new TextDisplayBuilder().setContent(data.description));
  if (data.fields?.length) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    for (const f of data.fields) container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**${f.name}**\n${f.value}`));
  }
  if (data.sections?.length) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    for (const s of data.sections) {
      const sb = new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(s.text));
      if (s.thumbnail) sb.setThumbnailAccessory(new ThumbnailBuilder().setURL(s.thumbnail));
      container.addSectionComponents(sb);
    }
  }
  if (data.author) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Author:** ${data.author}`));
  }
  container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(data.footer || `*Powered by Dynamite Music*`));
  return container;
}

function buildPreview(data) {
  const container = buildEmbedFromData(data);
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_send').setLabel('Send').setEmoji('📤').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('eb_send_channel').setLabel('Send to Channel').setEmoji('📨').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_main').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );
  const rows = [container, row];
  if (data.buttons?.length) {
    const linkRow = new ActionRowBuilder();
    for (const b of data.buttons.slice(0, 5)) linkRow.addComponents(new ButtonBuilder().setLabel(b.label).setURL(b.url).setStyle(ButtonStyle.Link));
    rows.push(linkRow);
  }
  return rows;
}

module.exports = {
  buildFront,
  buildMain,
  buildContentMenu,
  buildMediaMenu,
  buildFieldsMenu,
  buildButtonsMenu,
  buildSectionsMenu,
  buildEmbedFromData,
  buildPreview,
};
