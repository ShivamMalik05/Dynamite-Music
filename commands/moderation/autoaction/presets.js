module.exports = {
  lenient: [
    { id: 1, warnings: 5, action: 'mute', duration: 10, enabled: true, priority: 1 },
    { id: 2, warnings: 10, action: 'mute', duration: 60, enabled: true, priority: 2 },
    { id: 3, warnings: 15, action: 'kick', enabled: true, priority: 3 },
  ],
  balanced: [
    { id: 1, warnings: 3, action: 'mute', duration: 10, enabled: true, priority: 1 },
    { id: 2, warnings: 5, action: 'mute', duration: 60, enabled: true, priority: 2 },
    { id: 3, warnings: 7, action: 'kick', enabled: true, priority: 3 },
    { id: 4, warnings: 10, action: 'ban', enabled: true, priority: 4 },
  ],
  strict: [
    { id: 1, warnings: 1, action: 'mute', duration: 5, enabled: true, priority: 1 },
    { id: 2, warnings: 2, action: 'mute', duration: 30, enabled: true, priority: 2 },
    { id: 3, warnings: 3, action: 'mute', duration: 60, enabled: true, priority: 3 },
    { id: 4, warnings: 4, action: 'kick', enabled: true, priority: 4 },
    { id: 5, warnings: 5, action: 'ban', enabled: true, priority: 5 },
  ],
};
