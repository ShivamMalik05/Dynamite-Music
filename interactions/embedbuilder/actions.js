const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const {
  buildFront,
  buildMain,
  buildContentMenu,
  buildMediaMenu,
  buildFieldsMenu,
  buildButtonsMenu,
  buildSectionsMenu,
  buildLivePreview,
} = require('./menus');
const { MODAL_CONFIGS } = require('./modals');

// Helper: saare panels — live preview + control panel
function buildEverything(data) {
  const livePreview = buildLivePreview(data, data.mode);
  return livePreview;
}

async function handleButton(interaction, client) {
  const id = interaction.customId;

  if (!client.embedBuilders) client.embedBuilders = new Map();
  if (!client.embedBuilders.has(interaction.user.id)) {
    client.embedBuilders.set(interaction.user.id, {
      title: null, description: null, color: null, author: null, authorIcon: null,
      thumbnail: null, image: null, footer: null, fields: [], buttons: [], sections: [],
      mode: 'v1', ephemeral: true,
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
    // Update current view
    if (interaction.message.components.length === 2 && interaction.message.components[0].components[1]?.components?.some(b => b.custom_id === 'eb_open_v1')) {
      await interaction.update({ components: buildFront(data), flags: 1 << 15 | 1 << 6 });
    } else {
      await interaction.update({ components: buildMain(data, data.mode), flags: 1 << 15 | 1 << 6 });
    }
    return true;
  }
  if (id === 'eb_back') {
    await interaction.update({ components: buildFront(data), flags: 1 << 15 | 1 << 6 });
    return true;
  }
  if (id === 'eb_open_v1') {
    data.mode = 'v1';
    await interaction.update({ components: buildMain(data, 'v1'), flags: 1 << 15 | 1 << 6 });
    return true;
  }
  if (id === 'eb_open_v2') {
    data.mode = 'v2';
    await interaction.update({ components: buildMain(data, 'v2'), flags: 1 << 15 | 1 << 6 });
    return true;
  }
  if (id === 'eb_main') {
    await interaction.update({ components: buildMain(data, data.mode), flags: 1 << 15 | 1 << 6 });
    return true;
  }
  if (id === 'eb_reset') {
    const mode = data.mode;
    const ephemeral = data.ephemeral;
    client.embedBuilders.set(interaction.user.id, {
      title: null, description: null, color: null, author: null, authorIcon: null,
      thumbnail: null, image: null, footer: null, fields: [], buttons: [], sections: [],
      mode, ephemeral,
    });
    await interaction.update({ components: buildMain(client.embedBuilders.get(interaction.user.id), mode), flags: 1 << 15 | 1 << 6 });
    return true;
  }

  if (id === 'eb_content') { await interaction.update({ components: buildContentMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_media') { await interaction.update({ components: buildMediaMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_fields') { await interaction.update({ components: buildFieldsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_buttons') { await interaction.update({ components: buildButtonsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_sections') { await interaction.update({ components: buildSectionsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_clear_buttons') { data.buttons = []; await interaction.update({ components: buildButtonsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_clear_sections') { data.sections = []; await interaction.update({ components: buildSectionsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }
  if (id === 'eb_clear_fields') { data.fields = []; await interaction.update({ components: buildFieldsMenu(data), flags: 1 << 15 | 1 << 6 }); return true; }

  // ===== PREVIEW =====
  if (id === 'eb_preview') {
    // Show preview + action buttons
    const preview = buildLivePreview(data, data.mode);
    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('eb_send').setLabel('Send').setEmoji('📤').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('eb_send_channel').setLabel('Send to Channel').setEmoji('📨').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('eb_main').setLabel('Back to Editor').setEmoji('⬅️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
    );
    await interaction.update({ components: [...preview, actionRow], flags: 1 << 15 | 1 << 6 });
    return true;
  }

  if (id === 'eb_send') {
    try {
      const preview = buildLivePreview(data, data.mode);
      await interaction.channel.send({ components: preview, flags: 1 << 15 });
      await interaction.reply({ content: `${emojis.success} Embed sent!`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Failed to send.', ephemeral: true });
    }
    return true;
  }

  if (id === 'eb_send_channel') {
    const modal = new ModalBuilder().setCustomId('modal_eb_send').setTitle('Send to Channel');
    modal.addComponents(new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('target_channel').setLabel('Channel ID').setStyle(1).setRequired(true)
    ));
    await interaction.showModal(modal);
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

async function handleModal(interaction, client) {
  const data = client.embedBuilders?.get(interaction.user.id);
  if (!data) return interaction.reply({ content: 'Session expired. Please run `/embedbuilder` again.', ephemeral: true });

  try {
    const id = interaction.customId;

    if (id === 'modal_eb_title') data.title = interaction.fields.getTextInputValue('title');
    else if (id === 'modal_eb_desc') data.description = interaction.fields.getTextInputValue('description');
    else if (id === 'modal_eb_color') {
      const c = interaction.fields.getTextInputValue('color');
      data.color = c.startsWith('#') ? parseInt(c.slice(1), 16) : (data.mode === 'v2' ? 0x9B59B6 : 0x5865F2);
    }
    else if (id === 'modal_eb_author') {
      data.author = interaction.fields.getTextInputValue('author');
      data.authorIcon = interaction.fields.getTextInputValue('author_icon') || null;
    }
    else if (id === 'modal_eb_thumb') data.thumbnail = interaction.fields.getTextInputValue('thumbnail');
    else if (id === 'modal_eb_image') data.image = interaction.fields.getTextInputValue('image');
    else if (id === 'modal_eb_footer') data.footer = interaction.fields.getTextInputValue('footer');
    else if (id === 'modal_eb_field') {
      data.fields.push({
        name: interaction.fields.getTextInputValue('field_name'),
        value: interaction.fields.getTextInputValue('field_value'),
      });
    }
    else if (id === 'modal_eb_btn') {
      data.buttons.push({
        label: interaction.fields.getTextInputValue('btn_label'),
        url: interaction.fields.getTextInputValue('btn_url'),
      });
    }
    else if (id === 'modal_eb_section') {
      data.sections.push({
        text: interaction.fields.getTextInputValue('section_text'),
        thumbnail: interaction.fields.getTextInputValue('section_thumb') || null,
      });
    }
    else if (id === 'modal_eb_send') {
      const channelId = interaction.fields.getTextInputValue('target_channel');
      const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
      if (!channel) return interaction.reply({ content: 'Channel not found.', ephemeral: true });

      const preview = buildLivePreview(data, data.mode);
      await channel.send({ components: preview, flags: 1 << 15 });
      return interaction.reply({ content: `${emojis.success} Sent to ${channel}.`, ephemeral: true });
    }

    // ===== HAR EDIT KE BAAD LIVE PREVIEW UPDATE KARO =====
    await interaction.update({
      components: buildMain(data, data.mode),
      flags: 1 << 15 | 1 << 6,
    });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
  }
}

module.exports = {
  handleButton,
  handleModal,
  isEmbedButton: (id) => id.startsWith('embed_') || id.startsWith('eb_') || id.startsWith('preview_'),
  isEmbedModal: (id) => id.startsWith('modal_eb_') || id.startsWith('modal_'),
};
