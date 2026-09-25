const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const {
  buildStartPage,
  buildBuilderPage,
  buildBlocksMenu,
  buildManageBlocksMenu,
  buildButtonsMenu,
  buildStyleMenu,
  buildHistoryPanel,
  buildHelpPage,
} = require('../../core');

function getData(client, userId) {
  if (!client.embedBuilders) client.embedBuilders = new Map();
  if (!client.embedBuilders.has(userId)) {
    client.embedBuilders.set(userId, {
      blocks: [], buttons: [], mode: 'v1', color: null, history: [], editing: null,
    });
  }
  return client.embedBuilders.get(userId);
}

async function handleNavigation(interaction, client) {
  const id = interaction.customId;
  const data = getData(client, interaction.user.id);

  if (id === 'embed_close') {
    client.embedBuilders.delete(interaction.user.id);
    await interaction.update({ components: [] });
    return true;
  }

  if (id === 'eb_home') {
    await interaction.update({ components: buildStartPage(), flags: 1 << 15 | 1 << 6 });
    return true;
  }

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
  if (id === 'eb_start_msg') {
    data.mode = 'msg';
    await interaction.update({ components: buildBuilderPage(data, 'msg'), flags: 1 << 15 | 1 << 6 });
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

  if (id === 'eb_back_builder') {
    await interaction.update({ components: buildBuilderPage(data, data.mode), flags: 1 << 15 | 1 << 6 });
    return true;
  }
  if (id === 'eb_back_blocks') {
    await interaction.update({ components: buildBlocksMenu(data), flags: 1 << 15 | 1 << 6 });
    return true;
  }

  if (id === 'eb_blocks') { await interaction.update({ components: buildBlocksMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_manage_blocks') { await interaction.update({ components: buildManageBlocksMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_buttons') { await interaction.update({ components: buildButtonsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_style') { await interaction.update({ components: buildStyleMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_history') { await interaction.update({ components: buildHistoryPanel(data), flags: 1 << 15 | 1 << 6 }); return true; }

  return false;
}

module.exports = { handleNavigation, getData };
