const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const core = require('../../core');

module.exports = {
  name: 'broadcast',
  category: 'owner',
  ownerOnly: true,
  data: new SlashCommandBuilder()
    .setName('broadcast')
    .setDescription('Broadcast a message to all servers'),

  async execute(interaction, client) {
    const modal = new ModalBuilder()
      .setCustomId('broadcast:submit')
      .setTitle('Broadcast Message');

    const input = new TextInputBuilder()
      .setCustomId('message')
      .setLabel('Message to broadcast')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(2000);

    modal.addComponents(new ActionRowBuilder().addComponents(input));

    await interaction.showModal(modal);
  },
};
