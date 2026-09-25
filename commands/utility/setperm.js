const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  UserSelectMenuBuilder,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const {
  loadConfig,
  saveConfig,
  isBotOwner,
  getServerConfig,
  getDisplayNames,
} = require('../../utils/permissions');

// ===== BUILD V2 PANEL =====
async function buildPanel(config, guild, client) {
  const guildId = guild.id;
  const server = getServerConfig(config, guildId);
  const global = config.global || {};

  const { users: serverAllowedUsers } = await getDisplayNames(client, guild, server.allowedUserIds || []);
  const { roles: serverAllowedRoles } = await getDisplayNames(client, guild, [], server.allowedRoleIds || []);
  const { users: serverBlockedUsers } = await getDisplayNames(client, guild, server.blockedUserIds || []);
  const { roles: serverBlockedRoles } = await getDisplayNames(client, guild, [], server.blockedRoleIds || []);

  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.shield || '🛡️'} Permission Control\n` +
        `**Server:** ${guild.name}`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 🌐 Server Settings\n` +
        `**Whitelist Mode:** ${server.whitelistMode ? '✅ ON' : '❌ OFF'}`
      )
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ✅ Allowed Users (${serverAllowedUsers.length})\n` +
        (serverAllowedUsers.length > 0
          ? serverAllowedUsers.map(u => `• ${u.name}`).join('\n').slice(0, 800)
          : '*None*')
      )
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ✅ Allowed Roles (${serverAllowedRoles.length})\n` +
        (serverAllowedRoles.length > 0
          ? serverAllowedRoles.map(r => `• ${r.name}`).join('\n').slice(0, 800)
          : '*None*')
      )
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 🚫 Blocked Users (${serverBlockedUsers.length})\n` +
        (serverBlockedUsers.length > 0
          ? serverBlockedUsers.map(u => `• ${u.name}`).join('\n').slice(0, 800)
          : '*None*')
      )
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 🚫 Blocked Roles (${serverBlockedRoles.length})\n` +
        (serverBlockedRoles.length > 0
          ? serverBlockedRoles.map(r => `• ${r.name}`).join('\n').slice(0, 800)
          : '*None*')
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
    );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('sp_add_user').setLabel('Allow User').setEmoji('👤').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('sp_add_role').setLabel('Allow Role').setEmoji('🎭').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('sp_remove_user').setLabel('Remove User').setEmoji('➖').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('sp_remove_role').setLabel('Remove Role').setEmoji('➖').setStyle(ButtonStyle.Danger)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('sp_block_user').setLabel('Block User').setEmoji('🚫').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('sp_block_role').setLabel('Block Role').setEmoji('🚫').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('sp_unblock_user').setLabel('Unblock User').setEmoji('✅').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('sp_unblock_role').setLabel('Unblock Role').setEmoji('✅').setStyle(ButtonStyle.Success)
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('sp_toggle_whitelist').setLabel(server.whitelistMode ? 'Whitelist: ON' : 'Whitelist: OFF').setEmoji('🌐').setStyle(server.whitelistMode ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('sp_refresh').setLabel('Refresh').setEmoji('🔄').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('sp_reset').setLabel('Reset').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('sp_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return { container, components: [container, row1, row2, row3] };
}

module.exports = {
  name: 'setperm',
  description: 'Advanced permission control panel',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('setperm')
    .setDescription('Advanced permission control panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('View current permissions')),

  async execute(context) {
    if (!context.isChatInputCommand || !context.isChatInputCommand()) {
      return context.reply('Use /setperm (slash command).');
    }

    const config = loadConfig();
    const panel = await buildPanel(config, context.guild, context.client);

    await context.reply({
      components: panel.components,
      flags: 1 << 15 | 1 << 6,
    });
  },

  async handleButton(interaction, client) {
    const config = loadConfig();
    const guild = interaction.guild;
    const id = interaction.customId;
    const server = getServerConfig(config, guild.id);

    // Close
    if (id === 'sp_close') {
      await interaction.update({ components: [] });
      return true;
    }

    // Refresh
    if (id === 'sp_refresh') {
      const panel = await buildPanel(config, guild, client);
      await interaction.update({ components: panel.components, flags: 1 << 15 });
      return true;
    }

    // Toggle whitelist
    if (id === 'sp_toggle_whitelist') {
      server.whitelistMode = !server.whitelistMode;
      saveConfig(config);
      const panel = await buildPanel(config, guild, client);
      await interaction.update({ components: panel.components, flags: 1 << 15 });
      return true;
    }

    // Reset
    if (id === 'sp_reset') {
      config.servers[guild.id] = {
        whitelistMode: false,
        allowedUserIds: [],
        allowedRoleIds: [],
        blockedUserIds: [],
        blockedRoleIds: [],
        commands: {},
      };
      saveConfig(config);
      const panel = await buildPanel(config, guild, client);
      await interaction.update({ components: panel.components, flags: 1 << 15 });
      return true;
    }

    // ===== SELECT MENUS =====
    const selectConfigs = {
      sp_add_user: { type: 'user', action: 'add' },
      sp_remove_user: { type: 'user', action: 'remove' },
      sp_block_user: { type: 'user', action: 'block' },
      sp_unblock_user: { type: 'user', action: 'unblock' },
      sp_add_role: { type: 'role', action: 'add' },
      sp_remove_role: { type: 'role', action: 'remove' },
      sp_block_role: { type: 'role', action: 'block' },
      sp_unblock_role: { type: 'role', action: 'unblock' },
    };

    const cfg = selectConfigs[id];
    if (cfg) {
      let menu;
      if (cfg.type === 'user') {
        menu = new UserSelectMenuBuilder()
          .setCustomId(`sp_select_${cfg.action}_user`)
          .setPlaceholder(`Select user to ${cfg.action}`)
          .setMinValues(1).setMaxValues(1);
      } else {
        menu = new RoleSelectMenuBuilder()
          .setCustomId(`sp_select_${cfg.action}_role`)
          .setPlaceholder(`Select role to ${cfg.action}`)
          .setMinValues(1).setMaxValues(1);
      }
      const row = new ActionRowBuilder().addComponents(menu);
      await interaction.reply({
        content: `Select a ${cfg.type} to **${cfg.action}**:`,
        components: [row],
        ephemeral: true,
      });
      return true;
    }

    return false;
  },

  async handleSelect(interaction, client) {
    const id = interaction.customId;
    if (!id.startsWith('sp_select_')) return false;

    const parts = id.replace('sp_select_', '').split('_');
    const action = parts[0];
    const type = parts[1];

    const config = loadConfig();
    const guild = interaction.guild;
    const server = getServerConfig(config, guild.id);

    const selected = interaction.values[0];
    let targetName = 'Unknown';

    if (type === 'user') {
      try {
        const member = await guild.members.fetch(selected);
        targetName = member.user.tag;
      } catch {}
    } else {
      const role = guild.roles.cache.get(selected);
      if (role) targetName = role.name;
    }

    // Apply action
    if (action === 'add') {
      if (type === 'user') {
        if (!server.allowedUserIds.includes(selected)) server.allowedUserIds.push(selected);
        server.blockedUserIds = server.blockedUserIds.filter(i => i !== selected);
      } else {
        if (!server.allowedRoleIds.includes(selected)) server.allowedRoleIds.push(selected);
        server.blockedRoleIds = server.blockedRoleIds.filter(i => i !== selected);
      }
    } else if (action === 'remove') {
      if (type === 'user') {
        server.allowedUserIds = server.allowedUserIds.filter(i => i !== selected);
      } else {
        server.allowedRoleIds = server.allowedRoleIds.filter(i => i !== selected);
      }
    } else if (action === 'block') {
      if (type === 'user') {
        if (!server.blockedUserIds.includes(selected)) server.blockedUserIds.push(selected);
        server.allowedUserIds = server.allowedUserIds.filter(i => i !== selected);
      } else {
        if (!server.blockedRoleIds.includes(selected)) server.blockedRoleIds.push(selected);
        server.allowedRoleIds = server.allowedRoleIds.filter(i => i !== selected);
      }
    } else if (action === 'unblock') {
      if (type === 'user') {
        server.blockedUserIds = server.blockedUserIds.filter(i => i !== selected);
      } else {
        server.blockedRoleIds = server.blockedRoleIds.filter(i => i !== selected);
      }
    }

    saveConfig(config);

    await interaction.update({
      content: `✅ **${action}** ${type}: **${targetName}**`,
      components: [],
    });
    return true;
  },
};
