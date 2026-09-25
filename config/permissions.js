module.exports = {
  // ===== GLOBAL SETTINGS =====
  global: {
    whitelistMode: false,
    allowedUserIds: [],
    allowedRoleIds: [],
    blockedUserIds: [],
    blockedRoleIds: [],
  },

  // ===== PER-COMMAND OVERRIDES =====
  commands: {
    // 'ban': {
    //   whitelistMode: true,
    //   allowedRoleIds: ['123456789'],
    //   channels: {
    //     'channel_id': { allowed: true },
    //     'channel_id2': { blocked: true },
    //   },
    // },
  },

  // ===== SERVER-SPECIFIC (future multi-server support) =====
  servers: {
    // 'guild_id': {
    //   global: { ... },
    //   commands: { ... },
    // },
  },
};
