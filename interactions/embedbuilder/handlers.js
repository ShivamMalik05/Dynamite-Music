const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const {
  buildCleanEmbed,
  buildFront,
  buildHistoryPanel,
  buildContentMenu,
  buildMediaMenu,
  buildFieldsMenu,
  buildButtonsMenu,
} = require('./core');

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
  eb_add_role: { id: 'modal_role_add', title: 'Add Role Button', fields: [
    { id: 'role_label', label: 'Button label', style: TextInputStyle.Short, required: true },
    { id: 'role_id', label: 'Role ID', style: TextInputStyle.Short, required: true }]},
  eb_remove_role: { id: 'modal_role_remove', title: 'Remove Role Button', fields: [
    { id: 'role_label', label: 'Button label', style: TextInputStyle.Short, required: true },
    { id: 'role_id', label: 'Role ID', style: TextInputStyle.Short, required: true }]},
  eb_toggle_role: { id: 'modal_role_toggle', title: 'Toggle Role Button', fields: [
    { id: 'role_label', label: 'Button label', style: TextInputStyle.Short, required: true },
    { id: 'role_id', label: 'Role ID', style: TextInputStyle.Short, required: true }]},
  eb_send_channel: { id: 'modal_send', title: 'Send to Channel', fields: [
    { id: 'target_channel', label: 'Channel ID', style: TextInputStyle.Short, required: true }]},
};

// ===== HISTORY HELPER =====
function addHistory(data, field, value) {
  if (!data.history) data.history = [];
  data.history.push({
    field,
    value: value.length > 50 ? value.slice(0, 50) + '...' : value,
  });
  if (data.history.length > 20) data.history.shift();
}

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

  if (id === 'embed_close') {
    client.embedBuilders.delete(interaction.user.id);
    await interaction.update({ components: [] });
    return true;
  }

  if (id === 'eb_toggle_ephemeral') {
    data.ephemeral = !data.ephemeral;
    await interaction.update({ components: buildFront(data), flags: 1 << 15 | 1 << 6 });
    return true;
  }

  if (id === 'eb_open_v1') { data.mode = 'v1'; await interaction.update({ components: buildFront(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_open_v2') { data.mode = 'v2'; await interaction.update({ components: buildFront(data), flags: 1 << 15 | 1 << 6 }); return true; }

  if (id === 'eb_back') { await interaction.update({ components: buildFront(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_history') { await interaction.update({ components: buildHistoryPanel(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_clear_history') { data.history = []; await interaction.update({ components: buildHistoryPanel(data), flags: 1 << 15 | 1 << 6 }); return true; }

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

  if (id === 'eb_content') { await interaction.update({ components: buildContentMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_media') { await interaction.update({ components: buildMediaMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_fields') { await interaction.update({ components: buildFieldsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_buttons') { await interaction.update({ components: buildButtonsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }

  if (id === 'eb_clear_fields') { data.fields = []; await interaction.update({ components: buildFieldsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_clear_buttons') { data.buttons = []; await interaction.update({ components: buildButtonsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }

  // Send clean embed
  if (id === 'eb_preview') {
    try {
      const clean = buildCleanEmbed(data);
      await interaction.channel.send({ components: clean, flags: 1 << 15 });
      await interaction.reply({ content: `${emojis.success} Embed sent!`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Failed to send.', ephemeral: true });
    }
    return true;
  }

  if (id === 'eb_send_channel') {
    const modal = new ModalBuilder().setCustomId('modal_send').setTitle('Send to Channel');
    modal.addComponents(new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('target_channel').setLabel('Channel ID').setStyle(TextInputStyle.Short).setRequired(true)
    ));
    await interaction.showModal(modal);
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

// ===== HANDLE MODALS =====
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
        type: 'link',
        label: interaction.fields.getTextInputValue('btn_label'),
        url: interaction.fields.getTextInputValue('btn_url'),
      });
      addHistory(data, 'Link Button', data.buttons[data.buttons.length - 1].label);
    }
    else if (id === 'modal_role_add' || id === 'modal_role_remove' || id === 'modal_role_toggle') {
      const action = id === 'modal_role_add' ? 'add' : id === 'modal_role_remove' ? 'remove' : 'toggle';
      data.buttons.push({
        type: 'role',
        action,
        label: interaction.fields.getTextInputValue('role_label'),
        roleId: interaction.fields.getTextInputValue('role_id'),
      });
      addHistory(data, `Role ${action}`, data.buttons[data.buttons.length - 1].label);
    }
    else if (id === 'modal_send') {
      const channelId = interaction.fields.getTextInputValue('target_channel');
      const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
      if (!channel) return interaction.reply({ content: 'Channel not found.', ephemeral: true });

      const clean = buildCleanEmbed(data);
      await channel.send({ components: clean, flags: 1 << 15 });
      return interaction.reply({ content: `${emojis.success} Sent to ${channel}.`, ephemeral: true });
    }

    await interaction.update({ components: buildFront(data), flags: 1 << 15 | 1 << 6 });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
  }
}

// ===== HANDLE ROLE BUTTONS (jab user click kare) =====
async function handleRoleButton(interaction) {
  const id = interaction.customId;
  if (!id.startsWith('eb_action_role_')) return false;

  const parts = id.replace('eb_action_role_', '').split('_');
  const roleId = parts[0];
  const action = parts[1];

  const role = interaction.guild.roles.cache.get(roleId);
  if (!role) {
    await interaction.reply({ content: 'Role not found.', ephemeral: true });
    return true;
  }

  const member = interaction.member;
  try {
    if (action === 'add') {
      if (member.roles.cache.has(roleId)) {
        return interaction.reply({ content: `You already have ${role}.`, ephemeral: true });
      }
      await member.roles.add(role);
      await interaction.reply({ content: `${emojis.success} Added ${role}.`, ephemeral: true });
    } else if (action === 'remove') {
      if (!member.roles.cache.has(roleId)) {
        return interaction.reply({ content: `You don't have ${role}.`, ephemeral: true });
      }
      await member.roles.remove(role);
      await interaction.reply({ content: `${emojis.success} Removed ${role}.`, ephemeral: true });
    } else if (action === 'toggle') {
      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(role);
        await interaction.reply({ content: `${emojis.success} Removed ${role}.`, ephemeral: true });
      } else {
        await member.roles.add(role);
        await interaction.reply({ content: `${emojis.success} Added ${role}.`, ephemeral: true });
      }
    }
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: 'Failed to update role. Check bot permissions.', ephemeral: true });
  }
  return true;
}

module.exports = {
  handleButton,
  handleModal,
  handleRoleButton,
  isEmbedButton: (id) => id.startsWith('embed_') || id.startsWith('eb_'),
  isEmbedModal: (id) => id.startsWith('modal_'),
  isRoleButton: (id) => id.startsWith('eb_action_role_'),
};
