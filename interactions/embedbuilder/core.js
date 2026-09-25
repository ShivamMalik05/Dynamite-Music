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

// ===== CLEAN EMBED =====
function buildCleanEmbed(data) {
  const isV2 = data.mode === 'v2';
  const container = new ContainerBuilder().setAccentColor(data.color || (isV2 ? 0x9B59B6 : 0x5865F2));

  if (data.title) container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${data.title}`));
  if (data.description) container.addTextDisplayComponents(new TextDisplayBuilder().setContent(data.description));

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

  if (data.footer) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(data.footer));
  }

  // ===== BUTTONS (Link, Add Role, Remove Role, Toggle Role) =====
  const rows = [container];

  if (data.buttons?.length) {
    const actionButtons = [];
    const linkButtons = [];

    for (const btn of data.buttons) {
      if (btn.type === 'link') {
        linkButtons.push(btn);
      } else if (btn.type === 'role') {
        actionButtons.push(
          new ButtonBuilder()
            .setCustomId(`eb_action_role_${btn.roleId}_${btn.action}_${data.userId || 'user'}`)
            .setLabel(btn.label)
            .setStyle(
              btn.action === 'add' ? ButtonStyle.Success :
              btn.action === 'remove' ? ButtonStyle.Danger :
              ButtonStyle.Primary
            )
        );
      }
    }

    // Action buttons (roles)
    if (actionButtons.length) {
      const row = new ActionRowBuilder();
      for (const b of actionButtons.slice(0, 5)) row.addComponents(b);
      rows.push(row);
    }

    // Link buttons
    if (linkButtons.length) {
      const row = new ActionRowBuilder();
      for (const b of linkButtons.slice(0, 5)) row.addComponents(
        new ButtonBuilder().setLabel(b.label).setURL(b.url).setStyle(ButtonStyle.Link)
      );
      rows.push(row);
    }
  }

  return rows;
}

// ===== FRONT PAGE =====
function buildFront(data) {
  const isV2 = data.mode === 'v2';
  const container = new ContainerBuilder().setAccentColor(data.color || (isV2 ? 0x9B59B6 : 0x5865F2));

  if (data.title) container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${data.title}`));
  if (data.description) container.addTextDisplayComponents(new TextDisplayBuilder().setContent(data.description));

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

  if (data.footer) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(data.footer));
  }

  if (!data.title && !data.description && !data.fields?.length && !data.image && !data.thumbnail && !data.author) {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`*No content yet — start editing below.*`));
  }

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_open_v1').setLabel('Classic (V1)').setEmoji('📋').setStyle(isV2 ? ButtonStyle.Secondary : ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_open_v2').setLabel('Modern (V2)').setEmoji('✨').setStyle(isV2 ? ButtonStyle.Success : ButtonStyle.Secondary),
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
    new ButtonBuilder().setCustomId('eb_history').setLabel('History').setEmoji('📜').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_reset').setLabel('Reset').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row1, row2, row3];
}

// ===== HISTORY PANEL =====
function buildHistoryPanel(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0xEB459E)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 📜 History\n**Your recent edits**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

  if (data.history?.length) {
    for (const h of data.history.slice(-15).reverse()) {
      container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `${emojis.arrowRight} **${h.field}** → \`${h.value}\``
      ));
    }
  } else {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`*No history yet — start editing!*`));
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_clear_history').setLabel('Clear History').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
  );

  return [container, row];
}

// ===== SUB MENUS =====
function buildContentMenu(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 📝 Content\n**Title, Description, Color**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**Title:** ${data.title || '*Not set*'}\n` +
      `**Description:** ${data.description ? data.description.slice(0, 50) + '...' : '*Not set*'}\n` +
      `**Color:** ${data.color ? '#' + data.color.toString(16).padStart(6, '0') : '*Not set*'}`
    ));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_set_title').setLabel('Title').setEmoji('📌').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_set_desc').setLabel('Description').setEmoji('📄').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_set_color').setLabel('Color').setEmoji('🎨').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row];
}

function buildMediaMenu(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0x9B59B6)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 🖼️ Media\n**Author, Thumbnail, Image, Footer**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**Author:** ${data.author || '*Not set*'}\n` +
      `**Thumbnail:** ${data.thumbnail ? '✅ Set' : '*Not set*'}\n` +
      `**Image:** ${data.image ? '✅ Set' : '*Not set*'}\n` +
      `**Footer:** ${data.footer || '*Not set*'}`
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

function buildFieldsMenu(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0xEB459E)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 📋 Fields\n**Add title + value pairs**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**Fields:** ${data.fields?.length || 0}\n` +
      (data.fields?.length ? data.fields.map((f, i) => `${i + 1}. **${f.name}** → ${f.value.slice(0, 30)}`).join('\n') : '*No fields yet*')
    ));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_add_field').setLabel('Add Field').setEmoji('➕').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('eb_clear_fields').setLabel('Clear All').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row];
}

// ===== BUTTONS MENU (updated — 4 options) =====
function buildButtonsMenu(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0x1ABC9C)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 🔗 Buttons\n**Add buttons to your embed**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**Current buttons:** ${data.buttons?.length || 0}\n` +
      (data.buttons?.length
        ? data.buttons.map((b, i) => {
            const type = b.type === 'link' ? '🔗 Link' : b.type === 'role' ? `🎭 Role (${b.action})` : '❓';
            return `${i + 1}. **${b.label}** — ${type}`;
          }).join('\n')
        : '*No buttons yet*')
    ))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**Add new:**\n` +
      `🔗 **Paste Link** — Link button\n` +
      `➕ **Add Role** — Role add button\n` +
      `➖ **Remove Role** — Role remove button\n` +
      `🔄 **Toggle Role** — Role toggle button`
    ));

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_add_button').setLabel('Paste Link').setEmoji('🔗').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_add_role').setLabel('Add Role').setEmoji('➕').setStyle(ButtonStyle.Success)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_remove_role').setLabel('Remove Role').setEmoji('➖').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_toggle_role').setLabel('Toggle Role').setEmoji('🔄').setStyle(ButtonStyle.Primary)
  );
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_clear_buttons').setLabel('Clear All').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row1, row2, row3];
}

module.exports = {
  buildCleanEmbed,
  buildFront,
  buildHistoryPanel,
  buildContentMenu,
  buildMediaMenu,
  buildFieldsMenu,
  buildButtonsMenu,
};
