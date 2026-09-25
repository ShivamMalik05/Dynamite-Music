const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const { loadConfig, saveConfig, getDisplayNames } = require('../../utils/permissions');

function makeSep() {
  try {
    const sep = new SeparatorBuilder();
    if (typeof sep.setSpacing === 'function') sep.setSpacing(1);
    if (typeof sep.setDivider === 'function') sep.setDivider(true);
    return sep;
  } catch {
    return { type: 14, divider: true, spacing: 1 };
  }
}

function makeThumb(url) {
  try {
    return new ThumbnailBuilder().setURL(url);
  } catch {
    return null;
  }
}

// ===== MAIN PANEL =====
async function buildMainPanel(config, client, guild) {
  const global = config.global || {};
  const commandsCount = Object.keys(config.commands || {}).length;

  const container = new ContainerBuilder()
    .setAccentColor(0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.shield} Permission Control Panel\n` +
        `**Manage who can use bot commands**`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 🌐 Global Settings\n` +
        `**Whitelist Mode:** ${global.whitelistMode ? '✅ On' : '❌ Off'}\n` +
        `**Allowed Users:** \`${global.allowedUserIds?.length || 0}\`\n` +
        `**Allowed Roles:** \`${global.allowedRoleIds?.length || 0}\`\n` +
        `**Blocked Users:** \`${global.blockedUserIds?.length || 0}\`\n` +
        `**Blocked Roles:** \`${global.blockedRoleIds?.length || 0}\``
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 📋 Per-Command Overrides\n` +
        (commandsCount > 0
          ? Object.keys(config.commands).map(c => `• \`${c}\``).join('\n')
          : '*No per-command overrides yet*')
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 💡 How It Works\n` +
        `• **Whitelist OFF** — Everyone can use commands (except blocked)\n` +
        `• **Whitelist ON** — Only allowed users/roles can use commands\n` +
        `• **Admins** are always allowed\n` +
        `• **Per-command** overrides global settings`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
    );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('perm_toggle_whitelist')
      .setLabel(global.whitelistMode ? 'Whitelist: ON' : 'Whitelist: OFF')
      .setEmoji('🌐')
      .setStyle(global.whitelistMode ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('perm_manage_users').setLabel('Manage Users').setEmoji('👤').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('perm_manage_roles').setLabel('Manage Roles').setEmoji('🎭').setStyle(ButtonStyle.Primary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('perm_view_list').setLabel('View Lists').setEmoji('📜').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('perm_per_command').setLabel('Per-Command').setEmoji('📋').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('perm_reset').setLabel('Reset All').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('perm_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return { container, components: [container, row1, row2] };
}

// ===== MANAGE USERS PANEL =====
async function buildManageUsers(config, client, guild) {
  const global = config.global || {};
  const { users: allowedUsers } = await getDisplayNames(client, guild, global.allowedUserIds || []);
  const { users: blockedUsers } = await getDisplayNames(client, guild, global.blockedUserIds || []);

  const container = new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 👤 Manage Users\n**Global user permissions**`)
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ✅ Allowed Users (${allowedUsers.length})\n` +
        (allowedUsers.length > 0
          ? allowedUsers.map(u => `• ${u.name} — \`${u.id}\``).join('\n')
          : '*None*')
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 🚫 Blocked Users (${blockedUsers.length})\n` +
        (blockedUsers.length > 0
          ? blockedUsers.map(u => `• ${u.name} — \`${u.id}\``).join('\n')
          : '*None*')
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Use buttons below to add/remove*`)
    );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('perm_add_allowed_user').setLabel('Allow User').setEmoji('➕').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('perm_add_blocked_user').setLabel('Block User').setEmoji('🚫').setStyle(ButtonStyle.Danger)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('perm_clear_allowed_users').setLabel('Clear Allowed').setEmoji('🗑️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('perm_clear_blocked_users').setLabel('Clear Blocked').setEmoji('🗑️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('perm_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row1, row2];
}

// ===== MANAGE ROLES PANEL =====
async function buildManageRoles(config, client, guild) {
  const global = config.global || {};
  const { roles: allowedRoles } = await getDisplayNames(client, guild, [], global.allowedRoleIds || []);
  const { roles: blockedRoles } = await getDisplayNames(client, guild, [], global.blockedRoleIds || []);

  const container = new ContainerBuilder()
    .setAccentColor(0xEB459E)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🎭 Manage Roles\n**Global role permissions**`)
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ✅ Allowed Roles (${allowedRoles.length})\n` +
        (allowedRoles.length > 0
          ? allowedRoles.map(r => `• ${r.name} — \`${r.id}\``).join('\n')
          : '*None*')
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 🚫 Blocked Roles (${blockedRoles.length})\n` +
        (blockedRoles.length > 0
          ? blockedRoles.map(r => `• ${r.name} — \`${r.id}\``).join('\n')
          : '*None*')
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Use buttons below to add/remove*`)
    );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('perm_add_allowed_role').setLabel('Allow Role').setEmoji('➕').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('perm_add_blocked_role').setLabel('Block Role').setEmoji('🚫').setStyle(ButtonStyle.Danger)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('perm_clear_allowed_roles').setLabel('Clear Allowed').setEmoji('🗑️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('perm_clear_blocked_roles').setLabel('Clear Blocked').setEmoji('🗑️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('perm_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary)
  );

  return [container, row1, row2];
}

module.exports = {
  name: 'setperm',
  description: 'Advanced permission control panel',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('setperm')
    .setDescription('Advanced permission control panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(context) {
    if (!context.isChatInputCommand || !context.isChatInputCommand()) {
      return context.reply('Use /setperm (slash command).');
    }

    const config = loadConfig();
    const panel = await buildMainPanel(config, context.client, context.guild);

    await context.reply({
      components: panel.components,
      flags: 1 << 15 | 1 << 6,
    });
  },

  async handleButton(interaction, client) {
    const config = loadConfig();
    const id = interaction.customId;
    const guild = interaction.guild;

    if (id === 'perm_close') {
      await interaction.update({ components: [] });
      return true;
    }

    if (id === 'perm_toggle_whitelist') {
      if (!config.global) config.global = {};
      config.global.whitelistMode = !config.global.whitelistMode;
      saveConfig(config);
      const panel = await buildMainPanel(config, client, guild);
      await interaction.update({ components: panel.components, flags: 1 << 15 });
      return true;
    }

    if (id === 'perm_reset') {
      config.global = {
        whitelistMode: false,
        allowedUserIds: [],
        allowedRoleIds: [],
        blockedUserIds: [],
        blockedRoleIds: [],
      };
      config.commands = {};
      saveConfig(config);
      const panel = await buildMainPanel(config, client, guild);
      await interaction.update({ components: panel.components, flags: 1 << 15 });
      return true;
    }

    if (id === 'perm_manage_users') {
      const comps = await buildManageUsers(config, client, guild);
      await interaction.update({ components: comps, flags: 1 << 15 });
      return true;
    }

    if (id === 'perm_manage_roles') {
      const comps = await buildManageRoles(config, client, guild);
      await interaction.update({ components: comps, flags: 1 << 15 });
      return true;
    }

    if (id === 'perm_back') {
      const panel = await buildMainPanel(config, client, guild);
      await interaction.update({ components: panel.components, flags: 1 << 15 });
      return true;
    }

    if (id === 'perm_clear_allowed_users') {
      config.global.allowedUserIds = [];
      saveConfig(config);
      const comps = await buildManageUsers(config, client, guild);
      await interaction.update({ components: comps, flags: 1 << 15 });
      return true;
    }

    if (id === 'perm_clear_blocked_users') {
      config.global.blockedUserIds = [];
      saveConfig(config);
      const comps = await buildManageUsers(config, client, guild);
      await interaction.update({ components: comps, flags: 1 << 15 });
      return true;
    }

    if (id === 'perm_clear_allowed_roles') {
      config.global.allowedRoleIds = [];
      saveConfig(config);
      const comps = await buildManageRoles(config, client, guild);
      await interaction.update({ components: comps, flags: 1 << 15 });
      return true;
    }

    if (id === 'perm_clear_blocked_roles') {
      config.global.blockedRoleIds = [];
      saveConfig(config);
      const comps = await buildManageRoles(config, client, guild);
      await interaction.update({ components: comps, flags: 1 << 15 });
      return true;
    }

    // Modal openers
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
      if (!config.global.allowedUserIds) config.global.allowedUserIds = [];
      if (!config.global.allowedUserIds.includes(userId)) config.global.allowedUserIds.push(userId);
      saveConfig(config);
      const comps = await buildManageUsers(config, client, interaction.guild);
      await interaction.update({ components: comps, flags: 1 << 15 });
      return true;
    }

    if (id === 'modal_perm_blocked_user') {
      const userId = interaction.fields.getTextInputValue('user_id');
      if (!config.global.blockedUserIds) config.global.blockedUserIds = [];
      if (!config.global.blockedUserIds.includes(userId)) config.global.blockedUserIds.push(userId);
      saveConfig(config);
      const comps = await buildManageUsers(config, client, interaction.guild);
      await interaction.update({ components: comps, flags: 1 << 15 });
      return true;
    }

    if (id === 'modal_perm_allowed_role') {
      const roleId = interaction.fields.getTextInputValue('role_id');
      if (!config.global.allowedRoleIds) config.global.allowedRoleIds = [];
      if (!config.global.allowedRoleIds.includes(roleId)) config.global.allowedRoleIds.push(roleId);
      saveConfig(config);
      const comps = await buildManageRoles(config, client, interaction.guild);
      await interaction.update({ components: comps, flags: 1 << 15 });
      return true;
    }

    if (id === 'modal_perm_blocked_role') {
      const roleId = interaction.fields.getTextInputValue('role_id');
      if (!config.global.blockedRoleIds) config.global.blockedRoleIds = [];
      if (!config.global.blockedRoleIds.includes(roleId)) config.global.blockedRoleIds.push(roleId);
      saveConfig(config);
      const comps = await buildManageRoles(config, client, interaction.guild);
      await interaction.update({ components: comps, flags: 1 << 15 });
      return true;
    }

    return false;
  },
};
