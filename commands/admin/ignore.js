const { SlashCommandBuilder, ChannelType } = require('discord.js');
const core = require('../../core');
const logConfig = require('../../config/logs');

module.exports = {
  name: 'ignore',
  category: 'admin',
  adminOnly: true,
  data: new SlashCommandBuilder()
    .setName('ignore')
    .setDescription('Manage ignored channels, roles, and users for logging')
    .addSubcommand(sub =>
      sub.setName('list').setDescription('List all ignored entries')
    )
    .addSubcommand(sub =>
      sub.setName('channel').setDescription('Add or remove an ignored channel')
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel').addChannelTypes(ChannelType.GuildText).setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('role').setDescription('Add or remove an ignored role')
        .addRoleOption(opt => opt.setName('role').setDescription('Role').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('user').setDescription('Add or remove an ignored user')
        .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
    ),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'list') {
      const embed = core.embeds.info([
        `**Channels:** ${logConfig.ignoredChannels.length ? logConfig.ignoredChannels.map(id => `<#${id}>`).join(', ') : 'none'}`,
        `**Roles:** ${logConfig.ignoredRoles.length ? logConfig.ignoredRoles.map(id => `<@&${id}>`).join(', ') : 'none'}`,
        `**Users:** ${logConfig.ignoredUsers.length ? logConfig.ignoredUsers.map(id => `<@${id}>`).join(', ') : 'none'}`,
      ].join('\n'), 'Ignored Entries');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'channel') {
      const channel = interaction.options.getChannel('channel');
      const idx = logConfig.ignoredChannels.indexOf(channel.id);
      if (idx === -1) {
        logConfig.ignoredChannels.push(channel.id);
        return interaction.reply({ embeds: [core.embeds.success(`Added ${channel} to ignore list.`)], ephemeral: true });
      } else {
        logConfig.ignoredChannels.splice(idx, 1);
        return interaction.reply({ embeds: [core.embeds.success(`Removed ${channel} from ignore list.`)], ephemeral: true });
      }
    }

    if (sub === 'role') {
      const role = interaction.options.getRole('role');
      const idx = logConfig.ignoredRoles.indexOf(role.id);
      if (idx === -1) {
        logConfig.ignoredRoles.push(role.id);
        return interaction.reply({ embeds: [core.embeds.success(`Added ${role} to ignore list.`)], ephemeral: true });
      } else {
        logConfig.ignoredRoles.splice(idx, 1);
        return interaction.reply({ embeds: [core.embeds.success(`Removed ${role} from ignore list.`)], ephemeral: true });
      }
    }

    if (sub === 'user') {
      const user = interaction.options.getUser('user');
      const idx = logConfig.ignoredUsers.indexOf(user.id);
      if (idx === -1) {
        logConfig.ignoredUsers.push(user.id);
        return interaction.reply({ embeds: [core.embeds.success(`Added ${user} to ignore list.`)], ephemeral: true });
      } else {
        logConfig.ignoredUsers.splice(idx, 1);
        return interaction.reply({ embeds: [core.embeds.success(`Removed ${user} from ignore list.`)], ephemeral: true });
      }
    }
  },
};
