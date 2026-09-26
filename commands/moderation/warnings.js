const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const { sendLog } = require('../../utils/logger');
const core = require('../../core');

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

async function buildWarningsPanel(allWarnings, page, client, guild, title = 'All Warnings') {
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(allWarnings.length / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * perPage;
  const pageEntries = allWarnings.slice(start, start + perPage);

  let listText = '';
  if (pageEntries.length === 0) {
    listText = '*No warnings found*';
  } else {
    for (const w of pageEntries) {
      let userTag = 'Unknown';
      try {
        const m = await guild.members.fetch(w.userId).catch(() => null);
        if (m) userTag = m.user.tag;
      } catch {}
      listText += `**#${w.id}** — ${userTag}\n`;
      listText += `└ ${emojis.reason || '📝'} ${w.reason}\n`;
      listText += `└ ${emojis.shield || '🛡️'} by ${w.moderator} ${emojis.dot || '•'} <t:${Math.floor(new Date(w.date).getTime() / 1000)}:R>\n\n`;
    }
  }

  const container = new ContainerBuilder()
    .setAccentColor(0xFEE75C)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${emojis.warn} Warning Manager\n**${title}**`)
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Total:** \`${allWarnings.length}\` | **Page:** \`${currentPage}/${totalPages}\``)
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(listText.slice(0, 3500)))
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`warn_panel_prev_${currentPage}`).setLabel('Previous').setEmoji('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === 1),
    new ButtonBuilder().setCustomId(`warn_panel_next_${currentPage}`).setLabel('Next').setEmoji('➡️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === totalPages),
    new ButtonBuilder().setCustomId('warn_panel_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row];
}

module.exports = {
  name: 'warnings',
  description: 'View and manage user warnings',
  category: 'Moderation',
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View and manage user warnings')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt =>
      opt.setName('user').setDescription('User to view warnings for').setRequired(false))
    .addStringOption(opt =>
      opt.setName('remove').setDescription('Remove: number or "all"').setRequired(false))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Filter by reason').setRequired(false)),

  async execute(context) {
    if (!context.isChatInputCommand || !context.isChatInputCommand()) {
      return context.reply('Use /warnings (slash command).');
    }

    if (!(await core.permissions.checkPermission(context, 'warnings'))) return;

    const client = context.client;
    const guild = context.guild;
    const targetUser = context.options.getUser('user');
    const removeOption = context.options.getString('remove');
    const reasonFilter = context.options.getString('reason');

    // ===== REMOVE MODE =====
    if (removeOption && targetUser) {
      let result;

      if (removeOption.toLowerCase() === 'all') {
        result = core.warnings.removeWarnings(targetUser.id, { all: true });
      } else {
        const count = parseInt(removeOption);
        if (isNaN(count) || count < 1) {
          return context.reply({ content: `${emojis.error} Invalid remove value.`, ephemeral: true });
        }
        result = core.warnings.removeWarnings(targetUser.id, { count });
      }

      if (result.error) {
        return context.reply({ content: `${emojis.error} ${result.error}`, ephemeral: true });
      }

      await context.reply({
        content: `${emojis.success} Removed **${result.removed.length}** warning(s) from **${targetUser.tag}**: ${result.removedIds.join(', ')}`,
        ephemeral: true,
      });

      await sendLog(client, 'warn', {
        emoji: emojis.purge,
        title: 'Warnings Removed',
        subtitle: 'Warnings were removed',
        fields: [
          { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})` },
          { name: '🛡️ Moderator', value: `${context.user.tag} (${context.user.id})` },
          { name: '🗑️ Removed', value: `${result.removed.length}` },
          { name: '🆔 IDs', value: result.removedIds.join(', ').slice(0, 1000) },
        ],
      });
      return;
    }

    // ===== VIEW MODE =====
    let allWarnings;
    let title;

    if (targetUser) {
      allWarnings = core.warnings.getUserWarnings(targetUser.id);
      title = `${targetUser.tag} — ${allWarnings.length} warning(s)`;
    } else {
      allWarnings = core.warnings.getAllWarnings();
      title = 'All Warnings in Server';
    }

    if (reasonFilter && reasonFilter.trim()) {
      const q = reasonFilter.toLowerCase();
      allWarnings = allWarnings.filter(w => w.reason.toLowerCase().includes(q));
      title += ` (reason: ${reasonFilter})`;
    }

    const components = await buildWarningsPanel(allWarnings, 1, client, guild, title);
    await context.reply({ components, flags: 1 << 15 | 1 << 6 });
  },

  async handleButton(interaction, client) {
    const id = interaction.customId;
    if (!id.startsWith('warn_panel_')) return false;

    const guild = interaction.guild;

    if (id === 'warn_panel_close') {
      try { await interaction.message.delete(); } catch {}
      return true;
    }

    if (id.startsWith('warn_panel_prev_') || id.startsWith('warn_panel_next_')) {
      const all = core.warnings.getAllWarnings();
      let page = 1;
      if (id.startsWith('warn_panel_prev_')) page = Math.max(1, parseInt(id.replace('warn_panel_prev_', '')) - 1);
      else page = parseInt(id.replace('warn_panel_next_', '')) + 1;

      const components = await buildWarningsPanel(all, page, client, guild, 'All Warnings in Server');
      await interaction.update({ components, flags: 1 << 15 });
      return true;
    }

    return false;
  },
};
