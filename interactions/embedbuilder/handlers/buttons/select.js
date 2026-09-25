const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const { buildStyleMenu } = require('../../core');
const { MODAL_CONFIGS } = require('../modals/index');
const { getData } = require('./navigation');

async function handleSelect(interaction, client) {
  const id = interaction.customId;
  const data = getData(client, interaction.user.id);
  const value = interaction.values[0];

  if (id === 'eb_block_select') {
    const map = {
      title: 'eb_add_block_title',
      text: 'eb_add_block_text',
      separator: 'eb_add_block_separator',
      thumbnail: 'eb_add_block_thumbnail',
      image: 'eb_add_block_image',
      author: 'eb_add_block_author',
      field: 'eb_add_block_field',
      section: 'eb_add_block_section',
      footer: 'eb_add_block_footer',
    };
    const cfg = MODAL_CONFIGS[map[value]];
    if (cfg) {
      const modal = new ModalBuilder().setCustomId(cfg.id).setTitle(cfg.title);
      for (const f of cfg.fields) {
        modal.addComponents(new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId(f.id).setLabel(f.label).setStyle(f.style).setRequired(f.required)
        ));
      }
      await interaction.showModal(modal);
    }
    return true;
  }

  if (id === 'eb_button_select') {
    const map = {
      link: 'eb_add_button',
      role_add: 'eb_add_role',
      role_remove: 'eb_remove_role',
      role_toggle: 'eb_toggle_role',
    };
    const cfg = MODAL_CONFIGS[map[value]];
    if (cfg) {
      const modal = new ModalBuilder().setCustomId(cfg.id).setTitle(cfg.title);
      for (const f of cfg.fields) {
        modal.addComponents(new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId(f.id).setLabel(f.label).setStyle(f.style).setRequired(f.required)
        ));
      }
      await interaction.showModal(modal);
    }
    return true;
  }

  if (id === 'eb_color_select') {
    data.color = parseInt(value, 16);
    await interaction.update({ components: buildStyleMenu(data), flags: 1 << 15 | 1 << 6 });
    return true;
  }

  if (id === 'eb_manage_select') {
    if (value === 'move') {
      const modal = new ModalBuilder().setCustomId('modal_move').setTitle('Move Block');
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('from').setLabel('From position').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('to').setLabel('To position').setStyle(TextInputStyle.Short).setRequired(true)
        )
      );
      await interaction.showModal(modal);
    } else if (value === 'delete') {
      const modal = new ModalBuilder().setCustomId('modal_delete_block').setTitle('Delete Block');
      modal.addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('index').setLabel('Block position').setStyle(TextInputStyle.Short).setRequired(true)
      ));
      await interaction.showModal(modal);
    } else if (value === 'swap') {
      const modal = new ModalBuilder().setCustomId('modal_swap').setTitle('Swap Blocks');
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('pos1').setLabel('First position').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('pos2').setLabel('Second position').setStyle(TextInputStyle.Short).setRequired(true)
        )
      );
      await interaction.showModal(modal);
    }
    return true;
  }

  return false;
}

module.exports = { handleSelect };
