const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const emojis = require('../../../emojis/emojis');
const {
  buildEmbedFromBlocks,
  buildFront,
  buildBlocksMenu,
  buildManageBlocksMenu,
  buildButtonsMenu,
  buildHistoryPanel,
} = require('../core');
const { MODAL_CONFIGS } = require('./modals');

async function handleButton(interaction, client) {
  const id = interaction.customId;

  if (!client.embedBuilders) client.embedBuilders = new Map();
  if (!client.embedBuilders.has(interaction.user.id)) {
    client.embedBuilders.set(interaction.user.id, {
      blocks: [], buttons: [], mode: 'v1', ephemeral: true, history: [], editing: null,
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
  if (id === 'eb_blocks') { await interaction.update({ components: buildBlocksMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_manage_blocks') { await interaction.update({ components: buildManageBlocksMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_buttons') { await interaction.update({ components: buildButtonsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_clear_blocks') { data.blocks = []; await interaction.update({ components: buildBlocksMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_clear_buttons') { data.buttons = []; await interaction.update({ components: buildButtonsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }

  if (id === 'eb_reset') {
    const mode = data.mode;
    const ephemeral = data.ephemeral;
    client.embedBuilders.set(interaction.user.id, {
      blocks: [], buttons: [], mode, ephemeral, history: [], editing: null,
    });
    await interaction.update({ components: buildFront(client.embedBuilders.get(interaction.user.id)), flags: 1 << 15 | 1 << 6 });
    return true;
  }

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
