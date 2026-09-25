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
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const emojis = require('../emojis/emojis');

// ===== BUILD LIVE PREVIEW =====
function buildLivePreview(data) {
  const isV2 = data.mode === 'v2';
  const container = new ContainerBuilder().setAccentColor(data.color || (isV2 ? 0x9B59B6 : 0x5865F2));

  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
    `# ${emojis.star} Live Preview\n**Mode: ${isV2 ? 'Modern (V2)' : 'Classic (V1)'}**`
  ));
  container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

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

  container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(data.footer || `*Powered by Dynamite Music*`));

  // History
  if (data.history?.length) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 📜 History`));
    for (const h of data.history.slice(-5).reverse()) {
      container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `${emojis.arrowRight} **${h.field}** → \`${h.value}\``
      ));
    }
  }

  return [container];
}

// ===== BUILD FRONT PAGE (Preview + Buttons) =====
function buildFront(data) {
  const preview = buildLivePreview(data);
  const isV2 = data.mode === 'v2';

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
    new ButtonBuilder().setCustomId('eb_reset').setLabel('Reset').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [...preview, row1, row2, row3];
}

// ===== BUILD SUB-MENUS =====
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

function buildButtonsMenu(data) {
  const container = new ContainerBuilder()
    .setAccentColor(0x1ABC9C)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 🔗 Buttons\n**Link buttons**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `**Buttons:** ${data.buttons?.length || 0}\n` +
      (data.buttons?.length ? data.buttons.map((b, i) => `${i + 1}. **${b.label}**`).join('\n') : '*No buttons yet*')
    ));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_add_button').setLabel('Add Button').setEmoji('➕').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('eb_clear_buttons').setLabel('Clear All').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('eb_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row];
}

// ===== MODAL CONFIGS =====
const MODAL_CONFIGS = {
  eb_set_title: { id: 'modal_title', title: 'Set Title', fields: [
    { id: 'title', label: 'Title', style: TextInputStyle.Short, required: true }]},
  eb_set_desc: { id: 'modal_desc', title: 'Set Description', fields: [
    { id: 'description', label: 'Description', style: TextInputStyle.Paragraph, required: true }]},
  eb_set_color: { id: 'modal_color', title: 'Set Color', fields: [
    { id: 'color', label: 'Hex color (like #5865F2)', style: TextInputStyle.Short, required: true }]},
  eb_set_author: { id: 'modal_author', title: 'Set Author', fields: [
    { id: 'author', label: 'Author name', style: TextInputStyle.Short, required: true },
    { id: 'author_icon', label: 'Author icon URL (optional)', style: TextInputStyle.Short, required: false }]},
  eb_set_thumb: { id: 'modal_thumb', title: 'Set Thumbnail', fields: [
    { id: 'thumbnail', label: 'Thumbnail image URL', style: TextInputStyle.Short, required: true }]},
  eb_set_image: { id: 'modal_image', title: 'Set Image', fields: [
    { id: 'image', label: 'Image URL', style: TextInputStyle.Short, required: true }]},
  eb_set_footer: { id: 'modal_footer', title: 'Set Footer', fields: [
    { id: 'footer', label: 'Footer text', style: TextInputStyle.Short, required: true }]},
  eb_add_field: { id: 'modal_field', title: 'Add Field', fields: [
    { id: 'field_name', label: 'Field name', style: TextInputStyle.Short, required: true },
    { id: 'field_value', label: 'Field value', style: TextInputStyle.Paragraph, required: true }]},
  eb_add_button: { id: 'modal_button', title: 'Add Link Button', fields: [
    { id: 'btn_label', label: 'Button label', style: TextInputStyle.Short, required: true },
    { id: 'btn_url', label: 'Button URL (https://...)', style: TextInputStyle.Short, required: true }]},
  eb_send_channel: { id: 'modal_send', title: 'Send to Channel', fields: [
    { id: 'target_channel', label: 'Channel ID', style: TextInputStyle.Short, required: true }]},
};

// ===== HANDLE BUTTONS =====
async function handleButton(interaction, client) {
  const id = interaction.customId;

  if (!client.embedBuilders) client.embedBuilders = new Map();
  if (!client.embedBuilders.has(interaction.user.id)) {
    client.embedBuilders.set(interaction.user.id, {
      title: null, description: null, color: null, author: null, authorIcon: null,
      thumbnail: null, image: null, footer: null, fields: [], buttons: [], sections: [],
      mode: 'v1', ephemeral: true, history: [],
    });
  }
  const data = client.embedBuilders.get(interaction.user.id);

  // Close
  if (id === 'embed_close') {
    client.embedBuilders.delete(interaction.user.id);
    await interaction.update({ components: [] });
    return true;
  }

  // Toggle Ephemeral
  if (id === 'eb_toggle_ephemeral') {
    data.ephemeral = !data.ephemeral;
    await interaction.update({ components: buildFront(data), flags: 1 << 15 | 1 << 6 });
    return true;
  }

  // Toggle V1/V2
  if (id === 'eb_open_v1') { data.mode = 'v1'; await interaction.update({ components: buildFront(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_open_v2') { data.mode = 'v2'; await interaction.update({ components: buildFront(data), flags: 1 << 15 | 1 << 6 }); return true; }

  // Back to main
  if (id === 'eb_back') { await interaction.update({ components: buildFront(data), flags: 1 << 15 | 1 << 6 }); return true; }

  // Reset
  if (id === 'eb_reset') {
    const mode = data.mode;
    const ephemeral = data.ephemeral;
    client.embedBuilders.set(interaction.user.id, {
      title: null, description: null, color: null, author: null, authorIcon: null,
      thumbnail: null, image: null, footer: null, fields: [], buttons: [], sections: [],
      mode, ephemeral, history: [],
    });
    await interaction.update({ components: buildFront(client.embedBuilders.get(interaction.user.id)), flags: 1 << 15 | 1 << 6 });
    return true;
  }

  // Sub-menus
  if (id === 'eb_content') { await interaction.update({ components: buildContentMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_media') { await interaction.update({ components: buildMediaMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_fields') { await interaction.update({ components: buildFieldsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_buttons') { await interaction.update({ components: buildButtonsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }

  // Clear
  if (id === 'eb_clear_fields') { data.fields = []; await interaction.update({ components: buildFieldsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_clear_buttons') { data.buttons = []; await interaction.update({ components: buildButtonsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }

  // Send
  if (id === 'eb_preview') {
    try {
      const preview = buildLivePreview(data);
      await interaction.channel.send({ components: preview, flags: 1 << 15 });
      await interaction.reply({ content: `${emojis.success} Embed sent!`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Failed to send.', ephemeral: true });
    }
    return true;
  }

  // Send to Channel (modal)
  if (id === 'eb_send_channel') {
    const modal = new ModalBuilder().setCustomId('modal_send').setTitle('Send to Channel');
    modal.addComponents(new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('target_channel').setLabel('Channel ID').setStyle(TextInputStyle.Short).setRequired(true)
    ));
    await interaction.showModal(modal);
    return true;
  }

  // Modal openers
  const cfg = MODAL_CONFIGS[id];
  if (cfg) {
    const modal = new ModalBuilder().setCustomId(cfg.id).setTitle(cfg.title);
    for (const f of cfg.fields) {
      modal.addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId(f.id).setLabel(f.label).setStyle(f.style).setRequired(f.required)
      ));
    }
    await interaction.showModal(modal);
    return true;
  }

  return false;
}

// ===== HANDLE MODALS =====
function addHistory(data, field, value) {
  if (!data.history) data.history = [];
  data.history.push({
    field,
    value: value.length > 50 ? value.slice(0, 50) + '...' : value,
  });
  if (data.history.length > 20) data.history.shift();
}

async function handleModal(interaction, client) {
  const data = client.embedBuilders?.get(interaction.user.id);
  if (!data) return interaction.reply({ content: 'Session expired. Run `/embedbuilder` again.', ephemeral: true });

  try {
    const id = interaction.customId;

    if (id === 'modal_title') { data.title = interaction.fields.getTextInputValue('title'); addHistory(data, 'Title', data.title); }
    else if (id === 'modal_desc') { data.description = interaction.fields.getTextInputValue('description'); addHistory(data, 'Description', data.description); }
    else if (id === 'modal_color') {
      const c = interaction.fields.getTextInputValue('color');
      data.color = c.startsWith('#') ? parseInt(c.slice(1), 16) : 0x5865F2;
      addHistory(data, 'Color', c);
    }
    else if (id === 'modal_author') {
      data.author = interaction.fields.getTextInputValue('author');
      data.authorIcon = interaction.fields.getTextInputValue('author_icon') || null;
      addHistory(data, 'Author', data.author);
    }
    else if (id === 'modal_thumb') { data.thumbnail = interaction.fields.getTextInputValue('thumbnail'); addHistory(data, 'Thumbnail', '✅ Set'); }
    else if (id === 'modal_image') { data.image = interaction.fields.getTextInputValue('image'); addHistory(data, 'Image', '✅ Set'); }
    else if (id === 'modal_footer') { data.footer = interaction.fields.getTextInputValue('footer'); addHistory(data, 'Footer', data.footer); }
    else if (id === 'modal_field') {
      data.fields.push({
        name: interaction.fields.getTextInputValue('field_name'),
        value: interaction.fields.getTextInputValue('field_value'),
      });
      addHistory(data, 'Field', data.fields[data.fields.length - 1].name);
    }
    else if (id === 'modal_button') {
      data.buttons.push({
        label: interaction.fields.getTextInputValue('btn_label'),
        url: interaction.fields.getTextInputValue('btn_url'),
      });
      addHistory(data, 'Button', data.buttons[data.buttons.length - 1].label);
    }
    else if (id === 'modal_send') {
      const channelId = interaction.fields.getTextInputValue('target_channel');
      const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
      if (!channel) return interaction.reply({ content: 'Channel not found.', ephemeral: true });

      const preview = buildLivePreview(data);
      await channel.send({ components: preview, flags: 1 << 15 });
      return interaction.reply({ content: `${emojis.success} Sent to ${channel}.`, ephemeral: true });
    }

    // Update front page
    await interaction.update({ components: buildFront(data), flags: 1 << 15 | 1 << 6 });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
  }
}

module.exports = {
  handleButton,
  handleModal,
  isEmbedButton: (id) => id.startsWith('embed_') || id.startsWith('eb_'),
  isEmbedModal: (id) => id.startsWith('modal_'),
};
