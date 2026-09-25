const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'config', 'permissions.js');
const ownersPath = path.join(__dirname, '..', 'config', 'owners.js');

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

function loadOwners() {
  try {
    delete require.cache[require.resolve(ownersPath)];
    return require(ownersPath);
  } catch (err) {
    return { owners: [] };
  }
}

function isBotOwner(userId) {
  const owners = loadOwners();
  return (owners.owners || []).includes(userId);
}

function getServerConfig(config, guildId) {
  if (!config.servers) config.servers = {};
  if (!config.servers[guildId]) {
    config.servers[guildId] = {
      whitelistMode: false,
      allowedUserIds: [],
      allowedRoleIds: [],
      blockedUserIds: [],
      blockedRoleIds: [],
      commands: {},
    };
  }
  return config.servers[guildId];
}

function canUseCommand(member, commandName, guildId, channelId = null) {
  const config = loadConfig();
  if (!config) return true;

  // Bot owner/developer always allowed
  if (isBotOwner(member.id)) return true;

  // Server admins always allowed
  if (member.permissions.has('ManageGuild') || member.permissions.has('Administrator')) {
    return true;
  }

  const global = config.global || {};
  const server = (config.servers || {})[guildId] || {};

  // Global blocked
  if ((global.blockedUserIds || []).includes(member.id)) return false;
  if ((global.blockedRoleIds || []).some(id => member.roles.cache.has(id))) return false;

  // Server blocked
  if ((server.blockedUserIds || []).includes(member.id)) return false;
  if ((server.blockedRoleIds || []).some(id => member.roles.cache.has(id))) return false;

  // Command-specific
  const cmdConfig = server.commands?.[commandName] || {};

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

  const whitelistMode = server.whitelistMode || global.whitelistMode;

  if (whitelistMode) {
    if ((global.allowedUserIds || []).includes(member.id)) return true;
    if ((global.allowedRoleIds || []).some(id => member.roles.cache.has(id))) return true;
    if ((server.allowedUserIds || []).includes(member.id)) return true;
    if ((server.allowedRoleIds || []).some(id => member.roles.cache.has(id))) return true;
    if ((cmdConfig.allowedUserIds || []).includes(member.id)) return true;
    if ((cmdConfig.allowedRoleIds || []).some(id => member.roles.cache.has(id))) return true;
    return false;
  }

  return true;
}

async function checkPermission(context, commandName) {
  const member = context.member;
  if (!member) return true;

  const guildId = context.guild?.id;
  const channelId = context.channel?.id;
  const allowed = canUseCommand(member, commandName, guildId, channelId);
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

async function getDisplayNames(client, guild, userIds = [], roleIds = []) {
  const users = [];
  const roles = [];

  for (const id of userIds) {
    try {
      const member = await guild.members.fetch(id).catch(() => null);
      if (member) users.push({ id, name: member.user.tag });
      else users.push({ id, name: `Unknown User` });
    } catch {
      users.push({ id, name: `Unknown User` });
    }
  }

  for (const id of roleIds) {
    const role = guild.roles.cache.get(id);
    if (role) roles.push({ id, name: role.name });
    else roles.push({ id, name: `Unknown Role` });
  }

  return { users, roles };
}

module.exports = {
  loadConfig,
  saveConfig,
  isBotOwner,
  getServerConfig,
  canUseCommand,
  checkPermission,
  getDisplayNames,
};
