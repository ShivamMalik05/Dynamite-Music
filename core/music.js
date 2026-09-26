// Music system core — Lavalink ya Discord Player

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
