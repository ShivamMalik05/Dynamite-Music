const { TextInputStyle } = require('discord.js');
const emojis = require('../../../emojis/emojis');
const {
  buildEmbedFromBlocks,
  buildBuilderPage,
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
  eb
