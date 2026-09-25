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
  StringSelectMenuBuilder,
  UserSelectMenuBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
} = require('discord.js');

// ===== SAFE SEPARATOR =====
function makeSeparator() {
  return new SeparatorBuilder()
    .setSpacing(SeparatorSpacingSize.Small)
    .setDivider(true);
}

// ===== SAFE THUMBNAIL =====
function makeThumbnail(url) {
  if (!url) return null;
  try {
    return new ThumbnailBuilder().setURL(url);
  } catch {
    return null;
  }
}

// ===== BUILD EMBED FROM BLOCKS =====
function buildEmbedFromBlocks(data) {
  const container = new ContainerBuilder().setAccentColor(data.color || 0xFFFFFF);
  const blocks = data.blocks || [];

  for (const block of blocks) {
    try {
      if (block.type === 'title' && block.content) {
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`# ${block.content}`)
        );
      }
      else if (block.type === 'text' && block.content) {
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(block.content)
        );
      }
      else if (block.type === 'separator') {
        container.addSeparatorComponents(makeSeparator());
      }
      else if (block.type === 'thumbnail' && block.url) {
        const thumb = makeThumbnail(block.url);
        if (thumb) {
          container.addSectionComponents(
            new SectionBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(block.label ? `**${block.label}**` : '\u200b')
              )
              .setThumbnailAccessory(thumb)
          );
        }
      }
      else if (block.type === 'image' && block.url) {
        try {
          container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder().setURL(block.url)
            )
          );
        } catch {}
      }
      else if (block.type === 'author' && block.name) {
        const thumb = makeThumbnail(block.icon);
        const sb = new SectionBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**${block.name}**`)
        );
        if (thumb) sb.setThumbnailAccessory(thumb);
        container.addSectionComponents(sb);
      }
      else if (block.type === 'field' && block.name) {
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**${block.name}**\n${block.value || ''}`)
        );
      }
      else if (block.type === 'section' && block.text) {
        const thumb = makeThumbnail(block.thumbnail);
        const sb = new SectionBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(block.text)
        );
        if (thumb) sb.setThumbnailAccessory(thumb);
        container.addSectionComponents(sb);
      }
    } catch (err) {
      console.error('Block error:', block.type, err.message);
    }
  }

  if (blocks.length === 0) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*No content yet — start building below.*`)
    );
  }

  // Buttons
  const rows = [container];

  if (data.buttons?.length) {
    const roleButtons = [];
    const linkButtons = [];

    for (const btn of data.buttons) {
      if (btn.type === 'link' && btn.url) {
        linkButtons.push(btn);
      } else if (btn.type === 'role' && btn.roleId) {
        roleButtons.push(btn);
      }
    }

    if (roleButtons.length) {
      const row = new ActionRowBuilder();
      for (const b of roleButtons.slice(0, 5)) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`eb_action_role_${b.roleId}_${b.action}`)
            .setLabel(b.label || 'Role')
            .setStyle(
              b.action === 'add' ? ButtonStyle.Success :
              b.action === 'remove' ? ButtonStyle.Danger :
              ButtonStyle.Primary
            )
        );
      }
      rows.push(row);
    }

    if (linkButtons.length) {
      const row = new ActionRowBuilder();
      for (const b of linkButtons.slice(0, 5)) {
        row.addComponents(
          new ButtonBuilder()
            .setLabel(b.label)
            .setURL(b.url)
            .setStyle(ButtonStyle.Link)
        );
      }
      rows.push(row);
    }
  }

  return rows;
}

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
        `Classic embeds with full features\n\n` +
        `**✨ V2 Builder**\n` +
        `Components V2 with blocks, sections, and nesting\n\n` +
        `**✏️ Edit Existing**\n` +
        `Modify old messages by channel ID + message ID`
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
    new ButtonBuilder().setCustomId('eb_start_edit').setLabel('Edit Existing').setEmoji('✏️').setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_start_import').setLabel('Import JSON').setEmoji('📥').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_start_help').setLabel('Help').setEmoji('❓').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row1, row2];
}

// ===== BUILDER PAGE =====
function buildBuilderPage(data, mode = 'v1') {
  const isV2 = mode === 'v2';
  const rows = buildEmbedFromBlocks(data);

  const header = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `### ${isV2 ? '✨ V2 Builder' : '📋 V1 Builder'}\n` +
        `*Blocks: ${data.blocks?.length || 0} · Buttons: ${data.buttons?.length || 0}*`
      )
    );

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

  return [header, ...rows, row1, row2, row3];
}

// ===== BLOCKS MENU (with Select Menu) =====
function buildBlocksMenu(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🧱 Blocks\n**Add content blocks to your embed**`)
    )
    .addSeparatorComponents(makeSeparator())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Current blocks:** ${data.blocks?.length || 0}\n` +
        (data.blocks?.length
          ? data.blocks.map((b, i) => {
              const preview = b.content || b.text || b.name || b.url || '';
              return `**${i + 1}.** ${b.type}${preview ? ' — ' + preview.slice(0, 30) : ''}`;
            }).join('\n')
          : '*No blocks yet — use the dropdown below*')
      )
    );

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('eb_block_select')
    .setPlaceholder('Choose a block type to add')
    .addOptions([
      { label: 'Title', value: 'title', emoji: '📌', description: 'Large heading text' },
      { label: 'Text', value: 'text', emoji: '📄', description: 'Paragraph content' },
      { label: 'Separator', value: 'separator', emoji: '➖', description: 'Divider line' },
      { label: 'Thumbnail', value: 'thumbnail', emoji: '🔳', description: 'Small image on the right' },
      { label: 'Image', value: 'image', emoji: '🖼️', description: 'Large image' },
      { label: 'Author', value: 'author', emoji: '👤', description: 'Author name with icon' },
      { label: 'Field', value: 'field', emoji: '📋', description: 'Name + value pair' },
      { label: 'Section', value: 'section', emoji: '✨', description: 'Text with optional thumbnail' },
    ]);

  const selectRow = new ActionRowBuilder().addComponents(selectMenu);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_manage_blocks').setLabel('Manage Blocks').setEmoji('🔧').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_clear_blocks').setLabel('Clear All').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_back_builder').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Secondary)
  );

  return [container, selectRow, row];
}

// ===== MANAGE BLOCKS (with Position Select) =====
function buildManageBlocksMenu(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🔧 Manage Blocks\n**Reorder or delete blocks**`)
    )
    .addSeparatorComponents(makeSeparator());

  if (data.blocks?.length) {
    for (let i = 0; i < data.blocks.length; i++) {
      const b = data.blocks[i];
      const preview = b.content || b.text || b.name || b.url || '';
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Position ${i + 1}** — ${b.type}${preview ? ' — ' + preview.slice(0, 30) : ''}`
        )
      );
    }
  } else {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*No blocks yet*`)
    );
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('eb_manage_select')
    .setPlaceholder('Choose an action')
    .addOptions([
      { label: 'Move Block', value: 'move', emoji: '🔀', description: 'Move a block to a new position' },
      { label: 'Delete Block', value: 'delete', emoji: '🗑️', description: 'Remove a block' },
      { label: 'Swap Blocks', value: 'swap', emoji: '🔄', description: 'Swap two blocks' },
    ]);

  const selectRow = new ActionRowBuilder().addComponents(selectMenu);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_back_blocks').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Secondary)
  );

  return [container, selectRow, row];
}

// ===== BUTTONS MENU (with Select) =====
function buildButtonsMenu(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🔗 Buttons\n**Add link and role buttons**`)
    )
    .addSeparatorComponents(makeSeparator())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Current buttons:** ${data.buttons?.length || 0}\n` +
        (data.buttons?.length
          ? data.buttons.map((b, i) => {
              const type = b.type === 'link' ? '🔗 Link' : b.type === 'role' ? `🎭 Role (${b.action})` : '❓';
              return `**${i + 1}.** ${b.label} — ${type}`;
            }).join('\n')
          : '*No buttons yet — use the dropdown below*')
      )
    );

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('eb_button_select')
    .setPlaceholder('Choose a button type to add')
    .addOptions([
      { label: 'Link Button', value: 'link', emoji: '🔗', description: 'Direct URL button' },
      { label: 'Add Role', value: 'role_add', emoji: '➕', description: 'Add a role when clicked' },
      { label: 'Remove Role', value: 'role_remove', emoji: '➖', description: 'Remove a role when clicked' },
      { label: 'Toggle Role', value: 'role_toggle', emoji: '🔄', description: 'Add or remove a role' },
    ]);

  const selectRow = new ActionRowBuilder().addComponents(selectMenu);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_clear_buttons').setLabel('Clear All').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_back_builder').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Secondary)
  );

  return [container, selectRow, row];
}

// ===== STYLE MENU =====
function buildStyleMenu(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🎨 Style\n**Customize embed color**`)
    )
    .addSeparatorComponents(makeSeparator())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Current color:** ${data.color ? '#' + data.color.toString(16).padStart(6, '0').toUpperCase() : '#FFFFFF (default)'}`
      )
    );

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('eb_color_select')
    .setPlaceholder('Choose a color')
    .addOptions([
      { label: 'White', value: 'FFFFFF', emoji: '⚪' },
      { label: 'Blurple', value: '5865F2', emoji: '🔵' },
      { label: 'Red', value: 'ED4245', emoji: '🔴' },
      { label: 'Green', value: '57F287', emoji: '🟢' },
      { label: 'Purple', value: '9B59B6', emoji: '🟣' },
      { label: 'Pink', value: 'EB459E', emoji: '🌸' },
      { label: 'Yellow', value: 'FEE75C', emoji: '🟡' },
      { label: 'Orange', value: 'E67E22', emoji: '🟠' },
      { label: 'Cyan', value: '1ABC9C', emoji: '💠' },
    ]);

  const selectRow = new ActionRowBuilder().addComponents(selectMenu);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_color_custom').setLabel('Custom Color').setEmoji('🎨').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_back_builder').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Secondary)
  );

  return [container, selectRow, row];
}

// ===== HISTORY PANEL =====
function buildHistoryPanel(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 📜 History\n**Your recent edits**`)
    )
    .addSeparatorComponents(makeSeparator());

  if (data.history?.length) {
    for (const h of data.history.slice(-15).reverse()) {
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`➡️ **${h.field}** → \`${h.value}\``)
      );
    }
  } else {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*No history yet*`)
    );
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_clear_history').setLabel('Clear History').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_back_builder').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Secondary)
  );

  return [container, row];
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
        `V1 = Classic embed layout\n` +
        `V2 = Components V2 with nested sections\n\n` +
        `**2. Add Content Blocks**\n` +
        `Use the dropdown menu to add blocks like Title, Text, Image, etc.\n\n` +
        `**3. Manage Blocks**\n` +
        `Move any block to a specific position using the Manage Blocks menu.\n\n` +
        `**4. Add Buttons**\n` +
        `Link buttons (URLs) or role buttons (add/remove/toggle roles).\n\n` +
        `**5. Style**\n` +
        `Pick a color from the dropdown or set a custom hex color.\n\n` +
        `**6. Send or Edit**\n` +
        `Send to current channel, send to a specific channel, or edit an existing message.\n\n` +
        `**Pro Features:**\n` +
        `• Export JSON to save your design\n` +
        `• Import JSON to reload it later\n` +
        `• History tracks every change you make`
      )
    )
    .addSeparatorComponents(makeSeparator());

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_home').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Secondary)
  );

  return [container, row];
}

module.exports = {
  buildEmbedFromBlocks,
  buildStartPage,
  buildBuilderPage,
  buildBlocksMenu,
  buildManageBlocksMenu,
  buildButtonsMenu,
  buildStyleMenu,
  buildHistoryPanel,
  buildHelpPage,
  makeSeparator,
  makeThumbnail,
};
