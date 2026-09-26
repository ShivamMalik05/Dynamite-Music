const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const core = require('../../core');

module.exports = {
  name: 'adminpanel',
  category: 'admin',
  adminOnly: true,
  data: new SlashCommandBuilder()
    .setName('adminpanel')
    .setDescription('Open the Admin Control Panel'),

  async execute(interaction, client) {
    const embed = core.embeds.custom(
      core.config.colors.primary,
      [
        `**Server:** ${interaction.guild.name}`,
        `**Members:** ${interaction.guild.memberCount}`,
        `**Channels:** ${interaction.guild.channels.cache.size}`,
        `**Roles:** ${interaction.guild.roles.cache.size}`,
        '',
        'Use the buttons below to manage server settings.',
      ].join('\n'),
      'Admin Control Panel'
    );

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('adminpanel:setlog').setLabel('Set Logs').setStyle(ButtonStyle.Primary).setEmoji('📝'),
      new ButtonBuilder().setCustomId('adminpanel:autoaction').setLabel('Auto-Action').setStyle(ButtonStyle.Primary).setEmoji('⚙️'),
      new ButtonBuilder().setCustomId('adminpanel:warnings').setLabel('Warning Settings').setStyle(ButtonStyle.Primary).setEmoji('⚠️')
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('adminpanel:ignore').setLabel('Ignore List').setStyle(ButtonStyle.Secondary).setEmoji('🚫'),
      new ButtonBuilder().setCustomId('adminpanel:perms').setLabel('Permissions').setStyle(ButtonStyle.Secondary).setEmoji('🔐')
    );

    await interaction.reply({ embeds: [embed], components: [row1, row2], ephemeral: true });
  },
};
