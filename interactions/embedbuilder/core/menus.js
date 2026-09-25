const {
  ContainerBuilder,
  TextDisplayBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require('discord.js');
const { makeSeparator } = require('./builders');

// ===== BLOCKS MENU =====
function buildBlocksMenu(data) {
  const isV2 = data.mode === 'v2';
  const isMsg = data.mode === 'msg';

  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🧱 Blocks\n**Add content blocks to your ${isMsg ? 'message' : 'embed'}**`)
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

  const options = [];

  if (isMsg) {
    options.push(
      { label: 'Text', value: 'text', emoji: '📄', description: 'Plain text content' },
      { label: 'Title', value: 'title', emoji: '📌', description: 'Large heading' },
      { label: 'Field', value: 'field', emoji: '📋', description: 'Name + value pair' },
      { label: 'Footer', value: 'footer', emoji: '📎', description: 'Small italic text' }
    );
  } else if (isV2) {
    options.push(
      { label: 'Title', value: 'title', emoji: '📌', description: 'Large heading text' },
      { label: 'Text', value: 'text', emoji: '📄', description: 'Paragraph content' },
      { label: 'Separator', value: 'separator', emoji: '➖', description: 'Divider line' },
      { label: 'Thumbnail', value: 'thumbnail', emoji: '🔳', description: 'Small image on the right' },
      { label: 'Image', value: 'image', emoji: '🖼️', description: 'Large image' },
      { label: 'Author', value: 'author', emoji: '👤', description: 'Author name with icon' },
      { label: 'Field', value: 'field', emoji: '📋', description: 'Name + value pair' },
      { label: 'Section', value: 'section', emoji: '✨', description: 'Text with optional thumbnail' },
      { label: 'Footer', value: 'footer', emoji: '📎', description: 'Small italic text' }
    );
  } else {
    options.push(
      { label: 'Title', value: 'title', emoji: '📌', description: 'Large heading text' },
      { label: 'Text', value: 'text', emoji: '📄', description: 'Paragraph content' },
      { label: 'Thumbnail', value: 'thumbnail', emoji: '🔳', description: 'Small image on the right' },
      { label: 'Image', value: 'image', emoji: '🖼️', description: 'Large image' },
      { label: 'Author', value: 'author', emoji: '👤', description: 'Author name with icon' },
      { label: 'Field', value: 'field', emoji: '📋', description: 'Name + value pair' },
      { label: 'Footer', value: 'footer', emoji: '📎', description: 'Small italic text' }
    );
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('eb_block_select')
    .setPlaceholder('Choose a block type to add')
    .addOptions(options);

  const selectRow = new ActionRowBuilder().addComponents(selectMenu);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_manage_blocks').setLabel('Manage Blocks').setEmoji('🔧').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_clear_blocks').setLabel('Clear All').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_back_builder').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Secondary)
  );

  return [container, selectRow, row];
}

// ===== MANAGE BLOCKS =====
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

// ===== BUTTONS MENU =====
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

module.exports = {
  buildBlocksMenu,
  buildManageBlocksMenu,
  buildButtonsMenu,
  buildStyleMenu,
  buildHistoryPanel,
};
