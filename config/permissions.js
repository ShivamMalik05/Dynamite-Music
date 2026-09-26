module.exports = {
  // ===== GLOBAL =====
  global: {
    whitelistMode: false,
    allowedUserIds: [],
    allowedRoleIds: [],
    blockedUserIds: [],
    blockedRoleIds: [],
  },

  // ===== SERVER-SPECIFIC =====
  // Format: { 'guildId': { ... } }
  servers: {},

  // ===== COMMAND-SPECIFIC =====
  // Format: { 'commandName': { ... } }
  commands: {},
};
