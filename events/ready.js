module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`Bot online: ${client.user.tag}`);
    client.user.setActivity('!help | /help');
  },
};
