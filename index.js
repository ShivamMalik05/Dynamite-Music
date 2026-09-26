require('dotenv').config();

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');

const core = require('./core');
const hybridHandler = require('./handlers/hybridHandler');
const errorHandler = require('./handlers/errorHandler');

// ===== CREATE CLIENT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.GuildMember,
    Partials.User,
    Partials.Reaction,
  ],
});

// ===== COLLECTIONS (for buttons, selects, modals) =====
client.buttons = new Map();
client.selects = new Map();
client.modals = new Map();

// ===== SETUP ANTI-CRASH =====
errorHandler.setup(client);

// ===== LOAD COMMANDS =====
hybridHandler.loadCommands(client);

// ===== LOAD EVENTS =====
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    try {
      delete require.cache[require.resolve(filePath)];
      const event = require(filePath);

      if (!event.name || !event.execute) {
        console.warn(`[Index] ${file} is missing 'name' or 'execute'`);
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }

      console.log(`[Index] Event loaded: ${event.name}`);
    } catch (err) {
      console.error(`[Index] Failed to load event ${file}:`, err.message);
    }
  }
} else {
  console.warn('[Index] events folder not found');
}

// ===== GLOBAL ERROR HANDLER =====
process.on('unhandledRejection', (reason) => {
  console.error('[Index] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Index] Uncaught Exception:', err);
});

// ===== LOGIN =====
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('[Index] DISCORD_TOKEN is missing in .env file');
  process.exit(1);
}

client.login(token).catch((err) => {
  console.error('[Index] Failed to login:', err.message);
  process.exit(1);
});

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGINT', () => {
  console.log('[Index] Shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[Index] Shutting down gracefully...');
  client.destroy();
  process.exit(0);
});
