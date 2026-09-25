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

function canUseCommand(member, commandName, channelId = null) {
  const config = loadConfig();
  if (!config) return true;

  // Admins always allowed
  if (member.permissions.has('ManageGuild') || member.permissions.has('Administrator')) {
    return true;
  }

  // Global settings
  const globalConfig = config.global || {};
  const cmdConfig = config.commands?.[commandName] || {};

  // Blocked users (global)
  if ((globalConfig.blockedUserIds || []).includes(member.id)) return false;
  if ((globalConfig.blockedRoleIds || []).some(id => member.roles.cache.has(id))) return false;

  // Blocked users (command)
  if ((cmdConfig.blockedUserIds || []).includes(member.id)) return false;
  if ((cmdConfig.blockedRoleIds || []).some(id => member.roles.cache.has(id))) return false;

  // Channel-specific
  if (channelId && cmdConfig.channels) {
    const chConfig = cmdConfig.channels[channelId];
    if (chConfig) {
      if (chConfig.blocked) return false;
      if (chConfig.allowedUserIds?.includes(member.id)) return true;
      if (chConfig.allowedRoleIds?.some(id => member.roles.cache.has(id))) return true;
    }
  }

  // Whitelist mode
  const whitelistMode = cmdConfig.whitelistMode ?? globalConfig.whitelistMode;

  if (whitelistMode) {
    if ((globalConfig.allowedUserIds || []).includes(member.id)) return true;
    if ((globalConfig.allowedRoleIds || []).some(id => member.roles.cache.has(id))) return true;
    if ((cmdConfig.allowedUserIds || []).includes(member.id)) return true;
    if ((cmdConfig.allowedRoleIds || []).some(id => member.roles.cache.has(id))) return true;
    return false;
  }

  // If explicit allowed lists exist
  const hasAllowed =
    (globalConfig.allowedUserIds?.length || 0) > 0 ||
    (globalConfig.allowedRoleIds?.length || 0) > 0 ||
    (cmdConfig.allowedUserIds?.length || 0) > 0 ||
    (cmdConfig.allowedRoleIds?.length || 0) > 0;

  if (hasAllowed) {
    if ((globalConfig.allowedUserIds || []).includes(member.id)) return true;
    if ((globalConfig.allowedRoleIds || []).some(id => member.roles.cache.has(id))) return true;
    if ((cmdConfig.allowedUserIds || []).includes(member.id)) return true;
    if ((cmdConfig.allowedRoleIds || []).some(id => member.roles.cache.has(id))) return true;
    return false;
  }

  return true;
}

async function checkPermission(context, commandName) {
  const member = context.member;
  if (!member) return true;

  const channelId = context.channel?.id;
  const allowed = canUseCommand(member, commandName, channelId);
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

// Get user/role names from IDs
async function getDisplayNames(client, guild, userIds = [], roleIds = []) {
  const users = [];
  const roles = [];

  for (const id of userIds) {
    try {
      const member = await guild.members.fetch(id).catch(() => null);
      if (member) users.push({ id, name: member.user.tag });
      else users.push({ id, name: `Unknown (${id})` });
    } catch {
      users.push({ id, name: `Unknown (${id})` });
    }
  }

  for (const id of roleIds) {
    const role = guild.roles.cache.get(id);
    if (role) roles.push({ id, name: role.name });
    else roles.push({ id, name: `Unknown (${id})` });
  }

  return { users, roles };
}

module.exports = {
  loadConfig,
  saveConfig,
  canUseCommand,
  checkPermission,
  getDisplayNames,
};
