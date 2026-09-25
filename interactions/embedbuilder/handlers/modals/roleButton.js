const emojis = require('../../../../emojis/emojis');

async function handleRoleButton(interaction) {
  const id = interaction.customId;
  if (!id.startsWith('eb_action_role_')) return false;

  const parts = id.replace('eb_action_role_', '').split('_');
  const roleId = parts[0];
  const action = parts[1];

  const role = interaction.guild.roles.cache.get(roleId);
  if (!role) {
    await interaction.reply({ content: 'Role not found.', ephemeral: true });
    return true;
  }

  const member = interaction.member;
  try {
    if (action === 'add') {
      if (member.roles.cache.has(roleId)) return interaction.reply({ content: `You already have ${role}.`, ephemeral: true });
      await member.roles.add(role);
      await interaction.reply({ content: `${emojis.success} Added ${role}.`, ephemeral: true });
    } else if (action === 'remove') {
      if (!member.roles.cache.has(roleId)) return interaction.reply({ content: `You don't have ${role}.`, ephemeral: true });
      await member.roles.remove(role);
      await interaction.reply({ content: `${emojis.success} Removed ${role}.`, ephemeral: true });
    } else if (action === 'toggle') {
      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(role);
        await interaction.reply({ content: `${emojis.success} Removed ${role}.`, ephemeral: true });
      } else {
        await member.roles.add(role);
        await interaction.reply({ content: `${emojis.success} Added ${role}.`, ephemeral: true });
      }
    }
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: 'Failed. Check bot permissions.', ephemeral: true });
  }
  return true;
}

module.exports = { handleRoleButton };
