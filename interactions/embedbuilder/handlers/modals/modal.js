const { TextInputStyle } = require('discord.js');
const emojis = require('../../../../emojis/emojis');
const {
  buildEmbedFromBlocks,
  buildBuilderPage,
  buildManageBlocksMenu,
} = require('../../core');

const MODAL_CONFIGS = {
  eb_add_block_title: { id: 'modal_block_title', title: 'Add Title Block', fields: [
    { id: 'content', label: 'Title text', style: TextInputStyle.Short, required: true }]},
  eb_add_block_text: { id: 'modal_block_text', title: 'Add Text Block', fields: [
    { id: 'content', label: 'Text content', style: TextInputStyle.Paragraph, required: true }]},
  eb_add_block_thumbnail: { id: 'modal_block_thumb', title: 'Add Thumbnail Block', fields: [
    { id: 'label', label: 'Label (optional)', style: TextInputStyle.Short, required: false },
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
};

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
      addHistory(data, 'Thumbnail', 'Added');
    }
    else if (id === 'modal_block_image') {
      data.blocks.push({ type: 'image', url: interaction.fields.getTextInputValue('url') });
      addHistory(data, 'Image', 'Added');
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
      addHistory(data, 'Section', 'Added');
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
    else if (id === 'modal_color') {
      const c = interaction.fields.getTextInputValue('color');
      data.color = c.startsWith('#') ? parseInt(c.slice(1), 16) : (parseInt(c, 16) || 0xFFFFFF);
      addHistory(data, 'Color', c);
      await interaction.update({ components: buildBuilderPage(data, data.mode), flags: 1 << 15 | 1 << 6 });
      return;
    }
    else if (id === 'modal_send') {
      const channelId = interaction.fields.getTextInputValue('channel_id');
      const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
      if (!channel) return interaction.reply({ content: 'Channel not found.', ephemeral: true });
      await channel.send({ components: buildEmbedFromBlocks(data), flags: 1 << 15 });
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
        content: `${emojis.success} Now editing message in ${channel}. Click Send to apply changes.`,
        ephemeral: true,
      });
      return;
    }
    else if (id === 'modal_import_json') {
      const json = interaction.fields.getTextInputValue('json_data');
      try {
        const parsed = JSON.parse(json);
        if (parsed.blocks) data.blocks = parsed.blocks;
        if (parsed.buttons) data.buttons = parsed.buttons;
        if (parsed.color) data.color = parsed.color;
        if (parsed.mode) data.mode = parsed.mode;
        addHistory(data, 'Import', 'JSON loaded');
        await interaction.reply({ content: `${emojis.success} JSON imported!`, ephemeral: true });
      } catch (err) {
        return interaction.reply({ content: 'Invalid JSON.', ephemeral: true });
      }
      return;
    }
    else if (id === 'modal_move') {
      const from = parseInt(interaction.fields.getTextInputValue('from')) - 1;
      const to = parseInt(interaction.fields.getTextInputValue('to')) - 1;
      if (isNaN(from) || isNaN(to) || from < 0 || to < 0 || from >= data.blocks.length || to >= data.blocks.length) {
        return interaction.reply({ content: 'Invalid positions.', ephemeral: true });
      }
      const [block] = data.blocks.splice(from, 1);
      data.blocks.splice(to, 0, block);
      addHistory(data, 'Move Block', `${from + 1} to ${to + 1}`);
      await interaction.update({ components: buildManageBlocksMenu(data), flags: 1 << 15 | 1 << 6 });
      return;
    }
    else if (id === 'modal_delete_block') {
      const index = parseInt(interaction.fields.getTextInputValue('index')) - 1;
      if (isNaN(index) || index < 0 || index >= data.blocks.length) {
        return interaction.reply({ content: 'Invalid position.', ephemeral: true });
      }
      data.blocks.splice(index, 1);
      addHistory(data, 'Delete Block', `Position ${index + 1}`);
      await interaction.update({ components: buildManageBlocksMenu(data), flags: 1 << 15 | 1 << 6 });
      return;
    }
    else if (id === 'modal_swap') {
      const p1 = parseInt(interaction.fields.getTextInputValue('pos1')) - 1;
      const p2 = parseInt(interaction.fields.getTextInputValue('pos2')) - 1;
      if (isNaN(p1) || isNaN(p2) || p1 < 0 || p2 < 0 || p1 >= data.blocks.length || p2 >= data.blocks.length) {
        return interaction.reply({ content: 'Invalid positions.', ephemeral: true });
      }
      [data.blocks[p1], data.blocks[p2]] = [data.blocks[p2], data.blocks[p1]];
      addHistory(data, 'Swap Blocks', `${p1 + 1} with ${p2 + 1}`);
      await interaction.update({ components: buildManageBlocksMenu(data), flags: 1 << 15 | 1 << 6 });
      return;
    }

    await interaction.update({ components: buildBuilderPage(data, data.mode), flags: 1 << 15 | 1 << 6 });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
  }
}

module.exports = {
  MODAL_CONFIGS,
  addHistory,
  handleModal,
};
