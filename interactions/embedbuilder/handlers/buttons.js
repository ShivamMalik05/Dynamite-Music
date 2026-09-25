const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const emojis = require('../../../emojis/emojis');
const {
  buildEmbedFromBlocks,
  buildStartPage,
  buildBuilderPage,
  buildBlocksMenu,
  buildManageBlocksMenu,
  buildButtonsMenu,
  buildStyleMenu,
  buildHistoryPanel,
  buildHelpPage,
} = require('../core');
const { MODAL_CONFIGS } = require('./modals');

function getData(client, userId) {
  if (!client.embedBuilders) client.embedBuilders = new Map();
  if (!client.embedBuilders.has(userId)) {
    client.embedBuilders.set(userId, {
      blocks: [], buttons: [], mode: 'v1', color: null, history: [], editing: null,
    });
  }
  return client.embedBuilders.get(userId);
}

async function handleButton(interaction, client) {
  const id = interaction.customId;
  const data = getData(client, interaction.user.id);

  // Close
  if (id === 'embed_close') {
    client.embedBuilders.delete(interaction.user.id);
    await interaction.update({ components: [] });
    return true;
  }

  // Home
  if (id === 'eb_home') {
    await interaction.update({ components: buildStartPage(), flags: 1 << 15 | 1 << 6 });
    return true;
  }

  // Start pages
  if (id === 'eb_start_v1') {
    data.mode = 'v1';
    await interaction.update({ components: buildBuilderPage(data, 'v1'), flags: 1 << 15 | 1 << 6 });
    return true;
  }
  if (id === 'eb_start_v2') {
    data.mode = 'v2';
    await interaction.update({ components: buildBuilderPage(data, 'v2'), flags: 1 << 15 | 1 << 6 });
    return true;
  }
  if (id === 'eb_start_edit') {
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
  if (id === 'eb_start_import') {
    const modal = new ModalBuilder().setCustomId('modal_import_json').setTitle('Import JSON');
    modal.addComponents(new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('json_data').setLabel('Paste JSON here').setStyle(TextInputStyle.Paragraph).setRequired(true)
    ));
    await interaction.showModal(modal);
    return true;
  }
  if (id === 'eb_start_help') {
    await interaction.update({ components: buildHelpPage(), flags: 1 << 15 | 1 << 6 });
    return true;
  }

  // Navigation
  if (id === 'eb_back_builder') {
    await interaction.update({ components: buildBuilderPage(data, data.mode), flags: 1 << 15 | 1 << 6 });
    return true;
  }
  if (id === 'eb_back_blocks') {
    await interaction.update({ components: buildBlocksMenu(data), flags: 1 << 15 | 1 << 6 });
    return true;
  }

  // Menus
  if (id === 'eb_blocks') { await interaction.update({ components: buildBlocksMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_manage_blocks') { await interaction.update({ components: buildManageBlocksMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_buttons') { await interaction.update({ components: buildButtonsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_style') { await interaction.update({ components: buildStyleMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_history') { await interaction.update({ components: buildHistoryPanel(data), flags: 1 << 15 | 1 << 6 }); return true; }

  // Clear
  if (id === 'eb_clear_blocks') { data.blocks = []; await interaction.update({ components: buildBlocksMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_clear_buttons') { data.buttons = []; await interaction.update({ components: buildButtonsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_clear_history') { data.history = []; await interaction.update({ components: buildHistoryPanel(data), flags: 1 << 15 | 1 << 6 }); return true; }

  // Reset
  if (id === 'eb_reset') {
    const mode = data.mode;
    client.embedBuilders.set(interaction.user.id, {
      blocks: [], buttons: [], mode, color: null, history: [], editing: null,
    });
    await interaction.update({ components: buildBuilderPage(client.embedBuilders.get(interaction.user.id), mode), flags: 1 << 15 | 1 << 6 });
    return true;
  }

  // Custom color
  if (id === 'eb_color_custom') {
    const modal = new ModalBuilder().setCustomId('modal_color').setTitle('Custom Color');
    modal.addComponents(new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('color').setLabel('Hex color (like #FFFFFF)').setStyle(TextInputStyle.Short).setRequired(true)
    ));
    await interaction.showModal(modal);
    return true;
  }

  // Send
  if (id === 'eb_preview') {
    try {
      const clean = buildEmbedFromBlocks(data);
      if (data.editing) {
        const channel = await interaction.guild.channels.fetch(data.editing.channelId).catch(() => null);
        if (channel) {
          const msg = await channel.messages.fetch(data.editing.messageId).catch(() => null);
          if (msg) {
            await msg.edit({ components: clean, flags: 1 << 15 });
            data.editing = null;
            return interaction.reply({ content: `${emojis.success} Message edited!`, ephemeral: true });
          }
        }
        data.editing = null;
      }
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
      new TextInputBuilder().setCustomId('channel_id').setLabel('Channel ID').setStyle(TextInputStyle.Short).setRequired(true)
    ));
    await interaction.showModal(modal);
    return true;
  }

  if (id === 'eb_export') {
    const exportData = {
      blocks: data.blocks,
      buttons: data.buttons,
      color: data.color,
      mode: data.mode,
    };
    const json = JSON.stringify(exportData);
    if (json.length > 1900) {
      await interaction.reply({ content: 'JSON too long. Try removing some blocks.', ephemeral: true });
    } else {
      await interaction.reply({ content: `\`\`\`json\n${json}\n\`\`\``, ephemeral: true });
    }
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

// ===== HANDLE SELECT MENUS =====
async function handleSelect(interaction, client) {
  const id = interaction.customId;
  const data = getData(client, interaction.user.id);
  const value = interaction.values[0];

  // Block select
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

  // Button select
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

  // Color select
  if (id === 'eb_color_select') {
    data.color = parseInt(value, 16);
    await interaction.update({ components: buildStyleMenu(data), flags: 1 << 15 | 1 << 6 });
    return true;
  }

  // Manage select
  if (id === 'eb_manage_select') {
    if (value === 'move' || value === 'delete') {
      const modal = new ModalBuilder()
        .setCustomId(value === 'move' ? 'modal_move' : 'modal_delete_block')
        .setTitle(value === 'move' ? 'Move Block' : 'Delete Block');

      if (value === 'move') {
        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('from').setLabel('From position').setStyle(TextInputStyle.Short).setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('to').setLabel('To position').setStyle(TextInputStyle.Short).setRequired(true)
          )
        );
      } else {
        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('index').setLabel('Block position').setStyle(TextInputStyle.Short).setRequired(true)
          )
        );
      }
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
   
