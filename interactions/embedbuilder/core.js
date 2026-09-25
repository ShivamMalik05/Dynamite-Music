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

// ===== BLOCK BUILDERS =====

function blockTitle(text) {
  return new TextDisplayBuilder().setContent(`# ${text}`);
}

function blockText(text) {
  return new TextDisplayBuilder().setContent(text);
}

function blockSeparator() {
  return new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
}

function blockThumbnail(label, url) {
  return new SectionBuilder()
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(label ? `**${label}**` : ''))
    .setThumbnailAccessory(new ThumbnailBuilder().setURL(url));
}

function blockImage(url) {
  return new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(url));
}

function blockAuthor(name, iconUrl) {
  const sb = new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`**${name}**`));
  if (iconUrl) sb.setThumbnailAccessory(new ThumbnailBuilder().setURL(iconUrl));
  return sb;
}

// ===== BUILD EMBED FROM BLOCKS =====
function buildEmbedFromBlocks(data, isPreview = false) {
  const isV2 = data.mode === 'v2';
  const container = new ContainerBuilder().setAccentColor(data.color || (isV2 ? 0x9B59B6 : 0x5865F2));

  // Blocks ko order mein lagao
  const blocks = data.blocks || [];

  for (const block of blocks) {
    try {
      if (block.type === 'title' && block.content) {
        container.addTextDisplayComponents(blockTitle(block.content));
      }
      else if (block.type === 'text' && block.content) {
        container.addTextDisplayComponents(blockText(block.content));
      }
      else if (block.type === 'separator') {
        container.addSeparatorComponents(blockSeparator());
      }
      else if (block.type === 'thumbnail' && block.url) {
        container.addSectionComponents(blockThumbnail(block.label, block.url));
      }
      else if (block.type === 'image' && block.url) {
        container.addMediaGalleryComponents(blockImage(block.url));
      }
      else if (block.type === 'author' && block.name) {
        container.addSectionComponents(blockAuthor(block.name, block.icon));
      }
      else if (block.type === 'field' && block.name) {
        container.addTextDisplayComponents(blockText(`**${block.name}**\n${block.value || ''}`));
      }
      else if (block.type === 'section' && block.text) {
        const sb = new SectionBuilder().addTextDisplayComponents(blockText(block.text));
        if (block.thumbnail) sb.setThumbnailAccessory(new ThumbnailBuilder().setURL(block.thumbnail));
        container.addSectionComponents(sb);
      }
    } catch (err) {
      console.error('Block error:', err);
    }
  }

  // Empty state
  if (blocks.length === 0) {
    container.addTextDisplayComponents(blockText(`*No content yet — add blocks below.*`));
  }

  // Buttons
  const rows = [container];

  if (data.buttons?.length) {
    const actionButtons = [];
    const linkButtons = [];

    for (const btn of data.buttons) {
      if (btn.type === 'link') linkButtons.push(btn);
      else if (btn.type === 'role') {
        actionButtons.push(
          new ButtonBuilder()
            .setCustomId(`eb_action_role_${btn.roleId}_${btn.action}`)
            .setLabel(btn.label)
            .setStyle(
              btn.action === 'add' ? ButtonStyle.Success :
              btn.action === 'remove' ? ButtonStyle.Danger :
              ButtonStyle.Primary
            )
        );
      }
    }

    if (actionButtons.length) {
      const row = new ActionRowBuilder();
      for (const b of actionButtons.slice(0, 5)) row.addComponents(b);
      rows.push(row);
    }
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
  const rows = buildEmbedFromBlocks(data);

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_open_v1').setLabel('V1').setEmoji('📋').setStyle(isV2 ? ButtonStyle.Secondary : ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_open_v2').setLabel('V2').setEmoji('✨').setStyle(isV2 ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_edit_existing').setLabel('Edit Existing').setEmoji('✏️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_toggle_ephemeral').setLabel(data.ephemeral ? 'Eph: ON' : 'Eph: OFF').setEmoji('👁️').setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_blocks').setLabel('Blocks').setEmoji('🧱').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_buttons').setLabel('Buttons').setEmoji('🔗').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_history').setLabel('History').setEmoji('📜').setStyle(ButtonStyle.Secondary)
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_preview').setLabel('Send').setEmoji('📤').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('eb_send_channel').setLabel('Send to Channel').setEmoji('📨').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_reset').setLabel('Reset').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [...rows, row1, row2, row3];
}

// ===== BLOCKS MENU (Add blocks) =====
function buildBlocksMenu(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 🧱 Blocks\n**Add blocks to your embed**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**Current blocks:** ${data.blocks?.length || 0}\n` +
      (data.blocks?.length
        ? data.blocks.map((b, i) => `${i + 1}. **${b.type}**${b.content ? ' — ' + b.content.slice(0, 30) : ''}`).join('\n')
        : '*No blocks yet*')
    ))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**Add block:**\n` +
      `📌 Title  |  📄 Text  |  ➖ Separator\n` +
      `🔳 Thumbnail  |  🖼️ Image  |  👤 Author\n` +
      `📋 Field  |  ✨ Section`
    ));

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_add_block_title').setLabel('Title').setEmoji('📌').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_add_block_text').setLabel('Text').setEmoji('📄').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_add_block_separator').setLabel('Separator').setEmoji('➖').setStyle(ButtonStyle.Secondary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_add_block_thumbnail').setLabel('Thumbnail').setEmoji('🔳').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_add_block_image').setLabel('Image').setEmoji('🖼️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_add_block_author').setLabel('Author').setEmoji('👤').setStyle(ButtonStyle.Secondary)
  );
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_add_block_field').setLabel('Field').setEmoji('📋').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_add_block_section').setLabel('Section').setEmoji('✨').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_clear_blocks').setLabel('Clear All').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
  );
  const row4 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_manage_blocks').setLabel('Manage Blocks').setEmoji('🔧').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row1, row2, row3, row4];
}

// ===== MANAGE BLOCKS (Reorder, Delete) =====
function buildManageBlocksMenu(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0xEB459E)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 🔧 Manage Blocks\n**Reorder or delete blocks**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

  if (data.blocks?.length) {
    for (let i = 0; i < data.blocks.length; i++) {
      const b = data.blocks[i];
      container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `**${i + 1}.** ${b.type}${b.content ? ' — ' + b.content.slice(0, 30) : ''}`
      ));
    }
  } else {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`*No blocks*`));
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_move_up').setLabel('Move Up').setEmoji('⬆️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_move_down').setLabel('Move Down').setEmoji('⬇️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_delete_block').setLabel('Delete').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row];
}

// ===== BUTTONS MENU =====
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
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`*No history yet*`));
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_clear_history').setLabel('Clear History').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
  );

  return [container, row];
}

module.exports = {
  buildEmbedFromBlocks,
  buildFront,
  buildBlocksMenu,
  buildManageBlocksMenu,
  buildButtonsMenu,
  buildHistoryPanel,
};
