require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
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
      console.log(`✅ Loaded: ${command.name}`);
    }
  }
}

client.once('ready', () => {
  console.log(`🤖 Bot online: ${client.user.tag}`);
  client.user.setActivity('!ping');
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
    message.reply('❌ Kuch galat ho gaya!');
  }
});

client.login(process.env.DISCORD_TOKEN);