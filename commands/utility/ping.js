module.exports = {
  name: 'ping',
  description: 'Bot ka ping check karo',
  async execute(message) {
    const sent = await message.reply('Pinging...');
    const latency = sent.createdTimestamp - message.createdTimestamp;
    sent.edit(`🏓 Pong! Latency: **${latency}ms**`);
  },
};