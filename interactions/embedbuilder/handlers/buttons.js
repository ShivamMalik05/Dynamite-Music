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

  // Back to builder
  if (id === 'eb_back_builder') {
    await interaction.update({ components: buildBuilderPage(data, data.mode), flags: 1 << 15 | 1 << 6 });
    return true;
  }
  if (id === 'eb_back_blocks') {
    await interaction.update({ components: buildBlocksMenu(data), flags: 1 << 15 | 1 << 6 });
    return true;
  }

  // Sub-menus
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

  // Colors
  const colors = {
    eb_color_white: 0xFFFFFF, eb_color_blue: 0x5865F2, eb_color_red: 0xED4245,
    eb_color_green: 0x57F287, eb_color_purple: 0x9B59B6, eb_color_pink: 0xEB459E,
    eb_color_yellow: 0xFEE75C,
  };
  if (colors[id]) {
    data.color = colors[id];
    await interaction.update({ components: buildStyleMenu(data), flags: 1 << 15 | 1 << 6 });
    return true;
  }
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
      await interaction.reply({ content: `JSON too long. Use \`/embedbuilder\` to export manually.`, ephemeral: true });
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

module.exports = { handleButton };
