const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const core = require('../../core');
const emojiConfig = require('../../config/emojis');

module.exports = {
  name: 'emojipanel',
  category: 'owner',
  ownerOnly: true,
  data: new SlashCommandBuilder()
    .setName('emojipanel')
    .setDescription('View and manage bot emojis'),

  async execute(interaction, client) {
    const lines = [];
    for (const [key, appName] of Object.entries(emojiConfig.app)) {
      const resolved = core.emojis.get(key, client);
      lines.push(`\`${key}\` → ${resolved} (\`${appName}\`)`);
    }

    // Split into chunks of 20 lines
    const chunks = [];
    for (let i = 0; i < lines.length; i += 20) {
      chunks.push(lines.slice(i, i + 20).join('\n'));
    }

    const embed = core.embeds.info(chunks[0], 'Emoji Panel (Page 1)');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('emojipanel:refresh').setLabel('Refresh').setStyle(ButtonStyle.Primary).setEmoji('🔄')
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },
};
