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

// ===== LIVE PREVIEW + HISTORY =====
function buildLivePreview(data, mode) {
  const isV2 = mode === 'v2';
  const container = new ContainerBuilder().setAccentColor(data.color || (isV2 ? 0x9B59B6 : 0x5865F2));

  // Header
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
    `# ${emojis.star} Live Preview\n**Mode: ${isV2 ? 'Modern (V2)' : 'Classic (V1)'}**`
  ));
  container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

  // ===== EMBED PREVIEW =====
  if (data.title) {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${data.title}`));
  }

  if (data.description) {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(data.description));
  }

  if (data.thumbnail) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    container.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**🔳 Thumbnail**`))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(data.thumbnail))
    );
  }

  if (data.fields?.length) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    for (const f of data.fields) {
      container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**${f.name}**\n${f.value}`));
    }
  }

  if (isV2 && data.sections?.length) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    for (const s of data.sections) {
      const sb = new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(s.text));
      if (s.thumbnail) sb.setThumbnailAccessory(new ThumbnailBuilder().setURL(s.thumbnail));
      container.addSectionComponents(sb);
    }
  }

  if (data.image) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(data.image))
    );
  }

  if (data.author) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    container.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Author:** ${data.author}`))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(data.authorIcon || 'https://cdn.discordapp.com/embed/avatars/0.png'))
    );
  }

  container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(data.footer || `*Powered by Dynamite Music*`));

  // ===== HISTORY =====
  if (data.history?.length) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 📜 History`));
    for (const h of data.history.slice(-5).reverse()) {
      container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `${emojis.arrowRight} **${h.field}** → \`${h.value}\``
      ));
    }
  } else {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`*No history yet — start editing!*`));
  }

  return [container];
}

// ===== FRONT (Live Preview Page) =====
function buildFront(data) {
  const preview = buildLivePreview(data, data.mode);

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_open_v1').setLabel('Classic (V1)').setEmoji('📋').setStyle(data.mode === 'v1' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_open_v2').setLabel('Modern (V2)').setEmoji('✨').setStyle(data.mode === 'v2' ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_toggle_ephemeral').setLabel(data.ephemeral ? 'Ephemeral: ON' : 'Ephemeral: OFF').setEmoji('👁️').setStyle(ButtonStyle.Secondary)
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

  return [...preview, row1, row2, row3];
}

// ===== CONTENT =====
function buildContentMenu(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 📝 Content\n**Title, Description, Color**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**Current:**\n` +
      `Title: ${data.title || '*Not set*'}\n` +
      `Description: ${data.description ? data.description.slice(0, 50) + '...' : '*Not set*'}\n` +
      `Color: ${data.color ? '#' + data.color.toString(16).padStart(6, '0') : '*Not set*'}`
    ));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_set_title').setLabel('Title').setEmoji('📌').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_set_desc').setLabel('Description').setEmoji('📄').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_set_color').setLabel('Color').setEmoji('🎨').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row];
}

// ===== MEDIA =====
function buildMediaMenu(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0x9B59B6)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 🖼️ Media\n**Author, Thumbnail, Image, Footer**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**Current:**\n` +
      `Author: ${data.author || '*Not set*'}\n` +
      `Thumbnail: ${data.thumbnail ? '✅ Set' : '*Not set*'}\n` +
      `Image: ${data.image ? '✅ Set' : '*Not set*'}\n` +
      `Footer: ${data.footer || '*Not set*'}`
    ));

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_set_author').setLabel('Author').setEmoji('👤').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_set_thumb').setLabel('Thumbnail').setEmoji('🔳').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_set_image').setLabel('Image').setEmoji('🖼️').setStyle(ButtonStyle.Secondary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_set_footer').setLabel('Footer').setEmoji('📎').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row1, row2];
}

// ===== FIELDS =====
function buildFieldsMenu(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0xEB459E)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 📋 Fields\n**Add title + value pairs**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**Current fields:** ${data.fields?.length || 0}\n` +
      (data.fields?.length ? data.fields.map((f, i) => `${i + 1}. **${f.name}** → ${f.value.slice(0, 30)}...`).join('\n') : '*No fields yet*')
    ));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_add_field').setLabel('Add Field').setEmoji('➕').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('eb_clear_fields').setLabel('Clear All').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row];
}

// ===== BUTTONS =====
function buildButtonsMenu(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0x1ABC9C)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 🔗 Buttons\n**Link buttons**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**Current buttons:** ${data.buttons?.length || 0}\n` +
      (data.buttons?.length ? data.buttons.map((b, i) => `${i + 1}. **${b.label}** → ${b.url}`).join('\n') : '*No buttons yet*')
    ));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_add_button').setLabel('Add Button').setEmoji('➕').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('eb_clear_buttons').setLabel('Clear All').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row];
}

// ===== SECTIONS =====
function buildSectionsMenu(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0xEB459E)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ✨ V2 Sections\n**Sections with thumbnails**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**Current sections:** ${data.sections?.length || 0}`
    ));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_add_section').setLabel('Add Section').setEmoji('➕').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('eb_clear_sections').setLabel('Clear All').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row];
}

module.exports = {
  buildFront,
  buildContentMenu,
  buildMediaMenu,
  buildFieldsMenu,
  buildButtonsMenu,
  buildSectionsMenu,
  buildLivePreview,
};
