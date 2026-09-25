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
  buildPreview,
} = require('./menus');
const { MODAL_CONFIGS } = require('./modals');

async function handleButton(interaction, client) {
  const id = interaction.customId;

  if (!client.embedBuilders) client.embedBuilders = new Map();
  if (!client.embedBuilders.has(interaction.user.id)) {
    client.embedBuilders.set(interaction.user.id, {
      title: null, description: null, color: null, author: null, authorIcon: null,
      thumbnail: null, image: null, footer: null, fields: [], buttons: [], sections: [],
    });
  }
  const data = client.embedBuilders.get(interaction.user.id);

  if (id === 'embed_close') {
    client.embedBuilders.delete(interaction.user.id);
    await interaction.update({ components: [] });
    return true;
  }
  if (id === 'embed_getstarted' || id === 'eb_main') {
    await interaction.update({ components: buildMain(), flags: 1 << 15 });
    return true;
  }
  if (id === 'eb_back') {
    await interaction.update({ components: buildFront(), flags: 1 << 15 });
    return true;
  }
  if (id === 'eb_reset') {
    client.embedBuilders.set(interaction.user.id, {
      title: null, description: null, color: null, author: null, authorIcon: null,
      thumbnail: null, image: null, footer: null, fields: [], buttons: [], sections: [],
    });
    await interaction.update({ components: buildMain(), flags: 1 << 15 });
    return true;
  }
  if (id === 'eb_content') { await interaction.update({ components: buildContentMenu(), flags: 1 << 15 }); return true; }
  if (id === 'eb_media') { await interaction.update({ components: buildMediaMenu(), flags: 1 << 15 }); return true; }
  if (id === 'eb_fields') { await interaction.update({ components: buildFieldsMenu(), flags: 1 << 15 }); return true; }
  if (id === 'eb_buttons') { await interaction.update({ components: buildButtonsMenu(), flags: 1 << 15 }); return true; }
  if (id === 'eb_sections') { await interaction.update({ components: buildSectionsMenu(), flags: 1 << 15 }); return true; }
  if (id === 'eb_clear_buttons') { data.buttons = []; await interaction.update({ components: buildButtonsMenu(), flags: 1 << 15 }); return true; }
  if (id === 'eb_clear_sections') { data.sections = []; await interaction.update({ components: buildSectionsMenu(), flags: 1 << 15 }); return true; }
  if (id === 'eb_clear_fields') { data.fields = []; await interaction.update({ components: buildFieldsMenu(), flags: 1 << 15 }); return true; }
  if (id === 'eb_preview') { await interaction.update({ components: buildPreview(data), flags: 1 << 15 }); return true; }

  if (id === 'eb_send') {
    try {
      await interaction.channel.send({ components: buildPreview(data).slice(0, -1), flags: 1 << 15 });
      await interaction.reply({ content: `${emojis.success} Embed sent!`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Failed to send.', ephemeral: true });
    }
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

async function handleModal(interaction, client) {
  const data = client.embedBuilders?.get(interaction.user.id);
  if (!data) return interaction.reply({ content: 'Session expired. Please run `/embedbuilder` again.', ephemeral: true });

  try {
    const id = interaction.customId;

    if (id === 'modal_eb_title') data.title = interaction.fields.getTextInputValue('title');
    else if (id === 'modal_eb_desc') data.description = interaction.fields.getTextInputValue('description');
    else if (id === 'modal_eb_color') {
      const c = interaction.fields.getTextInputValue('color');
      data.color = c.startsWith('#') ? parseInt(c.slice(1), 16) : 0x5865F2;
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

      await channel.send({ components: buildPreview(data).slice(0, -1), flags: 1 << 15 });
      return interaction.reply({ content: `${emojis.success} Sent to ${channel}.`, ephemeral: true });
    }

    await interaction.reply({ content: `${emojis.success} Updated!`, ephemeral: true });
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
