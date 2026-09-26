// Music system core - Lavalink or Discord Player will be integrated here
// Basic structure for now, commands will be added in Phase 12

module.exports = {
  queues: new Map(), // guildId -> queue

  getQueue(guildId) {
    return this.queues.get(guildId) || null;
  },

  createQueue(guildId, voiceChannel, textChannel) {
    const queue = {
      guildId,
      voiceChannel,
      textChannel,
      songs: [],
      playing: false,
      volume: 100,
      loop: 'off', // off, song, queue
    };
    this.queues.set(guildId, queue);
    return queue;
  },

  deleteQueue(guildId) {
    this.queues.delete(guildId);
  },
};
