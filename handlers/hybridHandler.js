const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

module.exports = {
  loadCommands(client) {
    client.commands = new Collection();
    client.prefixCommands = new Collection();

    const commandsPath = path.join(__dirname, '..', 'commands');
    if (!fs.existsSync(commandsPath)) {
      console.warn('[HybridHandler] commands folder not found');
      return;
    }

    const categories = fs.readdirSync(commandsPath);

    for (const category of categories) {
      const categoryPath = path.join(commandsPath, category);
      if (!fs.statSync(categoryPath).isDirectory()) continue;

      const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));

      for (const file of files) {
        const filePath = path.join(categoryPath, file);
        try {
          delete require.cache[require.resolve(filePath)];
          const command = require(filePath);

          if (!command.name) {
            console.warn(`[HybridHandler] ${file} is missing 'name'`);
            continue;
          }

          command.category = category;

          // Slash command
          if (command.data || command.slash) {
            client.commands.set(command.name, command);
          }

          // Prefix command
          if (command.execute || command.run) {
            client.prefixCommands.set(command.name, command);
            // Aliases
            if (command.aliases && Array.isArray(command.aliases)) {
              for (const alias of command.aliases) {
                client.prefixCommands.set(alias, command);
              }
            }
          }
        } catch (err) {
          console.error(`[HybridHandler] Failed to load ${file}:`, err.message);
        }
      }
    }

    console.log(`[HybridHandler] ${client.commands.size} slash commands loaded`);
    console.log(`[HybridHandler] ${client.prefixCommands.size} prefix commands loaded`);
  },

  getAllCommands(client) {
    const list = { slash: {}, prefix: {} };

    for (const [name, cmd] of client.commands) {
      const cat = cmd.category || 'other';
      if (!list.slash[cat]) list.slash[cat] = [];
      list.slash[cat].push(name);
    }

    for (const [name, cmd] of client.prefixCommands) {
      const cat = cmd.category || 'other';
      if (!list.prefix[cat]) list.prefix[cat] = [];
      if (!list.prefix[cat].includes(name)) list.prefix[cat].push(name);
    }

    return list;
  },
};
