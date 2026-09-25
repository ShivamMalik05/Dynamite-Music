// ============================================
// EMOJIS — Smart Loader
// Loads emojis from config/emojis.js
// Change emojis in config/emojis.js — updates everywhere
// ============================================

const config = require('../config/emojis');

// Flatten config into single object
const flat = {};

for (const category of Object.keys(config)) {
  for (const key of Object.keys(config[category])) {
    flat[key] = config[category][key];
  }
}

// Backward compatibility aliases
if (config.general) {
  flat.arrowRight = config.general.arrow || '➡️';
  flat.arrowLeft = config.general.back || '⬅️';
  flat.close = config.general.close || '❌';
  flat.star = config.general.star || '⭐';
}

if (config.embed) {
  flat.chart = config.embed.chart || '📊';
  flat.refresh = config.embed.refresh || '🔄';
  flat.title = config.embed.title || '📌';
  flat.text = config.embed.text || '📄';
  flat.separator = config.embed.separator || '➖';
  flat.thumbnail = config.embed.thumbnail || '🔳';
  flat.image = config.embed.image || '🖼️';
  flat.author = config.embed.author || '👤';
  flat.field = config.embed.field || '📋';
  flat.section = config.embed.section || '✨';
  flat.footer = config.embed.footer || '📎';
  flat.link = config.embed.link || '🔗';
  flat.role = config.embed.role || '🎭';
  flat.blocks = config.embed.blocks || '🧱';
  flat.style = config.embed.style || '🎨';
  flat.history = config.embed.history || '📜';
  flat.export = config.embed.export || '💾';
  flat.import = config.embed.import || '📥';
  flat.manage = config.embed.manage || '🔧';
  flat.send = config.embed.send || '📤';
  flat.edit = config.embed.edit || '✏️';
  flat.reset = config.embed.reset || '🗑️';
  flat.home = config.embed.home || '🏠';
}

if (config.moderation) {
  flat.ban = config.moderation.ban || '🔨';
  flat.kick = config.moderation.kick || '👢';
  flat.mute = config.moderation.mute || '🔇';
  flat.unmute = config.moderation.unmute || '🔊';
  flat.warn = config.moderation.warn || '⚠️';
  flat.warnings = config.moderation.warnings || '📋';
  flat.purge = config.moderation.purge || '🗑️';
  flat.slowmode = config.moderation.slowmode || '🐢';
  flat.lock = config.moderation.lock || '🔒';
  flat.unlock = config.moderation.unlock || '🔓';
  flat.nickname = config.moderation.nickname || '📝';
  flat.timeout = config.moderation.timeout || '⏱️';
  flat.shield = config.moderation.shield || '🛡️';
}

if (config.utility) {
  flat.ping = config.utility.ping || '🏓';
  flat.server = config.utility.server || '🏠';
  flat.time = config.utility.time || '⏰';
  flat.help = config.utility.help || '❓';
  flat.bot = config.utility.bot || '🤖';
  flat.stats = config.utility.stats || '📊';
}

if (config.fun) {
  flat.smile = config.fun.smile || '😄';
  flat.party = config.fun.party || '🎉';
  flat.say = config.fun.say || '💬';
}

if (config.logs) {
  flat.logModeration = config.logs.moderation || '🛡️';
  flat.logMessages = config.logs.messages || '💬';
  flat.logMembers = config.logs.members || '👥';
  flat.logChannels = config.logs.channels || '📢';
  flat.logRoles = config.logs.roles || '🎭';
  flat.logVoice = config.logs.voice || '🔊';
  flat.logServer = config.logs.server || '🏠';
}

// Extra aliases used in commands
flat.moderator = flat.shield || '🛡️';
flat.reason = '📝';
flat.user = '👤';
flat.channel = '📢';
flat.duration = '⏱️';

module.exports = flat;
