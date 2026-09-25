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
} = require('discord.js');
const emojis = require('../emojis/emojis');

function buildFront() {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `# ${emojis.star} Embed Builder\n**Create and send custom messages or embeds**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `Welcome to the **Embed Builder** — build fully custom embeds.\n\n` +
      `**Features:**\n` +
      `${emojis.arrowRight} Title, Description, Color\n` +
      `${emojis.arrowRight} Author, Thumbnail, Image, Footer\n` +
      `${emojis.arrowRight} Fields with title + value\n` +
      `${emojis.arrowRight} Link buttons\n` +
      `${emojis.arrowRight} V2 Sections with thumbnails\n` +
      `${emojis.arrowRight} Preview before sending\n\n` +
      `*Click **Get Started** to begin.*`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`));

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('embed_getstarted').setLabel('Get Started').setEmoji('🚀').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, buttons];
}

function buildMain() {
  const container = new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `# ${emojis.star} Embed Builder — Main Menu\n**Choose what to add**`))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `📝 **Content** — Title, Description, Color\n` +
      `🖼️ **Media** — Author, Thumbnail, Image, Footer\n` +
      `📋 **Fields** — Title + value pairs\n` +
      `🔗 **Buttons** — Link buttons\n` +
      `✨ **V2 Sections** — Sections with thumbnails\n` +
      `👁️ **Preview & Send** — Review before sending`))
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

function buildFieldsMenu() {
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

function buildButtonsMenu() {
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

function buildEmbedFromData(data) {
  const container = new ContainerBuilder().setAccentColor(data.color || 0x5865F2);

  if (data.title) container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${data.title}`));
  if (data.description) container.addTextDisplayComponents(new TextDisplayBuilder().setContent(data.description));

  if (data.fields?.length) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    for (const f of data.fields) {
      container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**${f.name}**\n${f.value}`));
    }
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

  return container;
}

function buildPreview(data) {
  const container = buildEmbedFromData(data);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('eb_send').setLabel('Send').setEmoji('📤').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('eb_send_channel').setLabel('Send to Channel').setEmoji('📨').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('eb_main').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  const rows = [container, row];

  if (data.buttons?.length) {
    const linkRow = new ActionRowBuilder();
    for (const b of data.buttons.slice(0, 5)) {
      linkRow.addComponents(new ButtonBuilder().setLabel(b.label).setURL(b.url).setStyle(ButtonStyle.Link));
    }
    rows.push(linkRow);
  }

  return rows;
}

const MODAL_CONFIGS = {
  eb_set_title: { id: 'modal_eb_title', title: 'Set Title', fields: [
    { id: 'title', label: 'Title', style: TextInputStyle.Short, required: true }]},
  eb_set_desc: { id: 'modal_eb_desc', title: 'Set Description', fields: [
    { id: 'description', label: 'Description', style: TextInputStyle.Paragraph, required: true }]},
  eb_set_color: { id: 'modal_eb_color', title: 'Set Color', fields: [
    { id: 'color', label: 'Hex color (like #5865F2)', style: TextInputStyle.Short, required: true }]},
  eb_set_author: { id: 'modal_eb_author', title: 'Set Author', fields: [
    { id: 'author', label: 'Author name', style: TextInputStyle.Short, required: true },
    { id: 'author_icon', label: 'Author icon URL (optional)', style: TextInputStyle.Short, required: false }]},
  eb_set_thumb: { id: 'modal_eb_thumb', title: 'Set Thumbnail', fields: [
    { id: 'thumbnail', label: 'Thumbnail image URL', style: TextInputStyle.Short, required: true }]},
  eb_set_image: { id: 'modal_eb_image', title: 'Set Image', fields: [
    { id: 'image', label: 'Image URL', style: TextInputStyle.Short, required: true }]},
  eb_set_footer: { id: 'modal_eb_footer', title: 'Set Footer', fields: [
    { id: 'footer', label: 'Footer text', style: TextInputStyle.Short, required: true }]},
  eb_add_field: { id: 'modal_eb_field', title: 'Add Field', fields: [
    { id: 'field_name', label: 'Field name', style: TextInputStyle.Short, required: true },
    { id: 'field_value', label: 'Field value', style: TextInputStyle.Paragraph, required: true }]},
  eb_add_button: { id: 'modal_eb_btn', title: 'Add Link Button', fields: [
    { id: 'btn_label', label: 'Button label', style: TextInputStyle.Short, required: true },
    { id: 'btn_url', label: 'Button URL (https://...)', style: TextInputStyle.Short, required: true }]},
  eb_add_section: { id: 'modal_eb_section', title: 'Add V2 Section', fields: [
    { id: 'section_text', label: 'Section text', style: TextInputStyle.Paragraph, required: true },
    { id: 'section_thumb', label: 'Thumbnail URL (optional)', style: TextInputStyle.Short, required: false }]},
  eb_send_channel: { id: 'modal_eb_send', title: 'Send to Channel', fields: [
    { id: 'target_channel', label: 'Channel ID', style: TextInputStyle.Short, required: true }]},
};

async function handleButton(interaction, client) {
  const id = interaction.customId;

  if (!client.embedBuilders) client.embedBuilders = new Map();
  if (!client.embedBuilders.has(interaction.user.id)) {
    client.embedBuilders.set(interaction.user.id, {
      title: null, description: null, color: null, author: null, authorIcon: null,
      thumbnail: null, image: null, footer: null, fields: [], buttons: [], sections: [],
    });
  }
  const data = client.embedBuilders.get(interaction.user.id);

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
  if (id === 'eb_content') { await interaction.update({ components: buildContentMenu(), flags: 1 << 15 }); return true; }
  if (id === 'eb_media') { await interaction.update({ components: buildMediaMenu(), flags: 1 << 15 }); return true; }
  if (id === 'eb_fields') { await interaction.update({ components: buildFieldsMenu(), flags: 1 << 15 }); return true; }
  if (id === 'eb_buttons') { await interaction.update({ components: buildButtonsMenu(), flags: 1 << 15 }); return true; }
  if (id === 'eb_sections') { await interaction.update({ components: buildSectionsMenu(), flags: 1 << 15 }); return true; }
  if (id === 'eb_clear_buttons') { data.buttons = []; await interaction.update({ components: buildButtonsMenu(), flags: 1 << 15 }); return true; }
  if (id === 'eb_clear_sections') { data.sections = []; await interaction.update({ components: buildSectionsMenu(), flags: 1 << 15 }); return true; }
  if (id === 'eb_clear_fields') { data.fields = []; await interaction.update({ components: buildFieldsMenu(), flags: 1 << 15 }); return true; }
  if (id === 'eb_preview') { await interaction.update({ components: buildPreview(data), flags: 1 << 15 }); return true; }

  if (id === 'eb_send') {
    try {
      await interaction.channel.send({ components: buildPreview(data).slice(0, -1), flags: 1 << 15 });
      await interaction.reply({ content: `${emojis.success} Embed sent!`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Failed to send.', ephemeral: true });
    }
    return true;
  }

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
    else if (id === 'modal_eb_footer') data.footer = interaction.fields.getTextInputValue('footer');
    else if (id === 'modal_eb_field') {
      data.fields.push({
        name: interaction.fields.getTextInputValue('field_name'),
        value: interaction.fields.getTextInputValue('field_value'),
      });
    }
    else if (id === 'modal_eb_btn') {
      data.buttons.push({
        label: interaction.fields.getTextInputValue('btn_label'),
        url: interaction.fields.getTextInputValue('btn_url'),
      });
    }
    else if (id === 'modal_eb_section') {
      data.sections.push({
        text: interaction.fields.getTextInputValue('section_text'),
        thumbnail: interaction.fields.getTextInputValue('section_thumb') || null,
      });
    }
    else if (id === 'modal_eb_send') {
      const channelId = interaction.fields.getTextInputValue('target_channel');
      const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
      if (!channel) return interaction.reply({ content: 'Channel not found.', ephemeral: true });

      await channel.send({ components: buildPreview(data).slice(0, -1), flags: 1 << 15 });
      return interaction.reply({ content: `${emojis.success} Sent to ${channel}.`, ephemeral: true });
    }

    await interaction.reply({ content: `${emojis.success} Updated!`, ephemeral: true });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
  }
}

module.exports = {
  buildFront,
  buildMain,
  buildPreview,
  handleButton,
  handleModal,
  isEmbedButton: (id) => id.startsWith('embed_') || id.startsWith('eb_') || id.startsWith('preview_'),
  isEmbedModal: (id) => id.startsWith('modal_eb_') || id.startsWith('modal_'),
};
