const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SeparatorBuilder,
} = require('discord.js');

// ===== SAFE SEPARATOR =====
function makeSeparator() {
  try {
    const sep = new SeparatorBuilder();
    if (typeof sep.setSpacing === 'function') sep.setSpacing(1);
    if (typeof sep.setDivider === 'function') sep.setDivider(true);
    return sep;
  } catch (err) {
    console.error('Separator error:', err.message);
    return { type: 14, divider: true, spacing: 1 };
  }
}

// ===== SAFE THUMBNAIL =====
function makeThumbnail(url) {
  if (!url) return null;
  try {
    return new ThumbnailBuilder().setURL(url);
  } catch (err) {
    return null;
  }
}

// ===== BLOCK DEFINITIONS =====
const V1_BLOCKS = ['title', 'text', 'field', 'author', 'thumbnail', 'image', 'footer'];
const V2_BLOCKS = ['title', 'text', 'separator', 'thumbnail', 'image', 'author', 'field', 'section', 'footer'];

// ===== BUILD EMBED FROM BLOCKS =====
function buildEmbedFromBlocks(data) {
  const container = new ContainerBuilder().setAccentColor(data.color || 0xFFFFFF);
  const blocks = data.blocks || [];
  const isV2 = data.mode === 'v2';

  for (const block of blocks) {
    try {
      if (isV2 && !V2_BLOCKS.includes(block.type)) continue;
      if (!isV2 && !V1_BLOCKS.includes(block.type)) continue;

      if (block.type === 'title' && block.content) {
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${block.content}`));
      }
      else if (block.type === 'text' && block.content) {
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(block.content));
      }
      else if (block.type === 'separator') {
        container.addSeparatorComponents(makeSeparator());
      }
      else if (block.type === 'thumbnail' && block.url) {
        const thumb = makeThumbnail(block.url);
        if (thumb) {
          container.addSectionComponents(
            new SectionBuilder()
              .addTextDisplayComponents(new TextDisplayBuilder().setContent(block.label ? `**${block.label}**` : '\u200b'))
              .setThumbnailAccessory(thumb)
          );
        }
      }
      else if (block.type === 'image' && block.url) {
        try {
          container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(block.url))
          );
        } catch (err) {
          console.error('Image error:', err.message);
        }
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
      else if (block.type === 'footer' && block.content) {
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`*${block.content}*`)
        );
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

  const rows = [container];

  if (data.buttons?.length) {
    const roleButtons = [];
    const linkButtons = [];

    for (const btn of data.buttons) {
      if (btn.type === 'link' && btn.url) linkButtons.push(btn);
      else if (btn.type === 'role' && btn.roleId) roleButtons.push(btn);
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
          new ButtonBuilder().setLabel(b.label).setURL(b.url).setStyle(ButtonStyle.Link)
        );
      }
      rows.push(row);
    }
  }

  return rows;
}

// ===== BUILD MESSAGE ONLY =====
function buildMessageOnly(data) {
  let text = '';
  for (const block of data.blocks || []) {
    if (block.type === 'title' && block.content) text += `# ${block.content}\n`;
    else if (block.type === 'text' && block.content) text += `${block.content}\n`;
    else if (block.type === 'field' && block.name) text += `**${block.name}**\n${block.value || ''}\n`;
    else if (block.type === 'footer' && block.content) text += `*${block.content}*\n`;
  }

  const rows = [];
  if (data.buttons?.length) {
    const roleButtons = [];
    const linkButtons = [];
    for (const btn of data.buttons) {
      if (btn.type === 'link' && btn.url) linkButtons.push(btn);
      else if (btn.type === 'role' && btn.roleId) roleButtons.push(btn);
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
          new ButtonBuilder().setLabel(b.label).setURL(b.url).setStyle(ButtonStyle.Link)
        );
      }
      rows.push(row);
    }
  }

  return { content: text || '*No content*', components: rows };
}

module.exports = {
  makeSeparator,
  makeThumbnail,
  buildEmbedFromBlocks,
  buildMessageOnly,
  V1_BLOCKS,
  V2_BLOCKS,
};
