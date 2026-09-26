module.exports = {
  // ===== GLOBAL NOP =====
  enabled: false,

  // ===== CATEGORIES =====
  // 'fun', 'utility', 'all'
  categories: [],

  // ===== ALLOWED SERVERS =====
  // Server IDs where NOP is enabled
  servers: [],

  // ===== ALLOWED CHANNELS =====
  // Format: { 'serverId': ['channelId1', 'channelId2'] }
  channels: {},

  // ===== ALLOWED USERS =====
  // Format: { 'serverId': ['userId1', 'userId2'] }
  users: {},

  // ===== ALLOWED ROLES =====
  // Format: { 'serverId': ['roleId1', 'roleId2'] }
  roles: {},

  // ===== COMMANDS =====
  // Format: { 'serverId': ['command1', 'command2'] }
  // Empty = all commands in allowed categories
  commands: {},

  // ===== LOGS =====
  logs: {
    enabled: true,
    channel: '', // Channel ID for NOP logs
  },
};
