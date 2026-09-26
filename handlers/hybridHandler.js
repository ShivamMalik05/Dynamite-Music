const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  client.commands = new Map();
  client.slashCommands = new Map();
  const slashArray = [];

  const commandsPath = path.join(__dirname, '..', 'commands');
  if (!fs.existsSync(commandsPath)) return { slashArray };

  const categories = fs.readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const entries = fs.readdirSync(categoryPath);

    for (const entry of entries) {
      const entryPath = path.join(categoryPath, entry);
      const stat = fs.statSync(entryPath);

      let command;
      if (stat.isDirectory()) {
        // Folder — look for index.js inside
        const indexPath = path.join(entryPath, 'index.js');
        if (!fs.existsSync(indexPath)) continue;
        command = require(indexPath);
      } else if (entry.endsWith('.js')) {
        command = require(entryPath);
      } else {
        continue;
      }

      if (command.name && command.execute) {
        client.commands.set(command.name, command);
        console.log(`Loaded prefix: ${command.name}`);
      }

      if (command.data && command.execute) {
        client.slashCommands.set(command.data.name, command);
        slashArray.push(command.data.toJSON());
        console.log(`Loaded slash: ${command.data.name}`);
      }
    }
  }

  return { slashArray };
};
