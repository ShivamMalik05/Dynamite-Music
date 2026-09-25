const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'config', 'permissions.js');

function loadConfig() {
  try {
    delete require.cache[require.resolve(configPath)];
    return require(configPath);
  } catch (err) {
    console.error('Failed to load permissions config:', err.message);
    return null;
  }
}

function saveConfig(config) {
  const content = `module.exports = ${JSON.stringify(config, null, 2)};\n`;
  fs.writeFileSync(configPath, content);
}

function canUseCommand(member, commandName) {
  const config = loadConfig();
  if (!config) return true;

  if (member.permissions.has('ManageGuild') || member.permissions.has('Administrator')) {
    return true;
  }

  const cmdConfig = config.commands?.[commandName] || {};

  const allowedUserIds = cmdConfig.allowedUserIds || config.allowedUserIds || [];
  const allowedRoleIds = cmdConfig.allowedRoleIds || config.allowedRoleIds || [];
  const blockedUserIds = cmdConfig.blockedUserIds || config.blockedUserIds || [];
  const blockedRoleIds = cmdConfig.blockedRoleIds || config.blockedRoleIds || [];

  if (blockedUserIds.includes(member.id)) return false;
  if (blockedRoleIds.some(id => member.roles.cache.has(id))) return false;

  const whitelistMode = cmdConfig.whitelistMode ?? config.whitelistMode;

  if (whitelistMode) {
    if (allowedUserIds.includes(member.id)) return true;
    if (allowedRoleIds.some(id => member.roles.cache.has(id))) return true;
    return false;
  }

  if (allowedUserIds.length > 0 || allowedRoleIds.length > 0) {
    if (allowedUserIds.includes(member.id)) return true;
    if (allowedRoleIds.some(id => member.roles.cache.has(id))) return true;
    return false;
  }

  return true;
}

async function checkPermission(context, commandName) {
  const member = context.member;
  if (!member) return true;

  const allowed = canUseCommand(member, commandName);
  if (!allowed) {
    const msg = '❌ You do not have permission to use this command.';
    if (context.isChatInputCommand?.()) {
      await context.reply({ content: msg, ephemeral: true });
    } else {
      await context.reply(msg);
    }
    return false;
  }
  return true;
}

module.exports = {
  loadConfig,
  saveConfig,
  canUseCommand,
  checkPermission,
};
