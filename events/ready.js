const { ActivityType } = require('discord.js');
const core = require('../core');
const hybridHandler = require('../handlers/hybridHandler');

module.exports = {
  name: 'ready',
  once: true,

  async execute(client) {
    console.log(`[Ready] Logged in as ${client.user.tag}`);
    console.log(`[Ready] Serving ${client.guilds.cache.size} guilds | ${client.users.cache.size} users`);

    // Set bot presence
    client.user.setPresence({
      activities: [{
        name: `${core.config.prefix}help | ${core.config.botName}`,
        type: ActivityType.Watching,
      }],
      status: 'online',
    });

    // Register slash commands globally
    try {
      const commands = [];
      for (const cmd of client.commands.values()) {
        if (cmd.data) commands.push(cmd.data.toJSON());
      }

      if (commands.length) {
        await client.application.commands.set(commands);
        console.log(`[Ready] ${commands.length} slash commands registered globally`);
      }
    } catch (err) {
      console.error('[Ready] Failed to register slash commands:', err.message);
    }

    // Console summary
    const list = hybridHandler.getAllCommands(client);
    console.log(`[Ready] Slash categories: ${Object.keys(list.slash).join(', ') || 'none'}`);
    console.log(`[Ready] Prefix categories: ${Object.keys(list.prefix).join(', ') || 'none'}`);
    console.log(`[Ready] ${core.config.botName} v${core.config.botVersion} is online!`);
  },
};
