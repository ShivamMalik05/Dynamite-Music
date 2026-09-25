const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { handleButton } = require('../../interactions/embedbuilder');
const emojis = require('../../emojis/emojis');

module.exports = {
  name: 'embedbuilder',
  description: 'Build and send custom embeds',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('embedbuilder')
    .setDescription('Build and send custom embeds')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(context) {
    if (!context.isChatInputCommand || !context.isChatInputCommand()) {
      return context.reply('Use `/embedbuilder` (slash command).');
    }

    if (!context.client.embedBuilders) context.client.embedBuilders = new Map();
    context.client.embedBuilders.set(context.user.id, {
      title: null, description: null, color: null, author: null, authorIcon: null,
      thumbnail: null, image: null, footer: null, fields: [], buttons: [], sections: [],
      mode: 'v1', ephemeral: true, history: [],
    });

    const data = context.client.embedBuilders.get(context.user.id);

    // Build front page using the same builder
    const { buildFront } = require('../../interactions/embedbuilder');

    await context.reply({
      components: buildFront(data),
      flags: 1 << 15 | 1 << 6,
    });
  },
};
