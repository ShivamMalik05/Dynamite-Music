const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const { buildFront } = require('../../interactions/embedbuilder/core');

module.exports = {
  name: 'embedbuilder',
  description: 'Ultimate embed builder',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('embedbuilder')
    .setDescription('Ultimate embed builder — blocks, roles, images, everything')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(context) {
    if (!context.isChatInputCommand || !context.isChatInputCommand()) {
      return context.reply('Use `/embedbuilder` (slash command).');
    }

    if (!context.client.embedBuilders) context.client.embedBuilders = new Map();
    context.client.embedBuilders.set(context.user.id, {
      blocks: [], buttons: [], mode: 'v1', ephemeral: true, history: [], editing: null,
    });

    const data = context.client.embedBuilders.get(context.user.id);

    await context.reply({
      components: buildFront(data),
      flags: 1 << 15 | 1 << 6,
    });
  },
};
