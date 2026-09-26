const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const core = require('../../core');

module.exports = {
  name: 'ownerpanel',
  category: 'owner',
  ownerOnly: true,
  data: new SlashCommandBuilder()
    .setName('ownerpanel')
    .setDescription('Open the Owner Control Panel'),

  async execute(interaction, client) {
    const embed = core.embeds.custom(
      core.config.colors.primary,
      [
        `**Bot:** ${core.config.botName} v${core.config.botVersion}`,
        `**Guilds:** ${client.guilds.cache.size}`,
        `**Users:** ${client.users.cache.size}`,
        `**Uptime:** <t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`,
        `**Ping:** ${client.ws.ping}ms`,
        '',
        'Use the buttons below to manage the bot.',
      ].join('\n'),
      'Owner Control Panel'
    );

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ownerpanel:setprefix').setLabel('Set Prefix').setStyle(ButtonStyle.Primary).setEmoji('📝'),
      new ButtonBuilder().setCustomId('ownerpanel:nop').setLabel('NOP Settings').setStyle(ButtonStyle.Primary).setEmoji('⚡'),
      new ButtonBuilder().setCustomId('ownerpanel:emojis').setLabel('Emoji Panel').setStyle(ButtonStyle.Primary).setEmoji('😀'),
      new ButtonBuilder().setCustomId('ownerpanel:reload').setLabel('Reload').setStyle(ButtonStyle.Success).setEmoji('🔄')
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ownerpanel:broadcast').setLabel('Broadcast').setStyle(ButtonStyle.Danger).setEmoji('📢'),
      new ButtonBuilder().setCustomId('ownerpanel:serverlist').setLabel('Server List').setStyle(ButtonStyle.Secondary).setEmoji('🌐'),
      new ButtonBuilder().setCustomId('ownerpanel:owners').setLabel('Owners').setStyle(ButtonStyle.Secondary).setEmoji('👑')
    );

    await interaction.reply({ embeds: [embed], components: [row1, row2], ephemeral: true });
  },
};
