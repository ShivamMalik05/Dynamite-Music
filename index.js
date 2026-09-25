require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
client.slashCommands = new Map();

// Load prefix commands
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const categories = fs.readdirSync(commandsPath);
  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const command = require(path.join(categoryPath, file));
      client.commands.set(command.name, command);
      console.log(`Loaded: ${command.name}`);
    }
  }
}

// Load slash commands
const slashPath = path.join(__dirname, 'slashCommands');
const slashCommandsArray = [];
if (fs.existsSync(slashPath)) {
  const categories = fs.readdirSync(slashPath);
  for (const category of categories) {
    const categoryPath = path.join(slashPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const command = require(path.join(categoryPath, file));
      if (command.data && command.execute) {
        client.slashCommands.set(command.data.name, command);
        slashCommandsArray.push(command.data.toJSON());
        console.log(`Loaded slash: ${command.data.name}`);
      }
    }
  }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
}

client.once('ready', async () => {
  console.log(`Bot online: ${client.user.tag}`);
  client.user.setActivity('!help | /help');

  // Register slash commands
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: slashCommandsArray }
    );
    console.log('Slash commands registered!');
  } catch (error) {
    console.error(error);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('Something went wrong!');
  }
});

client.login(process.env.DISCORD_TOKEN);
