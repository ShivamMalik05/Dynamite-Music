require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const path = require('path');
const fs = require('fs');
const hybridHandler = require('./handlers/hybridHandler');

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

  // Register slash commands — ONLY add new ones, preserve existing
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    console.log('Syncing slash commands...');

    // Get existing commands
    const existing = await rest.get(Routes.applicationCommands(client.user.id));

    // Get new command names
    const newNames = slashArray.map(c => c.name);

    // Build final array: keep existing that match, add new
    const final = [];
    const seenNames = new Set();

    // First, keep all new commands (they have latest definitions)
    for (const cmd of slashArray) {
      final.push(cmd);
      seenNames.add(cmd.name);
    }

    // Then, add existing commands that aren't in new list (preserve old ones)
    for (const cmd of existing) {
      if (!seenNames.has(cmd.name)) {
        final.push(cmd);
        seenNames.add(cmd.name);
      }
    }

    // Register only if there are changes
    const existingNames = existing.map(c => c.name).sort().join(',');
    const finalNames = final.map(c => c.name).sort().join(',');

    if (existingNames !== finalNames) {
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: final }
      );
      console.log(`✅ Registered ${final.length} slash commands (${final.length - existing.length} new)`);
    } else {
      console.log(`✅ Slash commands already up to date (${final.length} total)`);
    }
  } catch (error) {
    console.error('Failed to register slash commands:', error);
  }
});

client.login(process.env.DISCORD_TOKEN);
