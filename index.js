require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const path = require('path');
const fs = require('fs');
const hybridHandler = require('./handlers/hybridHandler');
const { fetchAppEmojis } = require('./utils/appEmojis');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
  ],
});

// Load commands
const { slashArray } = hybridHandler(client);

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

  // Fetch app emojis
  client.appEmojis = await fetchAppEmojis(client);
  console.log(`App emojis loaded: ${Object.keys(client.appEmojis).length}`);

  // Register slash commands
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    console.log('Syncing slash commands...');

    const existing = await rest.get(Routes.applicationCommands(client.user.id));

    // Get current command names from files
    const currentNames = new Set(slashArray.map(c => c.name));

    // Delete commands that are no longer in files
    for (const cmd of existing) {
      if (!currentNames.has(cmd.name)) {
        await rest.delete(Routes.applicationCommand(client.user.id, cmd.id)).catch(() => {});
        console.log(`🗑️ Deleted: ${cmd.name}`);
      }
    }

    // Register all current commands
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: slashArray }
    );
    console.log(`✅ Registered ${slashArray.length} slash commands`);
  } catch (error) {
    console.error('Failed to register slash commands:', error);
  }
});

client.login(process.env.DISCORD_TOKEN);
