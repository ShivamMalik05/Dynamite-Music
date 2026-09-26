const config = require('./config');
const nopCore = require('./nop');

module.exports = {
  // Message se prefix + command nikalo
  parse(message, client) {
    const content = message.content.trim();
    if (!content) return null;

    const prefix = config.prefix;

    // Normal prefix check
    if (content.startsWith(prefix)) {
      const args = content.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();
      return { commandName, args, nop: false };
    }

    // NOP check
    if (nopCore.isNopAllowed(message)) {
      const args = content.split(/ +/);
      const commandName = args.shift().toLowerCase();
      return { commandName, args, nop: true };
    }

    return null;
  },

  getPrefix() {
    return config.prefix;
  },
};
