const core = require('../core');

module.exports = {
  setup(client) {
    // Unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('[AntiCrash] Unhandled Rejection:', reason);
    });

    // Uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('[AntiCrash] Uncaught Exception:', err);
    });

    // Discord client errors
    client.on('error', (err) => {
      console.error('[Discord Client Error]', err);
    });

    // Process warnings
    process.on('warning', (warn) => {
      console.warn('[Process Warning]', warn);
    });

    console.log('[ErrorHandler] Anti-crash system active');
  },

  // Helper for interaction error replies
  async reply(interaction, message) {
    const embed = core.embeds.error(message);
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [embed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } catch (err) {
      console.error('[ErrorHandler.reply]', err.message);
    }
  },
};
