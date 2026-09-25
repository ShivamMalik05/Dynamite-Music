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

    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
      const command = require(path.join(categoryPath, file));

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
