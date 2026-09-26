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
  StringSelectMenuBuilder,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const { sendLog } = require('../../utils/logger');
const { checkPermission } = require('../../utils/permissions');
const fs = require('fs');
const path = require('path');

const warningsPath = path.join(__dirname, '..', '..', 'data', 'warnings.json');

function loadWarnings() {
  if (!fs.existsSync(warningsPath)) return { nextId: 1, warnings: {} };
  try {
    const data = JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
    if (!data.warnings) data.warnings = {};
    if (!data.nextId) data.nextId = 1;
    return data;
  } catch {
    return { nextId: 1, warnings: {} };
  }
}

function saveWarnings(data) {
  const dir = path.dirname(warningsPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(warningsPath, JSON.stringify(data, null, 2));
}

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

// ===== BUILD MAIN PANEL =====
async function buildMainPanel(data, page, client, guild, filterUserId = null) {
  // Collect all warnings
  const allWarnings = [];
  for (const [userId, warnings] of Object.entries(data.warnings)) {
    for (const w of warnings) {
      if (filterUserId && userId !== filterUserId) continue;
      allWarnings.push({ ...w, userId });
    }
  }
  allWarnings.sort((a, b) => new Date(b.date) - new Date(a.date));

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
      listText += `└ ${emojis.shield || '🛡️'} by ${w.moderator} ${emojis.dot} <t:${Math.floor(new Date(w.date).getTime() / 1000)}:R>\n\n`;
    }
  }

  const container = new ContainerBuilder()
    .setAccentColor(0xFEE75C)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emojis.warnings || '📋'} Warning Manager\n` +
        (filterUserId ? `**Filtered by User**` : `**All Warnings in Server**`)
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
    new ButtonBuilder().setCustomId(`warn_prev_${currentPage}`).setLabel('Previous').setEmoji('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === 1),
    new ButtonBuilder().setCustomId(`warn_next_${currentPage}`).setLabel('Next').setEmoji('➡️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === totalPages),
    new ButtonBuilder().setCustomId('warn_remove').setLabel('Remove').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('warn_search').setLabel('Search').setEmoji('🔍').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('warn_stats').setLabel('Stats').setEmoji('📊').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('warn_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row1];
}

// ===== BUILD SEARCH PANEL =====
async function buildSearchPanel(data, searchType, searchValue, client, guild) {
  const allWarnings = [];
  for (const [userId, warnings] of Object.entries(data.warnings)) {
    for (const w of warnings) {
      allWarnings.push({ ...w, userId });
    }
  }

  let filtered = [];
  if (searchType === 'user') {
    filtered = allWarnings.filter(w => w.userId === searchValue);
  } else if (searchType === 'moderator') {
    filtered = allWarnings.filter(w => w.moderator === searchValue || w.moderatorId === searchValue);
  } else if (searchType === 'reason') {
    filtered = allWarnings.filter(w => w.reason.toLowerCase().includes(searchValue.toLowerCase()));
  }

  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  let listText = '';
  if (filtered.length === 0) {
    listText = '*No warnings found*';
  } else {
    for (const w of filtered.slice(0, 10)) {
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
        `# ${emojis.info} Search Results\n` +
        `**Type:** ${searchType}\n` +
        `**Query:** \`${searchValue}\``
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Found:** \`${filtered.length}\``))
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(listText.slice(0, 3500)))
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('warn_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('warn_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row];
}

// ===== BUILD STATS PANEL =====
async function buildStatsPanel(data, client, guild) {
  let total = 0, users = 0, mostWarned = null, mostCount = 0;
  const mods = {};
  const reasons = {};

  for (const [userId, warnings] of Object.entries(data.warnings)) {
    if (warnings.length > 0) {
      total += warnings.length;
      users++;
      if (warnings.length > mostCount) { mostCount = warnings.length; mostWarned = userId; }
      for (const w of warnings) {
        mods[w.moderator] = (mods[w.moderator] || 0) + 1;
        reasons[w.reason] = (reasons[w.reason] || 0) + 1;
      }
    }
  }

  const topMods = Object.entries(mods).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([m, c]) => `${emojis.arrow} ${m} — \`${c}\``).join('\n') || '*None*';

  const topReasons = Object.entries(reasons).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([r, c]) => `${emojis.arrow} ${r} — \`${c}\``).join('\n') || '*None*';

  let mostWarnedText = '*None*';
  if (mostWarned) {
    try { const u = await client.users.fetch(mostWarned); mostWarnedText = `${u.tag} — \`${mostCount}\``; }
    catch { mostWarnedText = `Unknown — \`${mostCount}\``; }
  }

  const container = new ContainerBuilder()
    .setAccentColor(0xEB459E)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${emojis.stats} Warning Stats`)
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${emojis.arrow} **Total:** \`${total}\`\n` +
        `${emojis.arrow} **Users Warned:** \`${users}\`\n` +
        `${emojis.arrow} **Most Warned:** ${mostWarnedText}`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**${emojis.mod} Top Moderators**\n${topMods}`)
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**${emojis.info} Top Reasons**\n${topReasons}`)
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('warn_back').setLabel('Back').setEmoji('⬅️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('warn_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row];
}

module.exports = {
  name: 'warning',
  description: 'Warning manager',
  category: 'Moderation',
  data: new SlashCommandBuilder()
    .setName('warning')
    .setDescription('Warning manager')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand(sub =>
      sub.setName('manage')
        .setDescription('Open warning manager'))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('View user warnings')
        .addUserOption(opt =>
          opt.setName('user').setDescription('User').setRequired(true))),

  async execute(context) {
    if (!context.isChatInputCommand || !context.isChatInputCommand()) {
      return context.reply('Use /warning (slash command).');
    }

    if (!(await checkPermission(context, 'warning'))) return;

    const sub = context.options.getSubcommand();
    const client = context.client;
    const guild = context.guild;
    const data = loadWarnings();

    if (sub === 'manage') {
      const components = await buildMainPanel(data, 1, client, guild);
      return context.reply({ components, flags: 1 << 15 | 1 << 6 });
    }

    if (sub === 'list') {
      const user = context.options.getUser('user');
      const warnings = data.warnings[user.id] || [];

      if (warnings.length === 0) {
        return context.reply(`${emojis.info} **${user.tag}** has no warnings.`);
      }

      const lines = warnings.map(w =>
        `**#${w.id}** — ${w.reason}\n└ by ${w.moderator} ${emojis.dot} <t:${Math.floor(new Date(w.date).getTime() / 1000)}:R>`
      );

      const text = `${emojis.warn} **${user.tag}** has **${warnings.length}** warning(s):\n\n${lines.join('\n\n')}`;

      if (text.length > 2000) {
        return context.reply({
          content: `${emojis.warning} Too many warnings. Use \`/warnlogs user @${user.username}\``,
          ephemeral: true,
        });
      }

      return context.reply(text);
    }
  },

  // ===== BUTTON HANDLER =====
  async handleButton(interaction, client) {
    const id = interaction.customId;
    if (!id.startsWith('warn_')) return false;

    const guild = interaction.guild;
    const data = loadWarnings();

    // CLOSE
    if (id === 'warn_close') {
      try { await interaction.message.delete(); } catch {}
      return true;
    }

    // BACK
    if (id === 'warn_back') {
      const components = await buildMainPanel(data, 1, client, guild);
      await interaction.update({ components, flags: 1 << 15 });
      return true;
    }

    // PREVIOUS
    if (id.startsWith('warn_prev_')) {
      const current = parseInt(id.replace('warn_prev_', ''));
      const components = await buildMainPanel(data, current - 1, client, guild);
      await interaction.update({ components, flags: 1 << 15 });
      return true;
    }

    // NEXT
    if (id.startsWith('warn_next_')) {
      const current = parseInt(id.replace('warn_next_', ''));
      const components = await buildMainPanel(data, current + 1, client, guild);
      await interaction.update({ components, flags: 1 << 15 });
      return true;
    }

    // STATS
    if (id === 'warn_stats') {
      const components = await buildStatsPanel(data, client, guild);
      await interaction.update({ components, flags: 1 << 15 });
      return true;
    }

    // SEARCH
    if (id === 'warn_search') {
      const modal = new ModalBuilder().setCustomId('warn_modal_search').setTitle('Search Warnings');
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder().setCustomId('search_type').setPlaceholder('Search by...').addOptions([
            { label: 'User', value: 'user' },
            { label: 'Moderator', value: 'moderator' },
            { label: 'Reason', value: 'reason' },
          ])
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('search_value').setLabel('Search value').setStyle(TextInputStyle.Short).setRequired(true)
        )
      );
      // Note: StringSelectMenu can't be in Modal. Use 2 separate modals instead.
      // For now, just ask for reason search
      const modal2 = new ModalBuilder().setCustomId('warn_modal_search').setTitle('Search Warnings');
      modal2.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('search_value').setLabel('Reason contains (leave empty for user)').setStyle(TextInputStyle.Short).setRequired(false)
        )
      );
      await interaction.showModal(modal2);
      return true;
    }

    // REMOVE
    if (id === 'warn_remove') {
      const modal = new ModalBuilder().setCustomId('warn_modal_remove').setTitle('Remove Warnings');
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('type').setLabel('Type: id, all, count, range').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('value').setLabel('Value (ID, count, or range)').setStyle(TextInputStyle.Short).setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('user_id').setLabel('User ID (required for count/range)').setStyle(TextInputStyle.Short).setRequired(false)
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
    if (!id.startsWith('warn_modal_')) return false;

    const guild = interaction.guild;
    const data = loadWarnings();
    const moderatorTag = interaction.user.tag;
    const moderatorId = interaction.user.id;

    // SEARCH MODAL
    if (id === 'warn_modal_search') {
      const value = interaction.fields.getTextInputValue('search_value') || '';
      const components = await buildSearchPanel(data, 'reason', value, client, guild);
      await interaction.reply({ components, flags: 1 << 15 | 1 << 6 });
      return true;
    }

    // REMOVE MODAL
    if (id === 'warn_modal_remove') {
      const type = interaction.fields.getTextInputValue('type').toLowerCase();
      const value = interaction.fields.getTextInputValue('value');
      const userId = interaction.fields.getTextInputValue('user_id');

      let removed = [];
      let removedIds = [];

      if (type === 'all') {
        if (!userId) return interaction.reply({ content: `${emojis.error} User ID required for "all".`, ephemeral: true });
        const warnings = data.warnings[userId] || [];
        if (warnings.length === 0) return interaction.reply({ content: `${emojis.error} No warnings found.`, ephemeral: true });
        removed = [...warnings];
        removedIds = warnings.map(w => `#${w.id}`);
        data.warnings[userId] = [];
      } else if (type === 'id') {
        const warningId = parseInt(value);
        if (isNaN(warningId)) return interaction.reply({ content: `${emojis.error} Invalid ID.`, ephemeral: true });
        for (const [uid, warnings] of Object.entries(data.warnings)) {
          const idx = warnings.findIndex(w => w.id === warningId);
          if (idx !== -1) {
            removed = [warnings[idx]];
            removedIds = [`#${warningId}`];
            warnings.splice(idx, 1);
            break;
          }
        }
        if (removed.length === 0) return interaction.reply({ content: `${emojis.error} Warning #${value} not found.`, ephemeral: true });
      } else if (type === 'count') {
        if (!userId) return interaction.reply({ content: `${emojis.error} User ID required for "count".`, ephemeral: true });
        const count = parseInt(value);
        const warnings = data.warnings[userId] || [];
        if (warnings.length === 0) return interaction.reply({ content: `${emojis.error} No warnings.`, ephemeral: true });
        const toRemove = warnings.slice(-count);
        removed = toRemove;
        removedIds = toRemove.map(w => `#${w.id}`);
        data.warnings[userId] = warnings.filter(w => !toRemove.includes(w));
      } else if (type === 'range') {
        if (!userId) return interaction.reply({ content: `${emojis.error} User ID required for "range".`, ephemeral: true });
        const match = value.match(/^(\d+)-(\d+)$/);
        if (!match) return interaction.reply({ content: `${emojis.error} Range format: 1-5`, ephemeral: true });
        const start = parseInt(match[1]);
        const end = parseInt(match[2]);
        const warnings = data.warnings[userId] || [];
        const toRemove = warnings.slice(start - 1, end);
        removed = toRemove;
        removedIds = toRemove.map(w => `#${w.id}`);
        data.warnings[userId] = warnings.filter(w => !toRemove.includes(w));
      } else {
        return interaction.reply({ content: `${emojis.error} Type: id, all, count, range`, ephemeral: true });
      }

      saveWarnings(data);

      await interaction.reply({
        content: `${emojis.success} Removed **${removed.length}** warning(s): ${removedIds.join(', ')}`,
        ephemeral: true
      });

      await sendLog(client, 'warn', {
        emoji: emojis.purge,
        title: 'Warnings Removed',
        subtitle: 'Warnings were removed',
        fields: [
          { name: '🛡️ Moderator', value: `${moderatorTag} (${moderatorId})` },
          { name: '🗑️ Removed', value: `${removed.length}` },
          { name: '🆔 IDs', value: removedIds.join(', ').slice(0, 1000) },
        ],
      });
      return true;
    }

    return false;
  },
};
