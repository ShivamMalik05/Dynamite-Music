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
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
} = require('discord.js');
const emojis = require('../emojis/emojis');

// ===== FRONT PAGE =====
function buildFront() {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.star} Embed Builder\n**Create and send custom messages or embeds**`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Welcome to the **Embed Builder** — a powerful tool to create and send custom messages, embeds, and Components V2 containers.\n\n` +
        `**What you can do:**\n` +
        `${emojis.arrowRight} Build fully custom embeds\n` +
        `${emojis.arrowRight} Add title, description, color, footer\n` +
        `${emojis.arrowRight} Add author, thumbnail, image\n` +
        `${emojis.arrowRight} Add fields with title + value\n` +
        `${emojis.arrowRight} Add link buttons\n` +
        `${emojis.arrowRight} Use V2 sections with thumbnails\n` +
        `${emojis.arrowRight} Preview before sending\n\n` +
        `*Click **Get Started** below to begin.*`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`));

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('embed_getstarted').setLabel('Get Started').setEmoji('🚀').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, buttons];
}

// ===== MAIN MENU =====
function buildMain() {
  const container = new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.star} Embed Builder — Main Menu\n**Choose what you want to add or do**`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `📝 **Content**\n${emojis.arrowRight} Title, Description, Color\n\n` +
        `🖼️ **Media**\n${emojis.arrowRight} Author, Thumbnail, Image, Footer\n\n` +
        `📋 **Fields**\n${emojis.arrowRight} Add fields with title + value\n\n` +
        `🔗 **Buttons**\n${emojis.arrowRight} Add link buttons\n\n` +
        `✨ **V2 Sections**\n${emojis.arrowRight} Sections with thumbnails\n\n` +
        `👁️ **Preview & Send**\n${emojis.arrowRight} Review before sending`
      )
    )
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

// ===== CONTENT MENU =====
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

// ===== MEDIA MENU =====
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

// ===== BUTTONS MENU =====
function buildButtonsMenu() {
  const container = new ContainerBuilder()
    .setAccentColor(0x1ABC9C)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 🔗 Buttons\n**Add link buttons to your embed**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Add link buttons (max 5 per row):`));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_add_button').setLabel('Add Button').setEmoji('➕').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('eb_clear_buttons').setLabel('Clear All').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_main').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row];
}

// ===== SECTIONS MENU =====
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

// ===== PREVIEW =====
function buildPreview(data) {
  const container = new ContainerBuilder().setAccentColor(data.color || 0x5865F2);

  // Header
  if (data.title) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${data.title}`)
    );
  }

  // Description
  if (data.description) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(data.description)
    );
  }

  // Fields
  if (data.fields && data.fields.length > 0) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    for (const field of data.fields) {
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${field.name}**\n${field.value}`)
      );
    }
  }

  // Sections
  if (data.sections && data.sections.length > 0) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    for (const section of data.sections) {
      const sb = new SectionBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(section.text)
      );
      if (section.thumbnail) {
        sb.setThumbnailAccessory(new ThumbnailBuilder().setURL(section.thumbnail));
      }
      container.addSectionComponents(sb);
    }
  }

  // Author
  if (data.author) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Author:** ${data.author}`)
    );
  }

  // Footer
  container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(data.footer || `*Powered by Dynamite Music*`)
  );

  // Preview buttons
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_send').setLabel('Send').setEmoji('📤').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('eb_send_channel').setLabel('Send to Channel').setEmoji('📨').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_main').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  // Link buttons (if any)
  const rows = [container, row];
  if (data.buttons && data.buttons.length > 0) {
    const linkRow = new ActionRowBuilder();
    for (const btn of data.buttons.slice(0, 5)) {
      linkRow.addComponents(
        new ButtonBuilder().setLabel(btn.label).setURL(btn.url).setStyle(ButtonStyle.Link)
      );
    }
    rows.push(linkRow);
  }

  return rows;
}

// ===== MODALS =====
const MODAL_CONFIGS = {
  eb_set_title: { id: 'modal_eb_title', title: 'Set Title', fields: [
    { id: 'title', label: 'Title', style: TextInputStyle.Short, required: true },
  ]},
  eb_set_desc: { id: 'modal_eb_desc', title: 'Set Description', fields: [
    { id: 'description', label: 'Description', style: TextInputStyle.Paragraph, required: true },
  ]},
  eb_set_color: { id: 'modal_eb_color', title: 'Set Color', fields: [
    { id: 'color', label: 'Hex color (like #5865F2)', style: TextInputStyle.Short, required: true },
  ]},
  eb_set_author: { id: 'modal_eb_author', title: 'Set Author', fields: [
    { id: 'author', label: 'Author name', style: TextInputStyle.Short, required: true },
    { id: 'author_icon', label: 'Author icon URL (optional)', style: TextInputStyle.Short, required: false },
  ]},
  eb_set_thumb: { id: 'modal_eb_thumb', title: 'Set Thumbnail', fields: [
    { id: 'thumbnail', label: 'Thumbnail image URL', style: TextInputStyle.Short, required: true },
  ]},
  eb_set_image: { id: 'modal_eb_image', title: 'Set Image', fields: [
    { id: 'image', label: 'Image URL', style: TextInputStyle.Short, required: true },
  ]},
  eb_set_footer: { id: 'modal_eb_footer', title: 'Set Footer', fields: [
    { id: 'footer', label: 'Footer text', style: TextInputStyle.Short, required: true },
  ]},
  eb_fields: { id: 'modal_eb_field', title: 'Add Field', fields: [
    { id: 'field_name', label: 'Field name', style: TextInputStyle.Short, required: true },
    { id: 'field_value', label: 'Field value', style: TextInputStyle.Paragraph, required: true },
  ]},
  eb_add_button: { id: 'modal_eb_btn', title: 'Add Link Button', fields: [
    { id: 'btn_label', label: 'Button label', style: TextInputStyle.Short, required: true },
    { id: 'btn_url', label: 'Button URL (https://...)', style: TextInputStyle.Short, required: true },
  ]},
  eb_add_section: { id: 'modal_eb_section', title: 'Add V2 Section', fields: [
    { id: 'section_text', label: 'Section text', style: TextInputStyle.Paragraph, required: true },
    { id: 'section_thumb', label: 'Thumbnail URL (optional)', style: TextInputStyle.Short, required: false },
  ]},
  eb_send_channel: { id: 'modal_eb_send', title: 'Send to Channel', fields: [
    { id: 'target_channel', label: 'Channel ID', style: TextInputStyle.Short, required: true },
  ]},
};

async function handleButton(interaction, client) {
  const id = interaction.customId;

  // Initialize builder data
  if (!client.embedBuilders) client.embedBuilders = new Map();
  if (!client.embedBuilders.has(interaction.user.id)) {
    client.embedBuilders.set(interaction.user.id, {
      title: null,
      description: null,
      color: null,
      author: null,
      authorIcon: null,
      thumbnail: null,
      image: null,
      footer: null,
      fields: [],
      buttons: [],
      sections: [],
    });
  }
  const data = client.embedBuilders.get(interaction.user.id);

  // Navigation
  if (id === 'embed_close') {
    client.embedBuilders.delete(interaction.user.id);
    await interaction.update({ components: [] });
    return true;
  }
  if (id === 'embed_getstarted' || id === 'eb_main') {
    await interaction.update({ components: buildMain(), flags: 1 << 15 });
    return true;
  }
  if (id === 'eb_back') {
    await interaction.update({ components: buildFront(), flags: 1 << 15 });
    return true;
  }
  if (id === 'eb_reset') {
    client.embedBuilders.set(interaction.user.id, {
      title: null, description: null, color: null, author: null, authorIcon: null,
      thumbnail: null, image: null, footer: null, fields: [], buttons: [], sections: [],
    });
    await interaction.update({ components: buildMain(), flags: 1 << 15 });
    return true;
  }
  if (id === 'eb_content') {
    await interaction.update({ components: buildContentMenu(), flags: 1 << 15 });
    return true;
  }
  if (id === 'eb_media') {
    await interaction.update({ components: buildMediaMenu(), flags: 1 << 15 });
    return true;
  }
  if (id === 'eb_fields') {
    await interaction.update({ components: buildButtonsMenu(), flags: 1 << 15 });
    return true;
  }
  if (id === 'eb_buttons') {
    await interaction.update({ components: buildButtonsMenu(), flags: 1 << 15 });
    return true;
  }
  if (id === 'eb_sections') {
    await interaction.update({ components: buildSectionsMenu(), flags: 1 << 15 });
    return true;
  }
  if (id === 'eb_clear_buttons') {
    data.buttons = [];
    await interaction.update({ components: buildButtonsMenu(), flags: 1 << 15 });
    return true;
  }
  if (id === 'eb_clear_sections') {
    data.sections = [];
    await interaction.update({ components: buildSectionsMenu(), flags: 1 << 15 });
    return true;
  }
  if (id === 'eb_preview') {
    await interaction.update({ components: buildPreview(data), flags: 1 << 15 });
    return true;
  }

  // Send
  if (id === 'eb_send') {
    try {
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

      const rows = [container];
      if (data.buttons?.length) {
        const linkRow = new ActionRowBuilder();
        for (const b of data.buttons.slice(0, 5)) linkRow.addComponents(new ButtonBuilder().setLabel(b.label).setURL(b.url).setStyle(ButtonStyle.Link));
        rows.push(linkRow);
      }

      await interaction.channel.send({ components: rows, flags: 1 << 15 });
      await interaction.reply({ content: `${emojis.success} Embed sent!`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Failed to send.', ephemeral: true });
    }
    return true;
  }

  // Modal openers
  const cfg = MODAL_CONFIGS[id];
  if (cfg) {
    const modal = new ModalBuilder().setCustomId(cfg.id).setTitle(cfg.title);
    for (const f of cfg.fields) {
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId(f.id).setLabel(f.label).setStyle(f.style).setRequired(f.required)
        )
      );
    }
    await interaction.showModal(modal);
    return true;
  }

  return false;
}

async function handleModal(interaction, client) {
  const data = client.embedBuilders?.get(interaction.user.id);
  if (!data) return interaction.reply({ content: 'Session expired. Please run `/embedbuilder` again.', ephemeral: true });

  try {
    const id = interaction.customId;

    if (id === 'modal_eb_title') data.title = interaction.fields.getTextInputValue('title');
    else if (id === 'modal_eb_desc') data.description = interaction.fields.getTextInputValue('description');
    else if (id === 'modal_eb_color') {
      const c = interaction.fields.getTextInputValue('color');
      data.color = c.startsWith('#') ? parseInt(c.slice(1), 16) : 0x5865F2;
    }
    else if (id === 'modal_eb_author') {
      data.author = interaction.fields.getTextInputValue('author');
      data.authorIcon = interaction.fields.getTextInputValue('author_icon') || null;
    }
    else if (id === 'modal_eb_thumb') data.thumbnail = interaction.fields.getTextInputValue('thumbnail');
    else if (id === 'modal_eb_image') data.image = interaction.fields.getTextInputValue('image');
    else if (id === 'modal_eb_footer') d
