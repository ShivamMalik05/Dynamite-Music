const { TextInputStyle } = require('discord.js');
const emojis = require('../../../emojis/emojis');
const {
  buildEmbedFromBlocks,
  buildFront,
  buildManageBlocksMenu,
} = require('../core');

// ===== MODAL CONFIGS =====
const MODAL_CONFIGS = {
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
  eb_send_channel: { id: 'modal_send', title: 'Send to Channel', fields: [
    { id: 'channel_id', label: 'Channel ID', style: TextInputStyle.Short, required: true }]},
  eb_edit_existing: { id: 'modal_edit_existing', title: 'Edit Existing Message', fields: [
    { id: 'channel_id', label: 'Channel ID', style: TextInputStyle.Short, required: true },
    { id: 'message_id', label: 'Message ID', style: TextInputStyle.Short, required: true }]},
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

// ===== HANDLE MODALS =====
async function handleModal(interaction, client) {
  const data = client.embedBuilders?.get(interaction.user.id);
  if (!data) return interaction.reply({ content: 'Session expired.', ephemeral: true });

  try {
    const id = interaction.customId;

    if (id === 'modal_block_title') {
      data.blocks.push({ type: 'title', content: interaction.fields.getTextInputValue('content') });
      addHistory(data, 'Title', interaction.fields.getTextInputValue('content'));
    }
    else if (id === 'modal_block_text') {
      data.blocks.push({ type: 'text', content: interaction.fields.getTextInputValue('content') });
      addHistory(data, 'Text', interaction.fields.getTextInputValue('content'));
    }
    else if (id === 'modal_block_thumb') {
      data.blocks.push({
        type: 'thumbnail',
        label: interaction.fields.getTextInputValue('label') || '',
        url: interaction.fields.getTextInputValue('url'),
      });
      addHistory(data, 'Thumbnail', '✅ Set');
    }
    else if (id === 'modal_block_image') {
      data.blocks.push({ type: 'image', url: interaction.fields.getTextInputValue('url') });
      addHistory(data, 'Image', '✅ Set');
    }
    else if (id === 'modal_block_author') {
      data.blocks.push({
        type: 'author',
        name: interaction.fields.getTextInputValue('name'),
        icon: interaction.fields.getTextInputValue('icon') || null,
      });
      addHistory(data, 'Author', interaction.fields.getTextInputValue('name'));
    }
    else if (id === 'modal_block_field') {
      data.blocks.push({
        type: 'field',
        name: interaction.fields.getTextInputValue('name'),
        value: interaction.fields.getTextInputValue('value'),
      });
      addHistory(data, 'Field', interaction.fields.getTextInputValue('name'));
    }
    else if (id === 'modal_block_section') {
      data.blocks.push({
        type: 'section',
        text: interaction.fields.getTextInputValue('text'),
        thumbnail: interaction.fields.getTextInputValue('thumbnail') || null,
      });
      addHistory(data, 'Section', '✅');
    }
    else if (id === 'modal_button') {
      data.buttons.push({
        type: 'link',
        label: interaction.fields.getTextInputValue('label'),
        url: interaction.fields.getTextInputValue('url'),
      });
      addHistory(data, 'Link Button', interaction.fields.getTextInputValue('label'));
    }
    else if (id === 'modal_role_add' || id === 'modal_role_remove' || id === 'modal_role_toggle') {
      const action = id === 'modal_role_add' ? 'add' : id === 'modal_role_remove' ? 'remove' : 'toggle';
      data.buttons.push({
        type: 'role',
        action,
        label: interaction.fields.getTextInputValue('label'),
        roleId: interaction.fields.getTextInputValue('role_id'),
      });
      addHistory(data, `Role ${action}`, interaction.fields.getTextInputValue('label'));
    }
    else if (id === 'modal_send') {
      const channelId = interaction.fields.getTextInputValue('channel_id');
      const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
      if (!channel) return interaction.reply({ content: 'Channel not found.', ephemeral: true });
      const clean = buildEmbedFromBlocks(data);
      await channel.send({ components: clean, flags: 1 << 15 });
      return interaction.reply({ content: `${emojis.success} Sent to ${channel}.`, ephemeral: true });
    }
    else if (id === 'modal_edit_existing') {
      const channelId = interaction.fields.getTextInputValue('channel_id');
      const messageId = interaction.fields.getTextInputValue('message_id');
      const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
      if (!channel) return interaction.reply({ content: 'Channel not found.', ephemeral: true });
      const msg = await channel.messages.fetch(messageId).catch(() => null);
      if (!msg) return interaction.reply({ content: 'Message not found.', ephemeral: true });

      data.editing = { channelId, messageId };
      await interaction.reply({
        content: `${emojis.success} Now editing message in ${channel}. Make your changes and click **Send**.`,
        ephemeral: true,
      });
      return;
    }
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

    await interaction.update({ components: buildFront(data), flags: 1 << 15 | 1 << 6 });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
  }
}

// ===== HANDLE ROLE BUTTONS =====
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
    await interaction.reply({ content: 'Failed. Check bot permissions.', ephemeral: true });
  }
  return true;
}

module.exports = {
  MODAL_CONFIGS,
  addHistory,
  handleModal,
  handleRoleButton,
};
