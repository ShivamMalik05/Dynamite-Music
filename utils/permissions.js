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

/**
 * Check if a user can use a command
 * @param {GuildMember} member - Discord member
 * @param {string} commandName - Command name
 * @returns {boolean} - true if allowed
 */
function canUseCommand(member, commandName) {
  const config = loadConfig();
  if (!config) return true;

  // Server admins are always allowed
  if (member.permissions.has('ManageGuild') || member.permissions.has('Administrator')) {
    return true;
  }

  // Get per-command settings or global settings
  const cmdConfig = config.commands?.[commandName] || {};

  const allowedUserIds = cmdConfig.allowedUserIds || config.allowedUserIds || [];
  const allowedRoleIds = cmdConfig.allowedRoleIds || config.allowedRoleIds || [];
  const blockedUserIds = cmdConfig.blockedUserIds || config.blockedUserIds || [];
  const blockedRoleIds = cmdConfig.blockedRoleIds || config.blockedRoleIds || [];

  // Blocked users always blocked
  if (blockedUserIds.includes(member.id)) return false;

  // Blocked roles always blocked
  if (blockedRoleIds.some(id => member.roles.cache.has(id))) return false;

  // Whitelist mode
  const whitelistMode = cmdConfig.whitelistMode ?? config.whitelistMode;

  if (whitelistMode) {
    if (allowedUserIds.includes(member.id)) return true;
    if (allowedRoleIds.some(id => member.roles.cache.has(id))) return true;
    return false;
  }

  // If there are explicit allowed users/roles, check them
  if (allowedUserIds.length > 0 || allowedRoleIds.length > 0) {
    if (allowedUserIds.includes(member.id)) return true;
    if (allowedRoleIds.some(id => member.roles.cache.has(id))) return true;
    return false;
  }

  // Default: allow
  return true;
}

/**
 * Check and reply if user cannot use command
 * @returns {boolean} - true if should proceed, false if blocked
 */
async function checkPermission(context, commandName) {
  const member = context.isChatInputCommand?.() ? context.member : context.member;
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

module.exports = { canUseCommand, checkPermission, loadConfig };
