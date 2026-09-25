const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const { buildStartPage } = require('../../interactions/embedbuilder/core');

module.exports = {
  name: 'embedbuilder',
  description: 'Ultimate embed builder — Discord par aaj tak jo nahi bana',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('embedbuilder')
    .setDescription('Ultimate embed builder — blocks, roles, images, export/import')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(context) {
    if (!context.isChatInputCommand || !context.isChatInputCommand()) {
      return context.reply('Use `/embedbuilder` (slash command).');
    }

    if (!context.client.embedBuilders) context.client.embedBuilders = new Map();
    context.client.embedBuilders.set(context.user.id, {
      blocks: [], buttons: [], mode: 'v1', color: null, history: [], editing: null,
    });

    await context.reply({
      components: buildStartPage(),
      flags: 1 << 15 | 1 << 6,
    });
  },
};
