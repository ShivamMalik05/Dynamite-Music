const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const emojis = require('../emojis/emojis');
const { sendLog } = require('../utils/logger');

const tempBansPath = path.join(__dirname, '..', 'data', 'tempbans.json');

function loadTempBans() {
  if (!fs.existsSync(tempBansPath)) return { bans: {} };
  try {
    const data = JSON.parse(fs.readFileSync(tempBansPath, 'utf8'));
    if (!data.bans) data.bans = {};
    return data;
  } catch {
    return { bans: {} };
  }
}

function saveTempBans(data) {
  const dir = path.dirname(tempBansPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(tempBansPath, JSON.stringify(data, null, 2));
}

async function checkTempBans(client) {
  const data = loadTempBans();
  const now = Date.now();
  let changed = false;

  for (const [userId, ban] of Object.entries(data.bans)) {
    if (ban.unbanAt <= now) {
      try {
        const guild = client.guilds.cache.get(ban.guildId);
        if (guild) {
          await guild.members.unban(userId, 'Temp ban expired').catch(() => {});

          // Log unban
          await sendLog(client, 'moderation', {
            emoji: '🔓',
            title: 'Temp Ban Expired',
            subtitle: 'User was automatically unbanned',
            fields: [
              { name: '👤 User', value: `${ban.userTag} (${userId})` },
              { name: '⏱️ Original Duration', value: `${Math.floor((ban.unbanAt - Date.now()) / 60000)} min ago` },
            ],
          });
        }
      } catch (err) {
        console.error('Unban failed:', err.message);
      }

      delete data.bans[userId];
      changed = true;
    }
  }

  if (changed) saveTempBans(data);
}

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`Bot online: ${client.user.tag}`);
    client.user.setActivity('!help | /help');

    // Check temp bans every 30 seconds
    setInterval(() => {
      checkTempBans(client).catch(err => console.error('Temp ban check error:', err.message));
    }, 30000);

    // Initial check
    setTimeout(() => {
      checkTempBans(client).catch(err => console.error('Initial temp ban check:', err.message));
    }, 5000);
  },
};
