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
  buildEmbedFromBlocks,
  buildFront,
  buildBlocksMenu,
  buildManageBlocksMenu,
  buildButtonsMenu,
  buildHistoryPanel,
} = require('./core');

// ===== MODAL CONFIGS =====
const MODAL_CONFIGS = {
  // Block modals
  eb_add_block_title: { id: 'modal_block_title', title: 'Add Title Block', fields: [
    { id: 'content', label: 'Title text', style: TextInputStyle.Short, required: true }]},
  eb_add_block_text: { id: 'modal_block_text', title: 'Add Text Block', fields: [
    { id: 'content', label: 'Text content', style: TextInputStyle.Paragraph, required: true }]},
  eb_add_block_thumbnail: { id: 'modal_block_thumb', title: 'Add Thumbnail Block', fields: [
    { id: 'label', label: 'Label (e.g. Logo)', style: TextInputStyle.Short, required: false },
    { id: 'url', label: 'Image URL', style: TextInputStyle.Short, required: true }]},
  eb_add_block_image: { id: 'modal_block_image', title: 'Add Image Block', fields: [
    { id: 'url', label: 'Image URL', style: TextInputStyle.Short, required: true }]},
  eb_add_block_author: { id: 'modal_block_author', title: 'Add Author Block', fields: [
    { id: 'name', label: 'Author name', style: TextInputStyle.Short, required: true },
    { id: 'icon', label: 'Icon URL (optional)', style: TextInputStyle.Short, required: false }]},
  eb_add_block_field: { id: 'modal_block_field', title: 'Add Field Block', fields: [
    { id: 'name', label: 'Field name', style: TextInputStyle.Short, required: true },
    { id: 'value', label: 'Field value', style: TextInputStyle.Paragraph, required: true }]},
  eb_add_block_section: { id: 'modal_block_section', title: 'Add Section Block', fields: [
    { id: 'text', label: 'Section text', style: TextInputStyle.Paragraph, required: true },
    { id: 'thumbnail', label: 'Thumbnail URL (optional)', style: TextInputStyle.Short, required: false }]},
  // Button modals
  eb_add_button: { id: 'modal_button', title: 'Add Link Button', fields: [
    { id: 'label', label: 'Button label', style: TextInputStyle.Short, required: true },
    { id: 'url', label: 'URL (https://...)', style: TextInputStyle.Short, required: true }]},
  eb_add_role: { id: 'modal_role_add', title: 'Add Role Button', fields: [
    { id: 'label', label: 'Button label', style: TextInputStyle.Short, required: true },
    { id: 'role_id', label: 'Role ID', style: TextInputStyle.Short, required: true }]},
  eb_remove_role: { id: 'modal_role_remove', title: 'Remove Role Button', fields: [
    { id: 'label', label: 'Button label', style: TextInputStyle.Short, required: true },
    { id: 'role_id', label: 'Role ID', style: TextInputStyle.Short, required: true }]},
  eb_toggle_role: { id: 'modal_role_toggle', title: 'Toggle Role Button', fields: [
    { id: 'label', label: 'Button label', style: TextInputStyle.Short, required: true },
    { id: 'role_id', label: 'Role ID', style: TextInputStyle.Short, required: true }]},
  // Send
  eb_send_channel: { id: 'modal_send', title: 'Send to Channel', fields: [
    { id: 'channel_id', label: 'Channel ID', style: TextInputStyle.Short, required: true }]},
  // Edit existing
  eb_edit_existing: { id: 'modal_edit_existing', title: 'Edit Existing Message', fields: [
    { id: 'channel_id', label: 'Channel ID', style: TextInputStyle.Short, required: true },
    { id: 'message_id', label: 'Message ID', style: TextInputStyle.Short, required: true }]},
  // Manage
  eb_move_up: { id: 'modal_move_up', title: 'Move Block Up', fields: [
    { id: 'index', label: 'Block number (from list)', style: TextInputStyle.Short, required: true }]},
  eb_move_down: { id: 'modal_move_down', title: 'Move Block Down', fields: [
    { id: 'index', label: 'Block number (from list)', style: TextInputStyle.Short, required: true }]},
  eb_delete_block: { id: 'modal_delete_block', title: 'Delete Block', fields: [
    { id: 'index', label: 'Block number (from list)', style: TextInputStyle.Short, required: true }]},
};

// ===== HISTORY =====
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
      blocks: [], buttons: [], mode: 'v1', ephemeral: true, history: [],
      editing: null, // { channelId, messageId }
    });
  }
  const data = client.embedBuilders.get(interaction.user.id);

  // Close
  if (id === 'embed_close') {
    client.embedBuilders.delete(interaction.user.id);
    await interaction.update({ components: [] });
    return true;
  }

  // Toggle
  if (id === 'eb_toggle_ephemeral') {
    data.ephemeral = !data.ephemeral;
    await interaction.update({ components: buildFront(data), flags: 1 << 15 | 1 << 6 });
    return true;
  }
  if (id === 'eb_open_v1') { data.mode = 'v1'; await interaction.update({ components: buildFront(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_open_v2') { data.mode = 'v2'; await interaction.update({ components: buildFront(data), flags: 1 << 15 | 1 << 6 }); return true; }

  // Navigation
  if (id === 'eb_back') { await interaction.update({ components: buildFront(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_history') { await interaction.update({ components: buildHistoryPanel(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_clear_history') { data.history = []; await interaction.update({ components: buildHistoryPanel(data), flags: 1 << 15 | 1 << 6 }); return true; }

  if (id === 'eb_blocks') { await interaction.update({ components: buildBlocksMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_manage_blocks') { await interaction.update({ components: buildManageBlocksMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_buttons') { await interaction.update({ components: buildButtonsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }

  // Clear
  if (id === 'eb_clear_blocks') { data.blocks = []; await interaction.update({ components: buildBlocksMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_clear_buttons') { data.buttons = []; await interaction.update({ components: buildButtonsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }

  // Reset
  if (id === 'eb_reset') {
    const mode = data.mode;
    const ephemeral = data.ephemeral;
    client.embedBuilders.set(interaction.user.id, {
      blocks: [], buttons: [], mode, ephemeral, history: [], editing: null,
    });
    await interaction.update({ components: buildFront(client.embedBuilders.get(interaction.user.id)), flags: 1 << 15 | 1 << 6 });
    return true;
  }

  // Send (naya message)
  if (id === 'eb_preview') {
    try {
      const clean = buildEmbedFromBlocks(data);
      await interaction.channel.send({ components: clean, flags: 1 << 15 });
      await interaction.reply({ content: `${emojis.success} Embed sent!`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Failed to send.', ephemeral: true });
    }
    return true;
  }

  // Send to Channel
  if (id === 'eb_send_channel') {
    const modal = new ModalBuilder().setCustomId('modal_send').setTitle('Send to Channel');
    modal.addComponents(new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('channel_id').setLabel('Channel ID').setStyle(TextInputStyle.Short).setRequired(true)
    ));
    await interaction.showModal(modal);
    return true;
  }

  // Edit Existing
  if (id === 'eb_edit_existing') {
    const modal = new ModalBuilder().setCustomId('modal_edit_existing').setTitle('Edit Existing Message');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('channel_id').setLabel('Channel ID').setStyle(TextInputStyle.Short).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('message_id').setLabel('Message ID').setStyle(TextInputStyle.Short).setRequired(true)
      )
    );
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
async function handleModal(interaction, client) {
  const data = client.embedBuilders?.get(interaction.user.id);
  if (!data) return interaction.reply({ content: 'Session expired.', ephemeral: true });

  try {
    const id = interaction.customId;

    // Block modals
    if (id === 'modal_block_title') { data.blocks.push({ type: 'title', content: interaction.fields.getTextInputValue('content') }); addHistory(data, 'Title', '✅'); }
    else if (id === 'modal_block_text') { data.blocks.push({ type: 'text', content: interaction.fields.getTextInputValue('content') }); addHistory(data, 'Text', '✅'); }
    else if (id === 'modal_block_thumb') { data.blocks.push({ type: 'thumbnail', label: interaction.fields.getTextInputValue('label') || '', url: interaction.fields.getTextInputValue('url') }); addHistory(data, 'Thumbnail', '✅'); }
    else if (id === 'modal_block_image') { data.blocks.push({ type: 'image', url: interaction.fields.getTextInputValue('url') }); addHistory(data, 'Image', '✅'); }
    else if (id === 'modal_block_author') { data.blocks.push({ type: 'author', name: interaction.fields.getTextInputValue('name'), icon: interaction.fields.getTextInputValue('icon') || null }); addHistory(data, 'Author', '✅'); }
    else if (id === 'modal_block_field') { data.blocks.push({ type: 'field', name: interaction.fields.getTextInputValue('name'), value: interaction.fields.getTextInputValue('value') }); addHistory(data, 'Field', '✅'); }
    else if (id === 'modal_block_section') { data.blocks.push({ type: 'section', text: interaction.fields.getTextInputValue('text'), thumbnail: interaction.fields.getTextInputValue('thumbnail') || null }); addHistory(data, 'Section', '✅'); }
    // Button modals
    else if (id === 'modal_button') { data.buttons.push({ type: 'link', label: interaction.fields.getTextInputValue('label'), url: interaction.fields.getTextInputValue('url') }); addHistory(data, 'Link Button', '✅'); }
    else if (id === 'modal_role_add' || id === 'modal_role_remove' || id === 'modal_role_toggle') {
      const action = id === 'modal_role_add' ? 'add' : id === 'modal_role_remove' ? 'remove' : 'toggle';
      data.buttons.push({ type: 'role', action, label: interaction.fields.getTextInputValue('label'), roleId: interaction.fields.getTextInputValue('role_id') });
      addHistory(data, `Role ${action}`, '✅');
    }
    // Send to channel
    else if (id === 'modal_send') {
      const channelId = interaction.fields.getTextInputValue('channel_id');
      const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
      if (!channel) return interaction.reply({ content: 'Channel not found.', ephemeral: true });
      const clean = buildEmbedFromBlocks(data);
      await channel.send({ components: clean, flags: 1 << 15 });
      return interaction.reply({ content: `${emojis.success} Sent to ${channel}.`, ephemeral: true });
    }
    // Edit existing
    else if (id === 'modal_edit_existing') {
      const channelId = interaction.fields.getTextInputValue('channel_id');
      const messageId = interaction.fields.getTextInputValue('message_id');
      const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
      if (!channel) return interaction.reply({ content: 'Channel not found.', ephemeral: true });
      const msg = await channel.messages.fetch(messageId).catch(() => null);
      if (!msg) return interaction.reply({ content: 'Message not found.', ephemeral: true });

      data.editing = { channelId, messageId };
      await interaction.reply({ content: `${emojis.success} Now editing message in ${channel}. Make your changes and click **Send**.`, ephemeral: true });
      return;
    }
    // Manage blocks
    else if (id === 'modal_move_up' || id === 'modal_move_down' || id === 'modal_delete_block') {
      const index = parseInt(interaction.fields.getTextInputValue('index')) - 1;
      if (isNaN(index) || index < 0 || index >= data.blocks.length) {
        return interaction.reply({ content: 'Invalid block number.', ephemeral: true });
      }
      if (id === 'modal_delete_block') {
        data.blocks.splice(index, 1);
      } else if (id === 'modal_move_up' && index > 0) {
        [data.blocks[index - 1], data.blocks[index]] = [data.blocks[index], data.blocks[index - 1]];
      } else if (id === 'modal_move_down' && index < data.blocks.length - 1) {
        [data.blocks[index + 1], data.blocks[index]] = [data.blocks[index], data.blocks[index + 1]];
      }
      await interaction.update({ components: buildManageBlocksMenu(data), flags: 1 << 15 | 1 << 6 });
      return;
    }

    // Update front
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
      if (member.roles.cache.has(roleId)) return interaction.reply({ content: `You already have ${role}.`, ephemeral: true });
      await member.roles.add(role);
      await interaction.reply({ content: `${emojis.success} Added ${role}.`, ephemeral: true });
    } else if (action === 'remove') {
      if (!member.roles.cache.has(roleId)) return interaction.reply({ content: `You don't have ${role}.`, ephemeral: true });
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
    await interaction.reply({ content: 'Failed. Check bot permissions.', ephemeral: true });
  }
  return true;
}

module.exports = {
  handleButton,
  handleModal,
  handleRoleButton,
  isEmbedButton: (id) =>
