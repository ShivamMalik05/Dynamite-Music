const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
} = require('discord.js');
const emojis = require('../emojis/emojis');

// ===== FRONT PAGE =====
function buildFront() {
  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.star} Embed Builder\n**Create and send custom messages or embeds**`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Welcome to the **Embed Builder** — a powerful tool to create and send custom messages, embeds, and Components V2 containers.\n\n` +
        `**What you can do:**\n` +
        `${emojis.arrowRight} Send plain text messages\n` +
        `${emojis.arrowRight} Create classic V1 embeds\n` +
        `${emojis.arrowRight} Create modern V2 embeds\n` +
        `${emojis.arrowRight} Edit messages by ID\n` +
        `${emojis.arrowRight} Send to any channel by ID\n\n` +
        `*Click **Get Started** below to begin.*`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`));

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('embed_getstarted').setLabel('Get Started').setEmoji('🚀').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, buttons];
}

// ===== MAIN PAGE =====
function buildMain() {
  const container = new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.star} Embed Builder — Options\n**Choose what you want to create**`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `📝 **Message**\n${emojis.arrowRight} Send a plain text message\n\n` +
        `📋 **V1 Embed**\n${emojis.arrowRight} Classic embed with title, desc, color\n\n` +
        `✨ **V2 Embed**\n${emojis.arrowRight} Modern Components V2 container\n\n` +
        `✏️ **Edit by ID**\n${emojis.arrowRight} Edit existing message via channel + message ID\n\n` +
        `📤 **Send to Channel**\n${emojis.arrowRight} Send content to a specific channel`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`));

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('embed_msg').setLabel('Message').setEmoji('📝').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('embed_v1').setLabel('V1 Embed').setEmoji('📋').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('embed_v2').setLabel('V2 Embed').setEmoji('✨').setStyle(ButtonStyle.Success)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('embed_edit').setLabel('Edit by ID').setEmoji('✏️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('embed_channel').setLabel('Send to Channel').setEmoji('📤').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('embed_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('embed_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Secondary)
  );

  return [container, row1, row2, row3];
}

// ===== PREVIEW PAGE =====
function buildPreview(type, data) {
  const colorMap = { msg: 0x57F287, v1: 0x5865F2, v2: 0x9B59B6, edit: 0xFEE75C, channel: 0x1ABC9C };
  const titleMap = {
    msg: '📝 Message Preview',
    v1: '📋 V1 Embed Preview',
    v2: '✨ V2 Embed Preview',
    edit: '✏️ Edit Preview',
    channel: '📤 Channel Send Preview',
  };

  const container = new ContainerBuilder()
    .setAccentColor(colorMap[type] || 0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${titleMap[type] || 'Preview'}\n**Review your content before sending**`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

  let body = '';

  if (type === 'msg') {
    body = `**Channel:** ${data.channel ? `<#${data.channel.id}>` : 'Current channel'}\n**Content:**\n${data.content}`;
  } else if (type === 'v1') {
    body = `**Channel:** ${data.channel ? `<#${data.channel.id}>` : 'Current channel'}\n` +
      `**Title:** ${data.title}\n**Description:**\n${data.description}\n` +
      `**Color:** ${data.color || '#5865F2'}\n**Footer:** ${data.footer || 'None'}`;
  } else if (type === 'v2') {
    body = `**Channel:** ${data.channel ? `<#${data.channel.id}>` : 'Current channel'}\n` +
      `**Title:** ${data.title}\n**Content:**\n${data.content}\n` +
      `**Accent Color:** ${data.color || '#5865F2'}`;
  } else if (type === 'edit') {
    body = `**Channel:** <#${data.channel.id}>\n**Message ID:** ${data.messageId}\n**New Content:**\n${data.content}`;
  } else if (type === 'channel') {
    body = `**Channel:** <#${data.channel.id}>\n**Content:**\n${data.content}`;
  }

  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(body));
  container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Click **Confirm** to send, **Cancel** to go back.*`));

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('preview_confirm').setLabel('Confirm').setEmoji('✅').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('preview_cancel').setLabel('Cancel').setEmoji('❌').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('preview_back').setLabel('Back to Options').setEmoji('⬅️').setStyle(ButtonStyle.Secondary)
  );

  return [container, buttons];
}

// ===== SEND SUCCESS =====
function buildSuccess() {
  const container = new ContainerBuilder()
    .setAccentColor(0x57F287)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${emojis.success} Sent!\n**Your content has been sent successfully.**`)
    );
  return [container];
}

// ===== MODAL CONFIGS =====
const MODAL_CONFIGS = {
  embed_msg: { id: 'modal_msg', title: 'Send a Message', fields: [
    { id: 'msg_channel', label: 'Channel ID (or leave empty for current)', style: TextInputStyle.Short, required: false },
    { id: 'msg_content', label: 'Message content', style: TextInputStyle.Paragraph, required: true },
  ]},
  embed_v1: { id: 'modal_v1', title: 'Create V1 Embed', fields: [
    { id: 'v1_channel', label: 'Channel ID (or leave empty for current)', style: TextInputStyle.Short, required: false },
    { id: 'v1_title', label: 'Title', style: TextInputStyle.Short, required: true },
    { id: 'v1_description', label: 'Description', style: TextInputStyle.Paragraph, required: true },
    { id: 'v1_color', label: 'Color (hex, like #5865F2)', style: TextInputStyle.Short, required: false },
    { id: 'v1_footer', label: 'Footer text', style: TextInputStyle.Short, required: false },
  ]},
  embed_v2: { id: 'modal_v2', title: 'Create V2 Embed', fields: [
    { id: 'v2_channel', label: 'Channel ID (or leave empty for current)', style: TextInputStyle.Short, required: false },
    { id: 'v2_title', label: 'Title', style: TextInputStyle.Short, required: true },
    { id: 'v2_content', label: 'Content', style: TextInputStyle.Paragraph, required: true },
    { id: 'v2_color', label: 'Accent Color (hex, like #5865F2)', style: TextInputStyle.Short, required: false },
  ]},
  embed_edit: { id: 'modal_edit', title: 'Edit Message by ID', fields: [
    { id: 'edit_channel', label: 'Channel ID', style: TextInputStyle.Short, required: true },
    { id: 'edit_message', label: 'Message ID', style: TextInputStyle.Short, required: true },
    { id: 'edit_content', label: 'New content', style: TextInputStyle.Paragraph, required: true },
  ]},
  embed_channel: { id: 'modal_channel', title: 'Send to Channel', fields: [
    { id: 'send_channel', label: 'Channel ID', style: TextInputStyle.Short, required: true },
    { id: 'send_content', label: 'Content', style: TextInputStyle.Paragraph, required: true },
  ]},
};

async function handleButton(interaction, client) {
  const id = interaction.customId;

  if (id === 'embed_close') {
    await interaction.update({ components: [] });
    return true;
  }

  if (id === 'embed_getstarted' || id === 'preview_back' || id === 'preview_cancel') {
    await interaction.update({ components: buildMain(), flags: 1 << 15 });
    return true;
  }

  if (id === 'embed_back') {
    await interaction.update({ components: buildFront(), flags: 1 << 15 });
    return true;
  }

  if (id === 'preview_confirm') {
    const pending = client.pendingEmbeds?.get(interaction.message.id);
    if (!pending) {
      await interaction.reply({ content: 'Preview expired. Please start again.', ephemeral: true });
      return true;
    }

    try {
      if (pending.type === 'msg' || pending.type === 'channel') {
        await pending.channel.send(pending.content);
      } else if (pending.type === 'v1') {
        const embed = new EmbedBuilder().setTitle(pending.title).setDescription(pending.description);
        if (pending.color) embed.setColor(pending.color.startsWith('#') ? parseInt(pending.color.slice(1), 16) : 0x5865F2);
        if (pending.footer) embed.setFooter({ text: pending.footer });
        await pending.channel.send({ embeds: [embed] });
      } else if (pending.type === 'v2') {
        const c = new ContainerBuilder()
          .setAccentColor(pending.color?.startsWith('#') ? parseInt(pending.color.slice(1), 16) : 0x5865F2)
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${pending.title}`))
          .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(pending.content))
          .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
          .addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`));
        await pending.channel.send({ components: [c], flags: 1 << 15 });
      } else if (pending.type === 'edit') {
        const msg = await pending.channel.messages.fetch(pending.messageId).catch(() => null);
        if (msg) await msg.edit(pending.content);
      }

      client.pendingEmbeds.delete(interaction.message.id);
      await interaction.update({ components: buildSuccess(), flags: 1 << 15 });
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
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId(f.id).setLabel(f.label).setStyle(f.style).setRequired(f.required)
        )
      );
    }
    await interaction.showModal(modal);
    return true;
  }

  return false;
}

async function handleModal(interaction, client) {
  try {
    let type, data;

    if (interaction.customId === 'modal_msg') {
      const channelId = interaction.fields.getTextInputValue('msg_channel');
      const content = interaction.fields.getTextInputValue('msg_content');
      const channel = channelId ? await interaction.guild.channels.fetch(channelId).catch(() => null) : interaction.channel;
      if (!channel) return interaction.reply({ content: 'Channel not found.', ephemeral: true });
      type = 'msg'; data = { channel, content };
    } else if (interaction.customId === 'modal_v1') {
      const channelId = interaction.fields.getTextInputValue('v1_channel');
      const title = interaction.fields.getTextInputValue('v1_title');
      const description = interaction.fields.getTextInputValue('v1_description');
      const color = interaction.fields.getTextInputValue('v1_color');
      const footer = interaction.fields.getTextInputValue('v1_footer');
      const channel = channelId ? await interaction.guild.channels.fetch(channelId).catch(() => null) : interaction.channel;
      if (!channel) return interaction.reply({ content: 'Channel not found.', ephemeral: true });
      type = 'v1'; data = { channel, title, description, color, footer };
    } else if (interaction.customId === 'modal_v2') {
      const channelId = interaction.fields.getTextInputValue('v2_channel');
      const title = interaction.fields.getTextInputValue('v2_title');
      const content = interaction.fields.getTextInputValue('v2_content');
      const color = interaction.fields.getTextInputValue('v2_color');
      const channel = channelId ? await interaction.guild.channels.fetch(channelId).catch(() => null) : interaction.channel;
      if (!channel) return interaction.reply({ content: 'Channel not found.', ephemeral: true });
      type = 'v2'; data = { channel, title, content, color };
    } else if (interaction.customId === 'modal_edit') {
      const channelId = interaction.fields.getTextInputValue('edit_channel');
      const messageId = interaction.fields.getTextInputValue('edit_message');
      const content = interaction.fields.getTextInputValue('edit_content');
      const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
      if (!channel) return interaction.reply({ content: 'Channel not found.', ephemeral: true });
      const msg = await channel.messages.fetch(messageId).catch(() => null);
      if (!msg) return interaction.reply({ content: 'Message not found.', ephemeral: true });
      type = 'edit'; data = { channel, messageId, content };
    } else if (interaction.customId === 'modal_channel') {
      const channelId = interaction.fields.getTextInputValue('send_channel');
      const content = interaction.fields.getTextInputValue('send_content');
      const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
      if (!channel) return interaction.reply({ content: 'Channel not found.', ephemeral: true });
      type = 'channel'; data = { channel, content };
    }

    if (!type) return false;

    if (!client.pendingEmbeds) client.pendingEmbeds = new Map();
    data.type = type;

    const previewMsg = await interaction.reply({
      components: buildPreview(type, data),
      flags: 1 << 15,
      fetchReply: true,
    });

    client.pendingEmbeds.set(previewMsg.id, data);
    setTimeout(() => client.pendingEmbeds?.delete(previewMsg.id), 5 * 60 * 1000);
    return true;
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
    return true;
  }
}

module.exports = {
  buildFront,
  buildMain,
  buildPreview,
  handleButton,
  handleModal,
  isEmbedButton: (id) => id.startsWith('embed_') || id.startsWith('preview_'),
  isEmbedModal: (id) => id.startsWith('modal_'),
};
