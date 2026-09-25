const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const { loadConfig, saveConfig, getDisplayNames } = require('../../utils/permissions');

module.exports = {
  name: 'setperm',
  description: 'Manage command permissions',
  category: 'Utility',
  data: new SlashCommandBuilder()
    .setName('setperm')
    .setDescription('Manage command permissions')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a user or role to the allowed list')
        .addStringOption(opt =>
          opt.setName('type')
            .setDescription('Type of target')
            .setRequired(true)
            .addChoices(
              { name: 'User', value: 'user' },
              { name: 'Role', value: 'role' }
            ))
        .addStringOption(opt =>
          opt.setName('target')
            .setDescription('User ID or Role ID')
            .setRequired(true))
        .addStringOption(opt =>
          opt.setName('command')
            .setDescription('Command name (leave empty for global)')
            .setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove a user or role from the allowed list')
        .addStringOption(opt =>
          opt.setName('type')
            .setDescription('Type of target')
            .setRequired(true)
            .addChoices(
              { name: 'User', value: 'user' },
              { name: 'Role', value: 'role' }
            ))
        .addStringOption(opt =>
          opt.setName('target')
            .setDescription('User ID or Role ID')
            .setRequired(true))
        .addStringOption(opt =>
          opt.setName('command')
            .setDescription('Command name (leave empty for global)')
            .setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('block')
        .setDescription('Block a user or role')
        .addStringOption(opt =>
          opt.setName('type')
            .setDescription('Type of target')
            .setRequired(true)
            .addChoices(
              { name: 'User', value: 'user' },
              { name: 'Role', value: 'role' }
            ))
        .addStringOption(opt =>
          opt.setName('target')
            .setDescription('User ID or Role ID')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('unblock')
        .setDescription('Unblock a user or role')
        .addStringOption(opt =>
          opt.setName('type')
            .setDescription('Type of target')
            .setRequired(true)
            .addChoices(
              { name: 'User', value: 'user' },
              { name: 'Role', value: 'role' }
            ))
        .addStringOption(opt =>
          opt.setName('target')
            .setDescription('User ID or Role ID')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('whitelist')
        .setDescription('Toggle whitelist mode')
        .addStringOption(opt =>
          opt.setName('mode')
            .setDescription('On or Off')
            .setRequired(true)
            .addChoices(
              { name: 'On', value: 'on' },
              { name: 'Off', value: 'off' }
            )))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('View current permissions'))
    .addSubcommand(sub =>
      sub.setName('reset')
        .setDescription('Reset all permissions')),

  async execute(context) {
    if (!context.isChatInputCommand || !context.isChatInputCommand()) {
      return context.reply('Use /setperm (slash command).');
    }

    const sub = context.options.getSubcommand();
    const config = loadConfig();
    if (!config.global) {
      config.global = {
        whitelistMode: false,
        allowedUserIds: [],
        allowedRoleIds: [],
        blockedUserIds: [],
        blockedRoleIds: [],
      };
    }
    if (!config.commands) config.commands = {};

    const guild = context.guild;
    const client = context.client;

    // ===== ADD =====
    if (sub === 'add') {
      const type = context.options.getString('type');
      const target = context.options.getString('target');
      const command = context.options.getString('command');

      let targetConfig;
      if (command) {
        if (!config.commands[command]) {
          config.commands[command] = {
            allowedUserIds: [],
            allowedRoleIds: [],
            blockedUserIds: [],
            blockedRoleIds: [],
          };
        }
        targetConfig = config.commands[command];
      } else {
        targetConfig = config.global;
      }

      if (type === 'user') {
        if (!targetConfig.allowedUserIds) targetConfig.allowedUserIds = [];
        if (targetConfig.allowedUserIds.includes(target)) {
          return context.reply({ content: `${emojis.permission?.cross || '❌'} User already allowed.`, ephemeral: true });
        }
        targetConfig.allowedUserIds.push(target);
      } else {
        if (!targetConfig.allowedRoleIds) targetConfig.allowedRoleIds = [];
        if (targetConfig.allowedRoleIds.includes(target)) {
          return context.reply({ content: `${emojis.permission?.cross || '❌'} Role already allowed.`, ephemeral: true });
        }
        targetConfig.allowedRoleIds.push(target);
      }

      saveConfig(config);

      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle(`${emojis.permission?.add || '➕'} Added`)
        .setDescription(`Added **${type}** \`${target}\` to allowed list.`)
        .addFields(
          { name: 'Scope', value: command ? `Command: \`${command}\`` : 'Global', inline: true }
        )
        .setTimestamp();

      return context.reply({ embeds: [embed], ephemeral: true });
    }

    // ===== REMOVE =====
    if (sub === 'remove') {
      const type = context.options.getString('type');
      const target = context.options.getString('target');
      const command = context.options.getString('command');

      let targetConfig;
      if (command) {
        if (!config.commands[command]) {
          return context.reply({ content: `${emojis.permission?.cross || '❌'} Command not configured.`, ephemeral: true });
        }
        targetConfig = config.commands[command];
      } else {
        targetConfig = config.global;
      }

      let removed = false;
      if (type === 'user') {
        if (targetConfig.allowedUserIds) {
          const idx = targetConfig.allowedUserIds.indexOf(target);
          if (idx > -1) {
            targetConfig.allowedUserIds.splice(idx, 1);
            removed = true;
          }
        }
      } else {
        if (targetConfig.allowedRoleIds) {
          const idx = targetConfig.allowedRoleIds.indexOf(target);
          if (idx > -1) {
            targetConfig.allowedRoleIds.splice(idx, 1);
            removed = true;
          }
        }
      }

      if (!removed) {
        return context.reply({ content: `${emojis.permission?.cross || '❌'} Not found in allowed list.`, ephemeral: true });
      }

      saveConfig(config);

      const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle(`${emojis.permission?.remove || '➖'} Removed`)
        .setDescription(`Removed **${type}** \`${target}\` from allowed list.`)
        .addFields(
          { name: 'Scope', value: command ? `Command: \`${command}\`` : 'Global', inline: true }
        )
        .setTimestamp();

      return context.reply({ embeds: [embed], ephemeral: true });
    }

    // ===== BLOCK =====
    if (sub === 'block') {
      const type = context.options.getString('type');
      const target = context.options.getString('target');

      if (type === 'user') {
        if (!config.global.blockedUserIds) config.global.blockedUserIds = [];
        if (config.global.blockedUserIds.includes(target)) {
          return context.reply({ content: `${emojis.permission?.cross || '❌'} User already blocked.`, ephemeral: true });
        }
        config.global.blockedUserIds.push(target);
      } else {
        if (!config.global.blockedRoleIds) config.global.blockedRoleIds = [];
        if (config.global.blockedRoleIds.includes(target)) {
          return context.reply({ content: `${emojis.permission?.cross || '❌'} Role already blocked.`, ephemeral: true });
        }
        config.global.blockedRoleIds.push(target);
      }

      saveConfig(config);

      const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle(`${emojis.permission?.cross || '❌'} Blocked`)
        .setDescription(`Blocked **${type}** \`${target}\`.`)
        .setTimestamp();

      return context.reply({ embeds: [embed], ephemeral: true });
    }

    // ===== UNBLOCK =====
    if (sub === 'unblock') {
      const type = context.options.getString('type');
      const target = context.options.getString('target');

      let removed = false;
      if (type === 'user') {
        if (config.global.blockedUserIds) {
          const idx = config.global.blockedUserIds.indexOf(target);
          if (idx > -1) {
            config.global.blockedUserIds.splice(idx, 1);
            removed = true;
          }
        }
      } else {
        if (config.global.blockedRoleIds) {
          const idx = config.global.blockedRoleIds.indexOf(target);
          if (idx > -1) {
            config.global.blockedRoleIds.splice(idx, 1);
            removed = true;
          }
        }
      }

      if (!removed) {
        return context.reply({ content: `${emojis.permission?.cross || '❌'} Not found in blocked list.`, ephemeral: true });
      }

      saveConfig(config);

      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle(`${emojis.permission?.check || '✅'} Unblocked`)
        .setDescription(`Unblocked **${type}** \`${target}\`.`)
        .setTimestamp();

      return context.reply({ embeds: [embed], ephemeral: true });
    }

    // ===== WHITELIST =====
    if (sub === 'whitelist') {
      const mode = context.options.getString('mode');
      config.global.whitelistMode = mode === 'on';
      saveConfig(config);

      const embed = new EmbedBuilder()
        .setColor(config.global.whitelistMode ? 0x57F287 : 0xED4245)
        .setTitle(`${emojis.permission?.shield || '🛡️'} Whitelist Mode`)
        .setDescription(`Whitelist mode is now **${config.global.whitelistMode ? 'ON' : 'OFF'}**.`)
        .setTimestamp();

      return context.reply({ embeds: [embed], ephemeral: true });
    }

    // ===== LIST =====
    if (sub === 'list') {
      const { users: allowedUsers } = await getDisplayNames(client, guild, config.global.allowedUserIds || []);
      const { roles: allowedRoles } = await getDisplayNames(client, guild, [], config.global.allowedRoleIds || []);
      const { users: blockedUsers } = await getDisplayNames(client, guild, config.global.blockedUserIds || []);
      const { roles: blockedRoles } = await getDisplayNames(client, guild, [], config.global.blockedRoleIds || []);

      const embed = new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setTitle(`${emojis.permission?.list || '📜'} Current Permissions`)
        .setDescription(
          `**Whitelist Mode:** ${config.global.whitelistMode ? '✅ ON' : '❌ OFF'}`
        )
        .addFields(
          {
            name: `${emojis.permission?.check || '✅'} Allowed Users (${allowedUsers.length})`,
            value: allowedUsers.length > 0
              ? allowedUsers.map(u => `• ${u.name}`).join('\n').slice(0, 1024)
              : '*None*',
            inline: true
          },
          {
            name: `${emojis.permission?.check || '✅'} Allowed Roles (${allowedRoles.length})`,
            value: allowedRoles.length > 0
              ? allowedRoles.map(r => `• ${r.name}`).join('\n').slice(0, 1024)
              : '*None*',
            inline: true
          },
          {
            name: `${emojis.permission?.cross || '❌'} Blocked Users (${blockedUsers.length})`,
            value: blockedUsers.length > 0
              ? blockedUsers.map(u => `• ${u.name}`).join('\n').slice(0, 1024)
              : '*None*',
            inline: true
          },
          {
            name: `${emojis.permission?.cross || '❌'} Blocked Roles (${blockedRoles.length})`,
            value: blockedRoles.length > 0
              ? blockedRoles.map(r => `• ${r.name}`).join('\n').slice(0, 1024)
              : '*None*',
            inline: true
          },
          {
            name: '📋 Per-Command',
            value: Object.keys(config.commands).length > 0
              ? Object.keys(config.commands).map(c => `• \`${c}\``).join('\n').slice(0, 1024)
              : '*None*',
            inline: false
          }
        )
        .setTimestamp()
        .setFooter({ text: 'Powered by Dynamite Music' });

      return context.reply({ embeds: [embed], ephemeral: true });
    }

    // ===== RESET =====
    if (sub === 'reset') {
      config.global = {
        whitelistMode: false,
        allowedUserIds: [],
        allowedRoleIds: [],
        blockedUserIds: [],
        blockedRoleIds: [],
      };
      config.commands = {};
      saveConfig(config);

      const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle(`${emojis.permission?.cross || '❌'} Reset`)
        .setDescription('All permissions have been reset.')
        .setTimestamp();

      return context.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
