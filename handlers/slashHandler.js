const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  client.slashCommands = new Map();

  const slashPath = path.join(__dirname, '..', 'slashCommands');
  if (!fs.existsSync(slashPath)) return;

  const categories = fs.readdirSync(slashPath);

  for (const category of categories) {
    const categoryPath = path.join(slashPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
      const command = require(path.join(categoryPath, file));
      if (!command.data || !command.execute) continue;

      client.slashCommands.set(command.data.name, command);
      console.log(`Loaded slash: ${command.data.name}`);
    }
  }
};
