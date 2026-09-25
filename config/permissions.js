// ============================================
// PERMISSION CONFIG
// Control who can use which commands
// ============================================

module.exports = {
  // ===== GLOBAL SETTINGS =====
  // If true, only users with allowedRoleIds or allowedUserIds can use commands
  // Server admins (ManageGuild permission) are ALWAYS allowed
  whitelistMode: false,

  // ===== ALLOWED USERS (by ID) =====
  allowedUserIds: [
    // '123456789012345678',
  ],

  // ===== ALLOWED ROLES (by ID) =====
  allowedRoleIds: [
    // '123456789012345678',
  ],

  // ===== BLOCKED USERS (by ID) =====
  blockedUserIds: [
    // '123456789012345678',
  ],

  // ===== BLOCKED ROLES (by ID) =====
  blockedRoleIds: [
    // '123456789012345678',
  ],

  // ===== PER-COMMAND OVERRIDES =====
  // You can override global settings for specific commands
  commands: {
    // 'ban': {
    //   allowedRoleIds: ['123456789'],
    //   allowedUserIds: ['987654321'],
    //   blockedRoleIds: [],
    //   blockedUserIds: [],
    // },
  },
};
