const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const { checkPermission } = require('../../../utils/permissions');
const { buildMainPanel } = require('./panels');
const { handleButton, handleModal } = require('./handlers');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', '..', '..', 'config', 'warnings.js');

function loadConfig() {
  try {
    delete require.cache[require.resolve(configPath)];
    return require(configPath);
  } catch {
    return { rules: [], autoDelete: { enabled: false }, decay: { enabled: false }, notify: { enabled: false }, silentMode: false };
  }
}

module.exports = {
  name: 'autoaction',
  description: 'Configure auto-action for warnings',
  category: 'Moderation',
  data: new SlashCommandBuilder()
    .setName('autoaction')
    .setDescription('Configure auto-action for warnings')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(context) {
    if (!context.isChatInputCommand || !context.isChatInputCommand()) {
      return context.reply('Use /autoaction (slash command).');
    }

    if (!(await checkPermission(context, 'autoaction'))) return;

    const config = loadConfig();
    const panel = buildMainPanel(config);

    await context.reply({
      components: panel,
      flags: 1 << 15 | 1 << 6,
    });
  },

  handleButton,
  handleModal,
};
