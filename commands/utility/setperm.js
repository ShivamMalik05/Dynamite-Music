const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const {
  loadConfig,
  saveConfig,
  isBotOwner,
  getServerConfig,
} = require('../../utils/permissions');

// Store temp permissions (in-memory)
const tempPermissions = new Map();

// ===== BUILD LIST PANEL =====
async function buildListPanel(config, guild, client, page, isOwner) {
  const guildId = guild.id;
  const server = getServerConfig(config, guildId);
  const global = config.global || {};

  const entries = [];

  // Server entries
  for (const id of server.allowedUserIds || []) {
    try {
      const member = await guild.members.fetch(id).catch(() => null);
      entries.push({ type: 'user', name: member ? member.user.tag : 'Unknown', id, scope: 'Server', status: '✅ Allowed' });
    } catch {
      entries.push({ type: 'user', name: 'Unknown', id, scope: 'Server', status: '✅ Allowed' });
    }
  }
  for (const id of server.allowedRoleIds || []) {
    const role = guild.roles.cache.get(id);
    entries.push({ type: 'role', name: role ? role.name : 'Unknown', id, scope: 'Server', status: '✅ Allowed' });
  }
  for (const id of server.blockedUserIds || []) {
    try {
      const member = await guild.members.fetch(id).catch(() => null);
      entries.push({ type: 'user', name: member ? member.user.tag : 'Unknown', id, scope: 'Server', status: '🚫 Blocked' });
    } catch {
      entries.push({ type: 'user', name: 'Unknown', id, scope: 'Server', status: '🚫 Blocked' });
    }
  }
  for (const id of server.blockedRoleIds || []) {
    const role = guild.roles.cache.get(id);
    entries.push({ type: 'role', name: role ? role.name : 'Unknown', id, scope: 'Server', status: '🚫 Blocked' });
  }

  // Global entries (owner only)
  if (isOwner) {
    for (const id of global.allowedUserIds || []) {
      try {
        const member = await guild.members.fetch(id).catch(() => null);
        entries.push({ type: 'user', name: member ? member.user.tag : 'Unknown', id, scope: 'Global', status: '✅ Allowed' });
      } catch {
        entries.push({ type: 'user', name: 'Unknown', id, scope: 'Global', status: '✅ Allowed' });
      }
    }
    for (const id of global.allowedRoleIds || []) {
      const role = guild.roles.cache.get(id);
      entries.push({ type: 'role', name: role ? role.name : 'Unknown', id, scope: 'Global', status: '✅ Allowed' });
    }
    for (const id of global.blockedUserIds || []) {
      try {
        const member = await guild.members.fetch(id).catch(() => null);
        entries.push({ type: 'user', name: member ? member.user.tag : 'Unknown', id, scope: 'Global', status: '🚫 Blocked' });
      } catch {
        entries.push({ type: 'user', name: 'Unknown', id, scope: 'Global', status: '🚫 Blocked' });
      }
    }
    for (const id of global.blockedRoleIds || []) {
      const role = guild.roles.cache.get(id);
      entries.push({ type: 'role', name: role ? role.name : 'Unknown', id, scope: 'Global', status: '🚫 Blocked' });
    }
  }

  // Pagination
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(entries.length / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * perPage;
  const pageEntries = entries.slice(start, start + perPage);

  let listText = '';
  if (pageEntries.length === 0) {
    listText = '*No permissions configured*';
  } else {
    for (const e of pageEntries) {
      const icon = e.type === 'user' ? '👤' : '🎭';
      const scopeIcon = e.scope === 'Global' ? '🌐' : '🏠';
      listText += `${icon} **${e.name}** ${scopeIcon}\n`;
      listText += `└ \`${e.id}\` — ${e.status}\n`;
    }
  }

  const container = new ContainerBuilder()
    .setAccentColor(isOwner ? 0xFFD700 : 0xFFFFFF)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.shield || '🛡️'} Permission List\n` +
        `**Server:** ${guild.name}\n` +
        `**View:** ${isOwner ? '👑 Owner View' : '🛡️ Server View'}`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Total Entries:** ${entries.length}\n` +
        `**Page:** ${currentPage} / ${totalPages}`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(listText))
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`sp_list_prev_${currentPage}`).setLabel('Previous').setEmoji('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === 1),
    new ButtonBuilder().setCustomId(`sp_list_next_${currentPage}`).setLabel('Next').setEmoji('➡️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === totalPages),
    new ButtonBuilder().setCustomId('sp_list_refresh').setLabel('Refresh').setEmoji('🔄').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('sp_list_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row];
}

// ===== REPLY EMBED =====
function replyEmbed(color, title, description, client) {
  return new EmbedBuilder()
    .setColor(color)
    .setAuthor({
      name: 'Permission System',
      iconURL: client.user.displayAvatarURL({ dynamic: true, size: 128 })
    })
    .setTitle(title)
    .setDescription(description)
    .setTimestamp()
    .setFooter({
      text: 'Powered by Dynamite Music',
      iconURL: client.user.displayAvatarURL({ dynamic: true, size: 64 })
    });
}

module.exports = {
  name: 'setperm',
  description: 'Manage command permissions',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('setperm')
    .setDescription('Manage command permissions')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('View all permissions (V2 panel with pagination)'))
    .addSubcommand(sub =>
      sub.setName('manage')
        .setDescription('Manage permissions')
        .addStringOption(opt =>
          opt.setName('action').setDescription('Action').setRequired(true)
            .addChoices(
              { name: 'Add', value: 'add' },
              { name: 'Remove', value: 'remove' },
              { name: 'Block', value: 'block' },
              { name: 'Unblock', value: 'unblock' },
              { name: 'Toggle Whitelist', value: 'toggle' }
            ))
        .addStringOption(opt =>
          opt.setName('type').setDescription('User or Role').setRequired(false)
            .addChoices({ name: 'User', value: 'user' }, { name: 'Role', value: 'role' }))
        .addStringOption(opt =>
          opt.setName('target').setDescription('User ID or Role ID').setRequired(false))
        .addStringOption(opt =>
          opt.setName('command').setDescription('Command name (leave empty for all)').setRequired(false))
        .addBooleanOption(opt =>
          opt.setName('global').setDescription('Apply globally (owner only)').setRequired(false))
        .addIntegerOption(opt =>
          opt.setName('duration').setDescription('Duration in minutes (temporary access)').setRequired(false))),

  async execute(context) {
    if (!context.isChatInputCommand || !context.isChatInputCommand()) {
      return context.reply('Use /setperm (slash command).');
    }

    const sub = context.options.getSubcommand();
    const config = loadConfig();
    const isOwner = isBotOwner(context.user.id);
    const guild = context.guild;
    const client = context.client;
    const server = getServerConfig(config, guild.id);

    if (!config.global) {
      config.global = {
        whitelistMode: false,
        allowedUserIds: [],
        allowedRoleIds: [],
        blockedUserIds: [],
        blockedRoleIds: [],
      };
    }

    // Permission check
    if (!isOwner && !context.member.permissions.has('Administrator')) {
      return context.reply({
        content: `${emojis.error} You need Administrator permission.`,
        ephemeral: true
      });
    }

    // ===== LIST =====
    if (sub === 'list') {
      const components = await buildListPanel(config, guild, client, 1, isOwner);
      return context.reply({ components, flags: 1 << 15 | 1 << 6 });
    }

    // ===== MANAGE =====
    if (sub === 'manage') {
      const action = context.options.getString('action');
      const type = context.options.getString('type');
      const target = context.options.getString('target');
      const command = context.options.getString('command');
      const isGlobal = context.options.getBoolean('global') || false;
      const duration = context.options.getInteger('duration');

      // Toggle whitelist
      if (action === 'toggle') {
        const scope = isGlobal ? 'global' : 'server';
        if (scope === 'global' && !isOwner) {
          return context.reply({ content: `${emojis.error} Only bot owners can toggle global whitelist.`, ephemeral: true });
        }
        const targetConfig = scope === 'global' ? config.global : server;
        targetConfig.whitelistMode = !targetConfig.whitelistMode;
        saveConfig(config);
        return context.reply({
          embeds: [replyEmbed(
            targetConfig.whitelistMode ? 0x57F287 : 0xED4245,
            `${emojis.shield} Whitelist Toggled`,
            `${scope === 'global' ? '🌐 Global' : '🏠 Server'} whitelist is now **${targetConfig.whitelistMode ? 'ON' : 'OFF'}**.`,
            client
          )]
        });
      }

      // Validate type and target for non-toggle actions
      if (!type || !target) {
        return context.reply({ content: `${emojis.error} \`type\` and \`target\` are required.`, ephemeral: true });
      }

      if (isGlobal && !isOwner) {
        return context.reply({ content: `${emojis.error} Only bot owners can use global scope.`, ephemeral: true });
      }

      const targetConfig = isGlobal ? config.global : server;
      let targetName = target;
      try {
        if (type === 'user') {
          const member = await guild.members.fetch(target);
          targetName = member.user.tag;
        } else {
          const role = guild.roles.cache.get(target);
          if (role) targetName = role.name;
        }
      } catch {}

      // ===== ADD =====
      if (action === 'add') {
        if (type === 'user') {
          if (!targetConfig.allowedUserIds) targetConfig.allowedUserIds = [];
          if (targetConfig.allowedUserIds.includes(target)) {
            return context.reply({ content: `${emojis.error} Already allowed.`, ephemeral: true });
          }
          targetConfig.allowedUserIds.push(target);
          targetConfig.blockedUserIds = (targetConfig.blockedUserIds || []).filter(i => i !== target);
        } else {
          if (!targetConfig.allowedRoleIds) targetConfig.allowedRoleIds = [];
          if (targetConfig.allowedRoleIds.includes(target)) {
            return context.reply({ content: `${emojis.error} Already allowed.`, ephemeral: true });
          }
          targetConfig.allowedRoleIds.push(target);
          targetConfig.blockedRoleIds = (targetConfig.blockedRoleIds || []).filter(i => i !== target);
        }
        saveConfig(config);

        let desc = `**${type}:** ${targetName}\n**Scope:** ${isGlobal ? '🌐 Global' : '🏠 Server'}\n**Command:** ${command ? `\`${command}\`` : '*All commands*'}`;

        if (duration && duration > 0) {
          const expiresAt = Date.now() + duration * 60 * 1000;
          tempPermissions.set(`${guild.id}_${target}_${command || 'all'}`, { expiresAt });

          setTimeout(() => {
            const cfg = loadConfig();
            const srv = isGlobal ? cfg.global : getServerConfig(cfg, guild.id);
            if (type === 'user') {
              srv.allowedUserIds = (srv.allowedUserIds || []).filter(i => i !== target);
            } else {
              srv.allowedRoleIds = (srv.allowedRoleIds || []).filter(i => i !== target);
            }
            saveConfig(cfg);
            tempPermissions.delete(`${guild.id}_${target}_${command || 'all'}`);
          }, duration * 60 * 1000);

          desc += `\n**Duration:** ${duration} minute(s)`;
          desc += `\n**Expires:** <t:${Math.floor(expiresAt / 1000)}:R>`;
        }

        return context.reply({ embeds: [replyEmbed(0x57F287, `${emojis.success} Added`, desc, client)] });
      }

      // ===== REMOVE =====
      if (action === 'remove') {
        let removed = false;
        if (type === 'user') {
          const idx = (targetConfig.allowedUserIds || []).indexOf(target);
          if (idx > -1) { targetConfig.allowedUserIds.splice(idx, 1); removed = true; }
        } else {
          const idx = (targetConfig.allowedRoleIds || []).indexOf(target);
          if (idx > -1) { targetConfig.allowedRoleIds.splice(idx, 1); removed = true; }
        }
        if (!removed) return context.reply({ content: `${emojis.error} Not found.`, ephemeral: true });
        saveConfig(config);
        return context.reply({
          embeds: [replyEmbed(0xED4245, `${emojis.cross} Removed`,
            `**${type}:** ${targetName}\n**Scope:** ${isGlobal ? '🌐 Global' : '🏠 Server'}`,
            client)]
        });
      }

      // ===== BLOCK =====
      if (action === 'block') {
        if (type === 'user') {
          if (!targetConfig.blockedUserIds) targetConfig.blockedUserIds = [];
          if (targetConfig.blockedUserIds.includes(target)) {
            return context.reply({ content: `${emojis.error} Already blocked.`, ephemeral: true });
          }
          targetConfig.blockedUserIds.push(target);
          targetConfig.allowedUserIds = (targetConfig.allowedUserIds || []).filter(i => i !== target);
        } else {
          if (!targetConfig.blockedRoleIds) targetConfig.blockedRoleIds = [];
          if (targetConfig.blockedRoleIds.includes(target)) {
            return context.reply({ content: `${emojis.error} Already blocked.`, ephemeral: true });
          }
          targetConfig.blockedRoleIds.push(target);
          targetConfig.allowedRoleIds = (targetConfig.allowedRoleIds || []).filter(i => i !== target);
        }
        saveConfig(config);
        return context.reply({
          embeds: [replyEmbed(0xED4245, `${emojis.cross} Blocked`,
            `**${type}:** ${targetName}\n**Scope:** ${isGlobal ? '🌐 Global' : '🏠 Server'}`,
            client)]
        });
      }

      // ===== UNBLOCK =====
      if (action === 'unblock') {
        let removed = false;
        if (type === 'user') {
          const idx = (targetConfig.blockedUserIds || []).indexOf(target);
          if (idx > -1) { targetConfig.blockedUserIds.splice(idx, 1); removed = true; }
        } else {
          const idx = (targetConfig.blockedRoleIds || []).indexOf(target);
          if (idx > -1) { targetConfig.blockedRoleIds.splice(idx, 1); removed = true; }
        }
        if (!removed) return context.reply({ content: `${emojis.error} Not found.`, ephemeral: true });
        saveConfig(config);
        return context.reply({
          embeds: [replyEmbed(0x57F287, `${emojis.check} Unblocked`,
            `**${type}:** ${targetName}\n**Scope:** ${isGlobal ? '🌐 Global' : '🏠 Server'}`,
            client)]
        });
      }
    }
  },

  async handleButton(interaction, client) {
    const id = interaction.customId;
    if (!id.startsWith('sp_list_')) return false;

    const config = loadConfig();
    const guild = interaction.guild;
    const isOwner = isBotOwner(interaction.user.id);

    if (id === 'sp_list_close') {
      await interaction.update({ components: [] });
      return true;
    }

    if (id.startsWith('sp_list_prev_')) {
      const current = parseInt(id.replace('sp_list_prev_', ''));
      const components = await buildListPanel(config, guild, client, current - 1, isOwner);
      await interaction.update({ components, flags: 1 << 15 });
      return true;
    }

    if (id.startsWith('sp_list_next_')) {
      const current = parseInt(id.replace('sp_list_next_', ''));
      const components = await buildListPanel(config, guild, client, current + 1, isOwner);
      await interaction.update({ components, flags: 1 << 15 });
      return true;
    }

    if (id === 'sp_list_refresh') {
      const components = await buildListPanel(config, guild, client, 1, isOwner);
      await interaction.update({ components, flags: 1 << 15 });
      return true;
    }

    return false;
  },
};
