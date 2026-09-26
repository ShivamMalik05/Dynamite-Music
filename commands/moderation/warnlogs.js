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
const { checkPermission } = require('../../utils/permissions');
const fs = require('fs');
const path = require('path');

const warningsPath = path.join(__dirname, '..', '..', 'data', 'warnings.json');

function loadWarnings() {
  if (!fs.existsSync(warningsPath)) return { nextId: 1, warnings: {} };
  try {
    const data = JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
    if (!data.warnings) data.warnings = {};
    return data;
  } catch {
    return { nextId: 1, warnings: {} };
  }
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

async function buildWarnLogsPanel(entries, title, subtitle, page, client) {
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(entries.length / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * perPage;
  const pageEntries = entries.slice(start, start + perPage);

  let listText = '';
  if (pageEntries.length === 0) {
    listText = '*No warnings found*';
  } else {
    for (const e of pageEntries) {
      listText += `**#${e.id}** • ${e.userTag}\n`;
      listText += `└ Reason: ${e.reason}\n`;
      listText += `└ Moderator: ${e.moderator}\n`;
      listText += `└ <t:${Math.floor(new Date(e.date).getTime() / 1000)}:R>\n\n`;
    }
  }

  const container = new ContainerBuilder()
    .setAccentColor(0xFEE75C)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${title}\n**${subtitle}**`)
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Total Entries:** ${entries.length}\n` +
        `**Page:** ${currentPage} / ${totalPages}`
      )
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(listText.slice(0, 3500))
    )
    .addSeparatorComponents(makeSep())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`*Powered by Dynamite Music*`)
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`warnlogs_prev_${currentPage}`).setLabel('Previous').setEmoji('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === 1),
    new ButtonBuilder().setCustomId(`warnlogs_next_${currentPage}`).setLabel('Next').setEmoji('➡️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === totalPages),
    new ButtonBuilder().setCustomId('warnlogs_refresh').setLabel('Refresh').setEmoji('🔄').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('warnlogs_close').setLabel('Close').setEmoji('❌').setStyle(ButtonStyle.Danger)
  );

  return [container, row];
}

module.exports = {
  name: 'warnlogs',
  description: 'View warning logs (V2 panel with pagination)',
  category: 'Moderation',
  data: new SlashCommandBuilder()
    .setName('warnlogs')
    .setDescription('View warning logs')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand(sub =>
      sub.setName('user')
        .setDescription('View a user\'s warnings')
        .addUserOption(opt =>
          opt.setName('user').setDescription('User').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('recent')
        .setDescription('View recent warnings'))
    .addSubcommand(sub =>
      sub.setName('moderator')
        .setDescription('View warnings given by a moderator')
        .addUserOption(opt =>
          opt.setName('moderator').setDescription('Moderator').setRequired(true))),

  async execute(context) {
    if (!context.isChatInputCommand || !context.isChatInputCommand()) {
      return context.reply('Use /warnlogs (slash command).');
    }

    if (!(await checkPermission(context, 'warnlogs'))) return;

    const sub = context.options.getSubcommand();
    const client = context.client;
    const guild = context.guild;
    const data = loadWarnings();

    let entries = [];
    let title = '';
    let subtitle = '';

    // ===== USER =====
    if (sub === 'user') {
      const user = context.options.getUser('user');
      const warnings = data.warnings[user.id] || [];

      entries = warnings.map(w => ({
        id: w.id,
        userTag: user.tag,
        reason: w.reason,
        moderator: w.moderator,
        date: w.date,
      }));

      title = `${emojis.warn} Warning Logs — ${user.tag}`;
      subtitle = `${entries.length} warning(s) found`;
    }

    // ===== RECENT =====
    if (sub === 'recent') {
      const allWarnings = [];
      for (const [userId, warnings] of Object.entries(data.warnings)) {
        for (const w of warnings) {
          allWarnings.push({ ...w, userId });
        }
      }
      allWarnings.sort((a, b) => new Date(b.date) - new Date(a.date));

      for (const w of allWarnings.slice(0, 100)) {
        let userTag = 'Unknown';
        try {
          const u = await client.users.fetch(w.userId);
          userTag = u.tag;
        } catch {}
        entries.push({
          id: w.id,
          userTag,
          reason: w.reason,
          moderator: w.moderator,
          date: w.date,
        });
      }

      title = `${emojis.history} Recent Warnings`;
      subtitle = `Last ${entries.length} warnings`;
    }

    // ===== MODERATOR =====
    if (sub === 'moderator') {
      const mod = context.options.getUser('moderator');
      const allWarnings = [];
      for (const [userId, warnings] of Object.entries(data.warnings)) {
        for (const w of warnings) {
          if (w.moderatorId === mod.id) {
            allWarnings.push({ ...w, userId });
          }
        }
      }
      allWarnings.sort((a, b) => new Date(b.date) - new Date(a.date));

      for (const w of allWarnings) {
        let userTag = 'Unknown';
        try {
          const u = await client.users.fetch(w.userId);
          userTag = u.tag;
        } catch {}
        entries.push({
          id: w.id,
          userTag,
          reason: w.reason,
          moderator: w.moderator,
          date: w.date,
        });
      }

      title = `${emojis.shield} Warnings by ${mod.tag}`;
      subtitle = `${entries.length} warning(s) given`;
    }

    const components = await buildWarnLogsPanel(entries, title, subtitle, 1, client);

    await context.reply({
      components,
      flags: 1 << 15 | 1 << 6,
    });
  },

  async handleButton(interaction, client) {
    const id = interaction.customId;
    if (!id.startsWith('warnlogs_')) return false;

    if (id === 'warnlogs_close') {
      await interaction.update({ components: [] });
      return true;
    }

    // For simplicity, just refresh on any button
    // (Pagination needs stored state, using simple refresh)
    await interaction.reply({
      content: 'Use /warnlogs to view again with different page.',
      ephemeral: true,
    });
    return true;
  },
};
