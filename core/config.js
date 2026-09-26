const config = require('../config/config');
const nopConfig = require('../config/nop');
const emojiConfig = require('../config/emojis');
const logConfig = require('../config/logs');
const warningConfig = require('../config/warnings');
const permissionConfig = require('../config/permissions');
const ownerConfig = require('../config/owners');

module.exports = {
  // Bot
  botName: config.botName,
  botVersion: config.botVersion,
  botDescription: config.botDescription,

  // Prefix
  prefix: config.prefix,

  // Colors
  colors: config.colors,

  // Embed
  embed: config.embed,

  // Features
  features: config.features,

  // NOP
  nop: nopConfig,

  // Emojis
  emojis: emojiConfig,

  // Logs
  logs: logConfig,

  // Warnings
  warnings: warningConfig,

  // Permissions
  permissions: permissionConfig,

  // Owners
  owners: ownerConfig.owners,
};
