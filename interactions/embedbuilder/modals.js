const { TextInputStyle } = require('discord.js');

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

module.exports = { MODAL_CONFIGS };
