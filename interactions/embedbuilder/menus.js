const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const emojis = require('../../emojis/emojis');

// ===== LIVE PREVIEW (jo har edit ke baad dikhega) =====
function buildLivePreview(data, mode) {
  const isV2 = mode === 'v2';
  const container = new ContainerBuilder().setAccentColor(data.color || (isV2 ? 0x9B59B6 : 0x5865F2));

  // Title
  if (data.title) {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${data.title}`));
  }

  // Description
  if (data.description) {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(data.description));
  }

  // Thumbnail (right side) — V2 ke liye SectionBuilder
  if (data.thumbnail) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    container.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**🔳 Thumbnail**\n${emojis.arrowRight} Image set`))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(data.thumbnail))
    );
  }

  // Fields
  if (data.fields?.length) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    for (const f of data.fields) {
      container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**${f.name}**\n${f.value}`));
    }
  }

  // V2 Sections
  if (isV2 && data.sections?.length) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    for (const s of data.sections) {
      const sb = new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(s.text));
      if (s.thumbnail) sb.setThumbnailAccessory(new ThumbnailBuilder().setURL(s.thumbnail));
      container.addSectionComponents(sb);
    }
  }

  // Image (bada, neeche)
  if (data.image) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(data.image))
    );
  }

  // Author
  if (data.author) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    container.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Author:** ${data.author}`))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(data.authorIcon || 'https://cdn.discordapp.com/embed/avatars/0.png'))
    );
  }

  // Footer
  container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(data.footer || `*Powered by Dynamite Music*`));

  // Link buttons (agar hain)
  const rows = [container];

  if (data.buttons?.length) {
    const linkRow = new ActionRowBuilder();
    for (const b of data.buttons.slice(0, 5)) {
      linkRow.addComponents(new ButtonBuilder().setLabel(b.label).setURL(b.url).setStyle(ButtonStyle.Link));
    }
    rows.push(linkRow);
  }

  return rows;
}

// ===== FRONT =====
function buildFront(data) {
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
      `**Ephemeral:** ${data?.ephemeral !== false ? '✅ On (only you see it)' : '❌ Off (everyone sees it)'}`
    ));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_open_v1').setLabel('Classic Embed (V1)').setEmoji('📋').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_open_v2').setLabel('Modern Embed (V2)').setEmoji('✨').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('eb_toggle_ephemeral').setLabel('Toggle Ephemeral').setEmoji('👁️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row];
}

// ===== MAIN MENU =====
function buildMain(data, mode) {
  const isV2 = mode === 'v2';
  const accent = isV2 ? 0x9B59B6 : 0x5865F2;
  const title = isV2 ? 'Modern Embed (V2)' : 'Classic Embed (V1)';

  const container = new ContainerBuilder()
    .setAccentColor(accent)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `# ${emojis.star} ${title}\n**Choose what to add**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      isV2
        ? `📝 **Content** — Title, Description, Color\n` +
          `🖼️ **Media** — Author, Thumbnail, Image, Footer\n` +
          `📋 **Fields** — Title + value pairs\n` +
          `🔗 **Buttons** — Link buttons\n` +
          `✨ **V2 Sections** — Sections with thumbnails\n` +
          `👁️ **Preview & Send** — Review before sending`
        : `📝 **Content** — Title, Description, Color\n` +
          `🖼️ **Media** — Author, Thumbnail, Image, Footer\n` +
          `📋 **Fields** — Title + value pairs\n` +
          `🔗 **Buttons** — Link buttons\n` +
          `👁️ **Preview & Send** — Review before sending`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**Mode:** ${isV2 ? 'V2' : 'V1'} | **Ephemeral:** ${data?.ephemeral !== false ? '✅ On' : '❌ Off'}`
    ));

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_content').setLabel('Content').setEmoji('📝').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_media').setLabel('Media').setEmoji('🖼️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_fields').setLabel('Fields').setEmoji('📋').setStyle(ButtonStyle.Secondary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_buttons').setLabel('Buttons').setEmoji('🔗').setStyle(ButtonStyle.Secondary)
  );
  if (isV2) {
    row2.addComponents(
      new ButtonBuilder().setCustomId('eb_sections').setLabel('V2 Sections').setEmoji('✨').setStyle(ButtonStyle.Success)
    );
  }
  row2.addComponents(
    new ButtonBuilder().setCustomId('eb_preview').setLabel('Preview & Send').setEmoji('👁️').setStyle(ButtonStyle.Success)
  );
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_toggle_ephemeral').setLabel('Toggle Ephemeral').setEmoji('👁️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_reset').setLabel('Reset').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row1, row2, row3];
}

// ===== CONTENT =====
function buildContentMenu(data, mode) {
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

// ===== MEDIA =====
function buildMediaMenu(data, mode) {
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

// ===== FIELDS =====
function buildFieldsMenu(data, mode) {
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

// ===== BUTTONS =====
function buildButtonsMenu(data, mode) {
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

// ===== SECTIONS =====
function buildSectionsMenu(data, mode) {
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

module.exports = {
  buildFront,
  buildMain,
  buildContentMenu,
  buildMediaMenu,
  buildFieldsMenu,
  buildButtonsMenu,
  buildSectionsMenu,
  buildLivePreview,
};
