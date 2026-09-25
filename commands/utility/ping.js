const emojis = require('../../emojis/emojis');

module.exports = {
  name: 'ping',
  description: 'Check bot latency',
  async execute(message) {
    const sent = await message.reply(`${emojis.loading} Pinging...`);
    const latency = sent.createdTimestamp - message.createdTimestamp;
    sent.edit(`${emojis.ping} Pong! Latency: **${latency}ms**`);
  },
};
