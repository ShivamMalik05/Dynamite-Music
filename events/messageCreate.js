module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message, client) {
    try {
      // Ignore bots
      if (message.author.bot) return;

      // Ignore DMs
      if (!message.guild) return;

      // Check prefix
      const prefix = '!';
      if (!message.content.startsWith(prefix)) return;

      // Parse command
      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      // Find command
      const command = client.commands.get(commandName);
      if (!command) return;

      // Execute
      try {
        await command.execute(message, args);
      } catch (error) {
        console.error(`Prefix error [${commandName}]:`, error);
        const reply = await message.reply(`❌ Error: ${error.message}`).catch(() => null);
        if (reply) setTimeout(() => reply.delete().catch(() => {}), 3000);
      }
    } catch (error) {
      console.error('messageCreate error:', error);
    }
  },
};
