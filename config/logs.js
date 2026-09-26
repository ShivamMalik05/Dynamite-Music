module.exports = {
  // ===== CHANNELS =====
  channels: {
    moderation: '',
    messages: '',
    members: '',
    channels: '',
    roles: '',
    voice: '',
    server: '',
    warn: '',
    autoaction: '',
    lock: '',
  },

  // ===== ENABLED =====
  enabled: {
    moderation: true,
    messages: true,
    members: true,
    channels: true,
    roles: true,
    voice: true,
    server: true,
    warn: true,
    autoaction: true,
    lock: true,
  },

  // ===== COLORS =====
  colors: {
    moderation: 0xED4245,
    messages: 0xFEE75C,
    members: 0x57F287,
    channels: 0x5865F2,
    roles: 0xEB459E,
    voice: 0x1ABC9C,
    server: 0x9B59B6,
    warn: 0xFEE75C,
    autoaction: 0xE67E22,
    lock: 0xE67E22,
  },

  // ===== LOG FORMAT =====
  format: 'detailed', // compact, detailed, minimal

  // ===== SMART FILTERS =====
  filters: {
    messageContainsLink: false,
    messageContainsMention: false,
    messageContainsAttachment: false,
    onlyOfficeHours: false,
    officeStart: 9,
    officeEnd: 18,
  },

  // ===== ROLE-BASED ROUTING =====
  roleRouting: {
    enabled: false,
    // 'role_id': 'channel_id',
  },

  // ===== LOG PRIORITY =====
  priority: {
    enabled: false,
    // 'moderation': 'high', 'messages': 'low',
  },

  // ===== AUTO-ARCHIVE =====
  autoArchive: {
    enabled: false,
    threshold: 1000,
    archiveCategory: '',
  },

  // ===== LOG REACTIONS =====
  reactions: {
    enabled: false,
    emojis: {
      ignore: '✅',
      review: '⚠️',
      important: '⭐',
    },
  },

  // ===== TIME-BASED =====
  timeBased: {
    enabled: false,
    timezone: 'Asia/Kolkata',
    activeHours: [0, 24],
  },

  // ===== IGNORE =====
  ignoredChannels: [],
  ignoredRoles: [],
  ignoredUsers: [],
};
