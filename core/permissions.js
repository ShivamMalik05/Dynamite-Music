const { loadPermissions } = require('./config');

// ===== IS BOT OWNER =====
function isBotOwner(userId) {
  const { loadOwners } = require('./config');
  const owners = loadOwners();
  return (owners.owners || []).includes(userId);
}

// ===== CAN USE COMMAND =====
function canUseCommand(member, commandName, guildId, channelId = null) {
  const config = loadPermissions();
  if (!config) return true;

  // Bot owner always allowed
  if (isBotOwner(member.id)) return true;

  // Server admin always allowed
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

// ===== CHECK PERMISSION =====
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

module.exports = {
  isBotOwner,
  canUseCommand,
  checkPermission,
};
