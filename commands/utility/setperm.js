const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const { loadConfig, saveConfig } = require('../../utils/permissions');

function buildMainPanel(config, client) {
  const embed = new EmbedBuilder()
    .setColor(0xFFFFFF)
    .setAuthor({
      name: 'Permission Setup',
      iconURL: client.user.displayAvatarURL({ dynamic: true, size: 128 })
    })
    .setTitle(`${emojis.shield} Permission Control Panel`)
    .setDescription(
      `**Manage who can use bot commands**\n\n` +
      `Configure global and per-command permissions.`
    )
    .addFields(
      {
        name: '🌐 Global Settings',
        value:
          `**Whitelist Mode:** ${config.whitelistMode ? '✅ On' : '❌ Off'}\n` +
          `**Allowed Users:** ${config.allowedUserIds?.length || 0}\n` +
          `**Allowed Roles:** ${config.allowedRoleIds?.length || 0}\n` +
          `**Blocked Users:** ${config.blockedUserIds?.length || 0}\n` +
          `**Blocked Roles:** ${config.blockedRoleIds?.length || 0}`,
        inline: false
      },
      {
        name: '💡 How It Works',
        value:
          `• **Whitelist Mode OFF** — Everyone can use commands (except blocked)\n` +
          `• **Whitelist Mode ON** — Only allowed users/roles can use commands\n` +
          `• **Admins** are always allowed`,
        inline: false
      }
    )
    .setFooter({
      text: 'Powered by Dynamite Music',
      iconURL: client.user.displayAvatarURL({ dynamic: true, size: 64 })
    })
    .setTimestamp();

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('perm_toggle_whitelist').setLabel(config.whitelistMode ? 'Whitelist: ON' : 'Whitelist: OFF').setEmoji('🌐').setStyle(config.whitelistMode ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('perm_manage_users').setLabel('Manage Users').setEmoji('👤').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('perm_manage_roles').setLabel('Manage Roles').setEmoji('🎭').setStyle(ButtonStyle.Primary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('perm_reset').setLabel('Reset All').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('perm_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return { embed, components: [row1, row2] };
}

module.exports = {
  name: 'setperm',
  description: 'Configure command permissions',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('setperm')
    .setDescription('Configure command permissions')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(context) {
    if (!context.isChatInputCommand || !context.isChatInputCommand()) {
      return context.reply('Use /setperm (slash command).');
    }

    const config = loadConfig();
    const panel = buildMainPanel(config, context.client);

    await context.reply({
      embeds: [panel.embed],
      components: panel.components,
      ephemeral: true
    });
  },

  async handleButton(interaction, client) {
    const config = loadConfig();
    const id = interaction.customId;

    if (id === 'perm_close') {
      await interaction.update({ components: [] });
      return true;
    }

    if (id === 'perm_toggle_whitelist') {
      config.whitelistMode = !config.whitelistMode;
      saveConfig(config);
      const panel = buildMainPanel(config, client);
      await interaction.update({ embeds: [panel.embed], components: panel.components });
      return true;
    }

    if (id === 'perm_reset') {
      config.whitelistMode = false;
      config.allowedUserIds = [];
      config.allowedRoleIds = [];
      config.blockedUserIds = [];
      config.blockedRoleIds = [];
      config.commands = {};
      saveConfig(config);
      const panel = buildMainPanel(config, client);
      await interaction.update({ embeds: [panel.embed], components: panel.components });
      return true;
    }

    if (id === 'perm_manage_users') {
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('👤 Manage Users')
        .setDescription(
          `**Allowed Users:** ${config.allowedUserIds?.length || 0}\n` +
          `**Blocked Users:** ${config.blockedUserIds?.length || 0}\n\n` +
          `Use buttons below to add users.`
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('perm_add_allowed_user').setLabel('Allow User').setEmoji('➕').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('perm_add_blocked_user').setLabel('Block User').setEmoji('🚫').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('perm_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Secondary)
      );

      await interaction.update({ embeds: [embed], components: [row] });
      return true;
    }

    if (id === 'perm_manage_roles') {
      const embed = new EmbedBuilder()
        .setColor(0xEB459E)
        .setTitle('🎭 Manage Roles')
        .setDescription(
          `**Allowed Roles:** ${config.allowedRoleIds?.length || 0}\n` +
          `**Blocked Roles:** ${config.blockedRoleIds?.length || 0}\n\n` +
          `Use buttons below to add roles.`
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('perm_add_allowed_role').setLabel('Allow Role').setEmoji('➕').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('perm_add_blocked_role').setLabel('Block Role').setEmoji('🚫').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('perm_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Secondary)
      );

      await interaction.update({ embeds: [embed], components: [row] });
      return true;
    }

    if (id === 'perm_back') {
      const panel = buildMainPanel(config, client);
      await interaction.update({ embeds: [panel.embed], components: panel.components });
      return true;
    }

    if (id === 'perm_add_allowed_user' || id === 'perm_add_blocked_user') {
      const modal = new ModalBuilder()
        .setCustomId(id === 'perm_add_allowed_user' ? 'modal_perm_allowed_user' : 'modal_perm_blocked_user')
        .setTitle(id === 'perm_add_allowed_user' ? 'Allow User' : 'Block User');
      modal.addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('user_id').setLabel('User ID').setStyle(TextInputStyle.Short).setRequired(true)
      ));
      await interaction.showModal(modal);
      return true;
    }

    if (id === 'perm_add_allowed_role' || id === 'perm_add_blocked_role') {
      const modal = new ModalBuilder()
        .setCustomId(id === 'perm_add_allowed_role' ? 'modal_perm_allowed_role' : 'modal_perm_blocked_role')
        .setTitle(id === 'perm_add_allowed_role' ? 'Allow Role' : 'Block Role');
      modal.addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('role_id').setLabel('Role ID').setStyle(TextInputStyle.Short).setRequired(true)
      ));
      await interaction.showModal(modal);
      return true;
    }

    return false;
  },

  async handleModal(interaction, client) {
    const config = loadConfig();
    const id = interaction.customId;

    if (id === 'modal_perm_allowed_user') {
      const userId = interaction.fields.getTextInputValue('user_id');
      if (!config.allowedUserIds) config.allowedUserIds = [];
      if (!config.allowedUserIds.includes(userId)) config.allowedUserIds.push(userId);
      saveConfig(config);
      await interaction.reply({ content: `${emojis.success} User \`${userId}\` allowed.`, ephemeral: true });
      return true;
    }

    if (id === 'modal_perm_blocked_user') {
      const userId = interaction.fields.getTextInputValue('user_id');
      if (!config.blockedUserIds) config.blockedUserIds = [];
      if (!config.blockedUserIds.includes(userId)) config.blockedUserIds.push(userId);
      saveConfig(config);
      await interaction.reply({ content: `${emojis.success} User \`${userId}\` blocked.`, ephemeral: true });
      return true;
    }

    if (id === 'modal_perm_allowed_role') {
      const roleId = interaction.fields.getTextInputValue('role_id');
      if (!config.allowedRoleIds) config.allowedRoleIds = [];
      if (!config.allowedRoleIds.includes(roleId)) config.allowedRoleIds.push(roleId);
      saveConfig(config);
      await interaction.reply({ content: `${emojis.success} Role \`${roleId}\` allowed.`, ephemeral: true });
      return true;
    }

    if (id === 'modal_perm_blocked_role') {
      const roleId = interaction.fields.getTextInputValue('role_id');
      if (!config.blockedRoleIds) config.blockedRoleIds = [];
      if (!config.blockedRoleIds.includes(roleId)) config.blockedRoleIds.push(roleId);
      saveConfig(config);
      await interaction.reply({ content: `${emojis.success} Role \`${roleId}\` blocked.`, ephemeral: true });
      return true;
    }

    return false;
  }
};
