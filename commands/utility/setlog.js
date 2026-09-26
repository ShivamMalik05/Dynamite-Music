const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const { loadConfig } = require('../../utils/logger');
const setlog = require('../../interactions/setlog');

module.exports = {
  name: 'setlog',
  description: 'Setup log channels with an interactive panel',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('setlog')
    .setDescription('Setup log channels with an interactive panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(context) {
    if (!context.isChatInputCommand || !context.isChatInputCommand()) {
      return context.reply('Use /setlog (slash command).');
    }

    const config = loadConfig();
    const pageIndex = 0;

    await context.reply({
      components: [
        setlog.buildPage(config, pageIndex),
        ...setlog.buildTypeDropdown(pageIndex),
        ...setlog.buildCategoryDropdown(),
        ...setlog.buildNavButtons(pageIndex),
      ],
      flags: 1 << 15 | 1 << 6,
    });
  },
};
