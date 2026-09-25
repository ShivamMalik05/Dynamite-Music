const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const emojis = require('../../../../emojis/emojis');
const {
  buildEmbedFromBlocks,
  buildMessageOnly,
  buildBuilderPage,
  buildBlocksMenu,
  buildButtonsMenu,
  buildHistoryPanel,
} = require('../../core');
const { getData } = require('./navigation');

async function handleAction(interaction, client) {
  const id = interaction.customId;
  const data = getData(client, interaction.user.id);

  if (id === 'eb_clear_blocks') {
    data.blocks = [];
    await interaction.update({ components: buildBlocksMenu(data), flags: 1 << 15 | 1 << 6 });
    return true;
  }
  if (id === 'eb_clear_buttons') {
    data.buttons = [];
    await interaction.update({ components: buildButtonsMenu(data), flags: 1 << 15 | 1 << 6 });
    return true;
  }
  if (id === 'eb_clear_history') {
    data.history = [];
    await interaction.update({ components: buildHistoryPanel(data), flags: 1 << 15 | 1 << 6 });
    return true;
  }

  if (id === 'eb_reset') {
    const mode = data.mode;
    client.embedBuilders.set(interaction.user.id, {
      blocks: [], buttons: [], mode, color: null, history: [], editing: null,
    });
    await interaction.update({
      components: buildBuilderPage(client.embedBuilders.get(interaction.user.id), mode),
      flags: 1 << 15 | 1 << 6,
    });
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

  if (id === 'eb_preview') {
    try {
      if (data.mode === 'msg') {
        const msgData = buildMessageOnly(data);
        const payload = { content: msgData.content };
        if (msgData.components?.length) payload.components = msgData.components;

        if (data.editing) {
          const channel = await interaction.guild.channels.fetch(data.editing.channelId).catch(() => null);
          if (channel) {
            const msg = await channel.messages.fetch(data.editing.messageId).catch(() => null);
            if (msg) {
              await msg.edit(payload);
              data.editing = null;
              return interaction.reply({ content: `${emojis.success} Message edited!`, ephemeral: true });
            }
          }
          data.editing = null;
        }
        await interaction.channel.send(payload);
      } else {
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
      }
      await interaction.reply({ content: `${emojis.success} Sent!`, ephemeral: true });
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

  return false;
}

module.exports = { handleAction };
