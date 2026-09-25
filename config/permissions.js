// ============================================
// PERMISSION CONFIG
// Global = Bot owner/developer only
// Server = Per-server settings
// ============================================

module.exports = {
  // ===== GLOBAL (Bot Owner/Developer) =====
  global: {
    // Bot owner/developer IDs — always have full access
    ownerIds: [
      // '123456789012345678',
    ],
    // Global allowed users (work across all servers)
    allowedUserIds: [],
    // Global allowed roles (work across all servers)
    allowedRoleIds: [],
    // Global blocked
    blockedUserIds: [],
    blockedRoleIds: [],
    // Global whitelist mode
    whitelistMode: false,
  },

  // ===== SERVER-SPECIFIC =====
  servers: {
    // 'guild_id': {
    //   whitelistMode: false,
    //   allowedUserIds: [],
    //   allowedRoleIds: [],
    //   blockedUserIds: [],
    //   blockedRoleIds: [],
    //   commands: {
    //     'ban': {
    //       allowedRoleIds: ['123'],
    //     },
    //   },
    // },
  },
};
