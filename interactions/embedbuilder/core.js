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

// ===== SAFE BUILDERS (undefined se bachne ke liye) =====
function safeSeparator() {
  try {
    return new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
  } catch {
    return new SeparatorBuilder().setSpacing(1).setDivider(true);
  }
}

function safeThumbnail(url) {
  if (!url) return null;
  try {
    return new ThumbnailBuilder().setURL(url);
  } catch {
    return null;
  }
}

// ===== BUILD EMBED FROM BLOCKS =====
function buildEmbedFromBlocks(data, forSend = true) {
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
        container.addSeparatorComponents(safeSeparator());
      }
      else if (block.type === 'thumbnail' && block.url) {
        const thumb = safeThumbnail(block.url);
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
        const thumb = safeThumbnail(block.icon);
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
        const thumb = safeThumbnail(block.thumbnail);
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
      new TextDisplayBuilder().setContent(`*No content yet — add blocks below.*`)
    );
  }

  // Buttons
  const rows = [container];

  if (data.buttons?.length) {
    const actionButtons = [];
    const linkButtons = [];

    for (const btn of data.buttons) {
      if (btn.type === 'link' && btn.url) {
        linkButtons.push(btn);
      } else if (btn.type === 'role' && btn.roleId) {
        actionButtons.push(
          new ButtonBuilder()
            .setCustomId(`eb_action_role_${btn.roleId}_${btn.action}`)
            .setLabel(btn.label || 'Role')
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
      for (const b of linkButtons.slice(0, 5)) {
        row.addComponents(
          new ButtonBuilder().setLabel(b.label).setURL(b.url).setStyle(ButtonStyle.Link)
        );
      }
      rows.push(row);
    }
  }

  return rows;
}

// ===== START PAGE (pehla view) =====
function buildStartPage() {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# 🎨 Ultimate Embed Builder\n` +
        `**Create beautiful embeds — Discord par aaj tak jo nahi bana**`
      )
    )
    .addSeparatorComponents(safeSeparator())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Features:**\n` +
        `📋 **V1 Builder** — Classic embed (title, desc, fields, author, footer)\n` +
        `✨ **V2 Builder** — Components V2 (blocks, sections, separators, media)\n` +
        `✏️ **Edit Existing** — Channel ID + Message ID se purana embed edit karo\n` +
        `📤 **Re-send** — Edited embed ko dobara bhejo\n` +
        `🎭 **Role Buttons** — Add/Remove/Toggle role buttons\n` +
        `🔗 **Link Buttons** — Custom link buttons\n` +
        `📜 **History** — Saare edits track karo\n` +
        `💾 **Export/Import JSON** — Apna embed save aur load karo\n\n` +
        `*Choose an option below to begin.*`
      )
    )
    .addSeparatorComponents(safeSeparator())
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

// ===== BUILDER PAGE (V1 ya V2) =====
function buildBuilderPage(data, mode = 'v1') {
  const isV2 = mode === 'v2';
  const rows = buildEmbedFromBlocks(data);

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_blocks').setLabel('Blocks').setEmoji('🧱').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_buttons').setLabel('Buttons').setEmoji('🔗').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_style').setLabel('Style').setEmoji('🎨').setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_manage_blocks').setLabel('Manage').setEmoji('🔧').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_history').setLabel('History').setEmoji('📜').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_export').setLabel('Export JSON').setEmoji('💾').setStyle(ButtonStyle.Secondary)
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_preview').setLabel('Send').setEmoji('📤').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('eb_send_channel').setLabel('Send to Channel').setEmoji('📨').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_reset').setLabel('Reset').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_home').setLabel('Home').setEmoji('🏠').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [...rows, row1, row2, row3];
}

// ===== BLOCKS MENU =====
function buildBlocksMenu(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🧱 Blocks\n**Add content blocks to your embed**`)
    )
    .addSeparatorComponents(safeSeparator())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Current blocks:** ${data.blocks?.length || 0}\n` +
        (data.blocks?.length
          ? data.blocks.map((b, i) => {
              const preview = b.content || b.text || b.name || b.url || '';
              return `**${i + 1}.** ${b.type}${preview ? ' — ' + preview.slice(0, 30) : ''}`;
            }).join('\n')
          : '*No blocks yet*')
      )
    )
    .addSeparatorComponents(safeSeparator())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Available blocks:**\n` +
        `📌 Title  ·  📄 Text  ·  ➖ Separator\n` +
        `🔳 Thumbnail  ·  🖼️ Image  ·  👤 Author\n` +
        `📋 Field  ·  ✨ Section`
      )
    );

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
    new ButtonBuilder().setCustomId('eb_back_builder').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row1, row2, row3, row4];
}

// ===== MANAGE BLOCKS =====
function buildManageBlocksMenu(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🔧 Manage Blocks\n**Reorder or delete blocks**`)
    )
    .addSeparatorComponents(safeSeparator());

  if (data.blocks?.length) {
    for (let i = 0; i < data.blocks.length; i++) {
      const b = data.blocks[i];
      const preview = b.content || b.text || b.name || b.url || '';
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${i + 1}.** ${b.type}${preview ? ' — ' + preview.slice(0, 30) : ''}`
        )
      );
    }
  } else {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*No blocks yet*`)
    );
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_move_up').setLabel('Move Up').setEmoji('⬆️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_move_down').setLabel('Move Down').setEmoji('⬇️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_delete_block').setLabel('Delete').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_back_blocks').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row];
}

// ===== BUTTONS MENU =====
function buildButtonsMenu(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🔗 Buttons\n**Add link and role buttons**`)
    )
    .addSeparatorComponents(safeSeparator())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Current buttons:** ${data.buttons?.length || 0}\n` +
        (data.buttons?.length
          ? data.buttons.map((b, i) => {
              const type = b.type === 'link' ? '🔗 Link' : b.type === 'role' ? `🎭 Role (${b.action})` : '❓';
              return `**${i + 1}.** ${b.label} — ${type}`;
            }).join('\n')
          : '*No buttons yet*')
      )
    );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_add_button').setLabel('Link Button').setEmoji('🔗').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_add_role').setLabel('Add Role').setEmoji('➕').setStyle(ButtonStyle.Success)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_remove_role').setLabel('Remove Role').setEmoji('➖').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_toggle_role').setLabel('Toggle Role').setEmoji('🔄').setStyle(ButtonStyle.Primary)
  );
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_clear_buttons').setLabel('Clear All').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_back_builder').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row1, row2, row3];
}

// ===== STYLE MENU =====
function buildStyleMenu(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🎨 Style\n**Customize embed color**`)
    )
    .addSeparatorComponents(safeSeparator())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Current color:** ${data.color ? '#' + data.color.toString(16).padStart(6, '0').toUpperCase() : '#FFFFFF (default)'}`
      )
    );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_color_white').setLabel('White').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_color_blue').setLabel('Blurple').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_color_red').setLabel('Red').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_color_green').setLabel('Green').setStyle(ButtonStyle.Success)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_color_purple').setLabel('Purple').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_color_pink').setLabel('Pink').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_color_yellow').setLabel('Yellow').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('eb_color_custom').setLabel('Custom').setEmoji('🎨').setStyle(ButtonStyle.Secondary)
  );
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_back_builder').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row1, row2, row3];
}

// ===== HISTORY =====
function buildHistoryPanel(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 📜 History\n**Your recent edits**`)
    )
    .addSeparatorComponents(safeSeparator());

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
    new ButtonBuilder().setCustomId('eb_back_builder').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_clear_history').setLabel('Clear').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
  );

  return [container, row];
}

// ===== HELP =====
function buildHelpPage() {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ❓ Help\n**How to use the Embed Builder**`)
    )
    .addSeparatorComponents(safeSeparator())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**1. Choose Mode**\n` +
        `V1 = Classic embed · V2 = Components V2\n\n` +
        `**2. Add Blocks**\n` +
        `Each block is a piece of content (title, text, image, etc.)\n\n` +
        `**3. Reorder Blocks**\n` +
        `Use Manage Blocks to change position\n\n` +
        `**4. Add Buttons**\n` +
        `Link buttons, role buttons (add/remove/toggle)\n\n` +
        `**5. Send or Edit**\n` +
        `Send to current channel, specific channel, or edit existing message\n\n` +
        `**💡 Pro Tip:**\n` +
        `Use Export JSON to save your embed and Import JSON to load it later.`
      )
    )
    .addSeparatorComponents(safeSeparator());

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_home').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
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
  safeSeparator,
  safeThumbnail,
};
