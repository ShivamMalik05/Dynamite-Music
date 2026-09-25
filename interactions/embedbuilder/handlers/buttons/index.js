const { handleNavigation, getData } = require('./navigation');
const { handleAction } = require('./actions');
const { handleSelect } = require('./select');
const { MODAL_CONFIGS } = require('../modals/index');

async function handleButton(interaction, client) {
  const id = interaction.customId;

  // Navigation buttons
  const navHandled = await handleNavigation(interaction, client);
  if (navHandled) return true;

  // Action buttons
  const actionHandled = await handleAction(interaction, client);
  if (actionHandled) return true;

  // Modal openers (for block/button additions)
  const cfg = MODAL_CONFIGS[id];
  if (cfg) {
    const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('discord.js');
    const modal = new ModalBuilder().setCustomId(cfg.id).setTitle(cfg.title);
    for (const f of cfg.fields) {
      modal.addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId(f.id).setLabel(f.label).setStyle(f.style).setRequired(f.required)
      ));
    }
    await interaction.showModal(modal);
    return true;
  }

  return false;
}

module.exports = {
  handleButton,
  handleSelect,
  getData,
};
