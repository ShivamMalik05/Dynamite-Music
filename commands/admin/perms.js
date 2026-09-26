const { SlashCommandBuilder } = require('discord.js');
const core = require('../../core');
const permConfig = require('../../config/permissions');

module.exports = {
  name: 'perms',
  category: 'admin',
  adminOnly: true,
  data: new SlashCommandBuilder()
    .setName('perms')
    .setDescription('Manage global permissions')
    .addSubcommand(sub =>
      sub.setName('view').setDescription('View current permissions')
    )
    .addSubcommand(sub =>
      sub.setName('whitelistmode').setDescription('Toggle whitelist mode')
        .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable whitelist mode').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('allowuser').setDescription('Add a user to allowed list')
        .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('blockuser').setDescription('Add a user to blocked list')
        .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('allowrole').setDescription('Add a role to allowed list')
        .addRoleOption(opt => opt.setName('role').setDescription('Role').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('blockrole').setDescription('Add a role to blocked list')
        .addRoleOption(opt => opt.setName('role').setDescription('Role').setRequired(true))
    ),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    const g = permConfig.global;

    if (sub === 'view') {
      const embed = core.embeds.info([
        `**Whitelist Mode:** ${g.whitelistMode ? '✅' : '❌'}`,
        `**Allowed Users:** ${g.allowedUserIds.length ? g.allowedUserIds.map(id => `<@${id}>`).join(', ') : 'none'}`,
        `**Allowed Roles:** ${g.allowedRoleIds.length ? g.allowedRoleIds.map(id => `<@&${id}>`).join(', ') : 'none'}`,
        `**Blocked Users:** ${g.blockedUserIds.length ? g.blockedUserIds.map(id => `<@${id}>`).join(', ') : 'none'}`,
        `**Blocked Roles:** ${g.blockedRoleIds.length ? g.blockedRoleIds.map(id => `<@&${id}>`).join(', ') : 'none'}`,
      ].join('\n'), 'Global Permissions');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'whitelistmode') {
      g.whitelistMode = interaction.options.getBoolean('enabled');
      return interaction.reply({
        embeds: [core.embeds.success(`Whitelist mode is now **${g.whitelistMode ? 'enabled' : 'disabled'}**.`)],
        ephemeral: true,
      });
    }

    if (sub === 'allowuser') {
      const user = interaction.options.getUser('user');
      if (!g.allowedUserIds.includes(user.id)) g.allowedUserIds.push(user.id);
      return interaction.reply({ embeds: [core.embeds.success(`Allowed <@${user.id}>.`)], ephemeral: true });
    }

    if (sub === 'blockuser') {
      const user = interaction.options.getUser('user');
      if (!g.blockedUserIds.includes(user.id)) g.blockedUserIds.push(user.id);
      return interaction.reply({ embeds: [core.embeds.success(`Blocked <@${user.id}>.`)], ephemeral: true });
    }

    if (sub === 'allowrole') {
      const role = interaction.options.getRole('role');
      if (!g.allowedRoleIds.includes(role.id)) g.allowedRoleIds.push(role.id);
      return interaction.reply({ embeds: [core.embeds.success(`Allowed <@&${role.id}>.`)], ephemeral: true });
    }

    if (sub === 'blockrole') {
      const role = interaction.options.getRole('role');
      if (!g.blockedRoleIds.includes(role.id)) g.blockedRoleIds.push(role.id);
      return interaction.reply({ embeds: [core.embeds.success(`Blocked <@&${role.id}>.`)], ephemeral: true });
    }
  },
};
