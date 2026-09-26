const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const { sendLog } = require('../../utils/logger');
const core = require('../../core');

// ===== SEPARATOR =====
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

// ===== MAIN PANEL =====
async function buildMainPanel(page, client, guild, filterUserId = null, filterLabel = 'All Warnings') {
  const allWarnings = core.warnings.getAllWarnings(filterUserId);

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
      new TextDisplayBuilder().setContent(
        `# ${emojis.warnings || '📋'} Warning Manager\n` +
        `**${filterLabel}**`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Total:** \`${allWarnings.length}\` | **Page:** \`${currentPage}/${totalPages}\``
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(listText.slice(0, 3500)))
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`));

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`wm_prev_${currentPage}`).setLabel('Previous').setEmoji('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === 1),
    new ButtonBuilder().setCustomId(`wm_next_${currentPage}`).setLabel('Next').setEmoji('➡️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === totalPages),
    new ButtonBuilder().setCustomId('wm_remove').setLabel('Remove').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('wm_search').setLabel('Search').setEmoji('🔍').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('wm_stats').setLabel('Stats').setEmoji('📊').setStyle(ButtonStyle.Success)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('wm_filter').setLabel('Filter User').setEmoji('👤').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('wm_export').setLabel('Export').setEmoji('📤').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('wm_back').setLabel('Back').setEmoji('🏠').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('wm_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row1, row2];
}

// ===== SEARCH PANEL =====
async function buildSearchPanel(searchValue, client, guild) {
  const results = core.warnings.search(searchValue, 'reason');

  let listText = '';
  if (results.length === 0) {
    listText = '*No warnings found*';
  } else {
    for (const w of results.slice(0, 10)) {
      let userTag = 'Unknown';
      try {
        const m = await guild.members.fetch(w.userId).catch(() => null);
        if (m) userTag = m.user.tag;
      } catch {}
      listText += `**#${w.id}** — ${userTag}\n`;
      listText += `└ ${w.reason} • by ${w.moderator}\n\n`;
    }
  }

  const container = new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.info} Search Results\n**Query:** \`${searchValue}\``
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Found:** \`${results.length}\``))
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(listText.slice(0, 3500)))
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('wm_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('wm_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row];
}

// ===== STATS PANEL =====
async function buildStatsPanel(client, guild) {
  const stats = core.warnings.getStats();

  const topMods = Object.entries(stats.moderators).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([m, c]) => `${emojis.arrow || '➡️'} ${m} — \`${c}\``).join('\n') || '*None*';

  const topReasons = Object.entries(stats.reasons).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([r, c]) => `${emojis.arrow || '➡️'} ${r} — \`${c}\``).join('\n') || '*None*';

  let mostWarnedText = '*None*';
  if (stats.mostWarned) {
    try {
      const u = await client.users.fetch(stats.mostWarned);
      mostWarnedText = `${u.tag} — \`${stats.mostCount}\``;
    } catch {
      mostWarnedText = `Unknown — \`${stats.mostCount}\``;
    }
  }

  const container = new ContainerBuilder()
    .setAccentColor(0xEB459E)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${emojis.stats} Warning Stats`))
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${emojis.arrow || '➡️'} **Total:** \`${stats.total}\`\n` +
        `${emojis.arrow || '➡️'} **Users Warned:** \`${stats.users}\`\n` +
        `${emojis.arrow || '➡️'} **Most Warned:** ${mostWarnedText}`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**${emojis.mod || '🛡️'} Top Moderators**\n${topMods}`)
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**${emojis.info} Top Reasons**\n${topReasons}`)
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('wm_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('wm_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row];
}

// ===== FILTER PANEL =====
async function buildFilterPanel(userId, client, guild) {
  const user = await client.users.fetch(userId).catch(() => null);
  if (!user) {
    const components = await buildMainPanel(1, client, guild);
    return components;
  }

  const allWarnings = core.warnings.getUserWarnings(userId);

  let listText = '';
  if (allWarnings.length === 0) {
    listText = '*No warnings found*';
  } else {
    for (const w of allWarnings.slice(0, 10)) {
      listText += `**#${w.id}** — ${w.reason}\n`;
      listText += `└ by ${w.moderator} ${emojis.dot || '•'} <t:${Math.floor(new Date(w.date).getTime() / 1000)}:R>\n\n`;
    }
  }

  const container = new ContainerBuilder()
    .setAccentColor(0x57F287)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.person} Filter: ${user.tag}\n**${allWarnings.length} warning(s)**`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(listText.slice(0, 3500)))
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`wm_remove_user_${userId}`).setLabel('Remove All').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('wm_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('wm_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row];
}

module.exports = {
  name: 'warning',
  description: 'Warning manager — view, remove, search, stats',
  category: 'Moderation',
  data: new SlashCommandBuilder()
    .setName('warning')
    .setDescription('Warning manager')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt =>
      opt.setName('user').setDescription('Filter by user (optional)').setRequired(false)),

  async execute(context) {
    if (!context.isChatInputCommand || !context.isChatInputCommand()) {
      return context.reply('Use /warning (slash command).');
    }

    if (!(await core.permissions.checkPermission(context, 'warning'))) return;

    const client = context.client;
    const guild = context.guild;
    const filterUser = context.options.getUser('user');

    const components = await buildMainPanel(
      1, client, guild,
      filterUser?.id || null,
      filterUser ? `Filter: ${filterUser.tag}` : 'All Warnings'
    );

    await context.reply({ components, flags: 1 << 15 | 1 << 6 });
  },

  // ===== BUTTON HANDLER =====
  async handleButton(interaction, client) {
    const id = interaction.customId;
    if (!id.startsWith('wm_')) return false;

    const guild = interaction.guild;

    // CLOSE
    if (id === 'wm_close') {
      try { await interaction.message.delete(); } catch {}
      return true;
    }

    // BACK
    if (id === 'wm_back') {
      const components = await buildMainPanel(1, client, guild);
      await interaction.update({ components, flags: 1 << 15 });
      return true;
    }

    // PREVIOUS
    if (id.startsWith('wm_prev_')) {
      const current = parseInt(id.replace('wm_prev_', ''));
      const components = await buildMainPanel(current - 1, client, guild);
      await interaction.update({ components, flags: 1 << 15 });
      return true;
    }

    // NEXT
    if (id.startsWith('wm_next_')) {
      const current = parseInt(id.replace('wm_next_', ''));
      const components = await buildMainPanel(current + 1, client, guild);
      await interaction.update({ components, flags: 1 << 15 });
      return true;
    }

    // STATS
    if (id === 'wm_stats') {
      const components = await buildStatsPanel(client, guild);
      await interaction.update({ components, flags: 1 << 15 });
      return true;
    }

    // SEARCH
    if (id === 'wm_search') {
      const modal = new ModalBuilder().setCustomId('wm_modal_search').setTitle('Search Warnings');
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('query').setLabel('Reason contains...').setStyle(TextInputStyle.Short).setRequired(true)
        )
      );
      await interaction.showModal(modal);
      return true;
    }

    // FILTER
    if (id === 'wm_filter') {
      const modal = new ModalBuilder().setCustomId('wm_modal_filter').setTitle('Filter by User');
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('user_id').setLabel('User ID').setStyle(TextInputStyle.Short).setRequired(true)
        )
      );
      await interaction.showModal(modal);
      return true;
    }

    // EXPORT
    if (id === 'wm_export') {
      const all = core.warnings.getAllWarnings();
      const json = JSON.stringify(all, null, 2);
      if (json.length > 1900) {
        await interaction.reply({ content: `${emojis.error} Too many warnings to export.`, ephemeral: true });
      } else {
        await interaction.reply({ content: `\`\`\`json\n${json}\n\`\`\``, ephemeral: true });
      }
      return true;
    }

    // REMOVE ALL FOR USER (from filter panel)
    if (id.startsWith('wm_remove_user_')) {
      const userId = id.replace('wm_remove_user_', '');
      const result = core.warnings.removeWarnings(userId, { all: true });
      await interaction.reply({ content: `${emojis.success} Removed **${result.removed.length}** warning(s).`, ephemeral: true });
      const components = await buildMainPanel(1, client, guild);
      await interaction.message.edit({ components, flags: 1 << 15 });
      return true;
    }

    // REMOVE
    if (id === 'wm_remove') {
      const modal = new ModalBuilder().setCustomId('wm_modal_remove').setTitle('Remove Warnings');
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('type').setLabel('Type: id, all, count, range').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('value').setLabel('Value (ID/count/range)').setStyle(TextInputStyle.Short).setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('user_id').setLabel('User ID (for all/count/range)').setStyle(TextInputStyle.Short).setRequired(false)
        )
      );
      await interaction.showModal(modal);
      return true;
    }

    return false;
  },

  // ===== MODAL HANDLER =====
  async handleModal(interaction, client) {
    const id = interaction.customId;
    if (!id.startsWith('wm_modal_')) return false;

    const guild = interaction.guild;
    const moderatorTag = interaction.user.tag;
    const moderatorId = interaction.user.id;

    // SEARCH
    if (id === 'wm_modal_search') {
      const query = interaction.fields.getTextInputValue('query');
      const components = await buildSearchPanel(query, client, guild);
      await interaction.reply({ components, flags: 1 << 15 | 1 << 6 });
      return true;
    }

    // FILTER
    if (id === 'wm_modal_filter') {
      const userId = interaction.fields.getTextInputValue('user_id');
      const components = await buildFilterPanel(userId, client, guild);
      await interaction.reply({ components, flags: 1 << 15 | 1 << 6 });
      return true;
    }

    // REMOVE
    if (id === 'wm_modal_remove') {
      const type = interaction.fields.getTextInputValue('type').toLowerCase();
      const value = interaction.fields.getTextInputValue('value');
      const userId = interaction.fields.getTextInputValue('user_id');

      let result;

      if (type === 'id') {
        const warningId = parseInt(value);
        if (isNaN(warningId)) return interaction.reply({ content: `${emojis.error} Invalid ID.`, ephemeral: true });
        const r = core.warnings.removeById(warningId);
        if (r.error) return interaction.reply({ content: `${emojis.error} ${r.error}`, ephemeral: true });
        result = { removed: [r.removed], removedIds: [`#${warningId}`] };
      } else {
        if (!userId) return interaction.reply({ content: `${emojis.error} User ID required.`, ephemeral: true });

        const options = {};
        if (type === 'all') options.all = true;
        else if (type === 'count') options.count = parseInt(value);
        else if (type === 'range') options.range = value;
        else return interaction.reply({ content: `${emojis.error} Type: id, all, count, range`, ephemeral: true });

        result = core.warnings.removeWarnings(userId, options);
        if (result.error) return interaction.reply({ content: `${emojis.error} ${result.error}`, ephemeral: true });
      }

      await interaction.reply({
        content: `${emojis.success} Removed **${result.removed.length}** warning(s): ${result.removedIds.join(', ')}`,
        ephemeral: true,
      });

      await sendLog(client, 'warn', {
        emoji: emojis.purge,
        title: 'Warnings Removed',
        subtitle: 'Warnings were removed',
        fields: [
          { name: '🛡️ Moderator', value: `${moderatorTag} (${moderatorId})` },
          { name: '🗑️ Removed', value: `${result.removed.length}` },
          { name: '🆔 IDs', value: result.removedIds.join(', ').slice(0, 1000) },
        ],
      });
      return true;
    }

    return false;
  },
};
