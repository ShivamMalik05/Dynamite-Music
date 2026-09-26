const core = require('../core');
const logger = require('../core/logger');

module.exports = {
  name: 'messageCreate',

  async execute(message, client) {
    // Ignore bots and DMs
    if (message.author.bot) return;
    if (!message.guild) return;

    // Log message (if enabled)
    if (logger.isIgnored(message.channel.id, [], message.author.id)) {
      // Skip logs for ignored channels/users
    } else if (core.logs.enabled.messages && core.logs.channels.messages) {
      // Optional: log message content
      // await logger.send(client, 'messages', { ... });
    }

    // Parse prefix / NOP
    const parsed = core.prefix.parse(message, client);
    if (!parsed) return;

    const { commandName, args, nop } = parsed;
    const command = client.prefixCommands.get(commandName);
    if (!command) return;

    // NOP category check
    if (nop) {
      if (!core.nop.isCategoryAllowed(command.category)) return;
      if (!core.nop.isCommandAllowed(message.guild.id, command.name)) return;
      await core.nop.log(client, message, command.name);
    }

    // Permission checks
    const level = core.permissions.getLevel(message.member);

    if (command.ownerOnly && level !== 'owner') {
      return message.reply({
        embeds: [core.embeds.error('This command is only available to **Owner**.')],
      });
    }

    if (command.adminOnly && !['owner', 'admin'].includes(level)) {
      return message.reply({
        embeds: [core.embeds.error('This command is only available to **Admin**.')],
      });
    }

    if (command.modOnly && !['owner', 'admin', 'moderator'].includes(level)) {
      return message.reply({
        embeds: [core.embeds.error('This command is only available to **Moderator**.')],
      });
    }

    // Global permission check
    const roleIds = message.member.roles.cache.map(r => r.id);
    if (!core.permissions.isGloballyAllowed(message.author.id, roleIds)) {
      return message.reply({
        embeds: [core.embeds.error('You do not have permission to use this command.')],
      });
    }

    // Execute
    try {
      await command.execute(message, args, client);
    } catch (err) {
      console.error(`[MessageCreate] ${command.name}:`, err);
      await message.reply({
        embeds: [core.embeds.error('An error occurred while running this command.')],
      }).catch(() => null);
    }
  },
};
