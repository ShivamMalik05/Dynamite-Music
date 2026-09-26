const { SlashCommandBuilder } = require('discord.js');
const core = require('../../core');

module.exports = {
  name: 'serverlist',
  category: 'owner',
  ownerOnly: true,
  data: new SlashCommandBuilder()
    .setName('serverlist')
    .setDescription('List all servers the bot is in'),

  async execute(interaction, client) {
    const guilds = client.guilds.cache
      .sort((a, b) => b.memberCount - a.memberCount)
      .map(g => `• **${g.name}** — \`${g.id}\` — ${g.memberCount} members`)
      .join('\n');

    const chunks = [];
    const lines = guilds.split('\n');
    for (let i = 0; i < lines.length; i += 15) {
      chunks.push(lines.slice(i, i + 15).join('\n'));
    }

    const embed = core.embeds.info(
      chunks[0] || 'No servers.',
      `Server List (${client.guilds.cache.size} total)`
    );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
