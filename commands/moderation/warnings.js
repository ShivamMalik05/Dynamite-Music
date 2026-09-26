const {
  SlashCommandBuilder,
  PermissionFlagsBits,
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

module.exports = {
  name: 'warning',
  description: 'View or manage user warnings',
  category: 'Moderation',
  data: new SlashCommandBuilder()
    .setName('warning')
    .setDescription('View or manage user warnings')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('View a user\'s warnings')
        .addUserOption(opt =>
          opt.setName('user').setDescription('User').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove warnings')
        .addUserOption(opt =>
          opt.setName('user').setDescription('User').setRequired(true))
        .addIntegerOption(opt =>
          opt.setName('id').setDescription('Specific warning ID').setRequired(false))
        .addBooleanOption(opt =>
          opt.setName('all').setDescription('Remove all warnings').setRequired(false))
        .addIntegerOption(opt =>
          opt.setName('count').setDescription('Remove last N warnings').setRequired(false))
        .addStringOption(opt =>
          opt.setName('range').setDescription('Remove by range (e.g. 1-5)').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('history')
        .setDescription('View warning history')
        .addUserOption(opt =>
          opt.setName('user').setDescription('User').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('stats')
        .setDescription('View server warning stats')),

  async execute(context) {
    if (!context.isChatInputCommand || !context.isChatInputCommand()) {
      return context.reply('Use /warning (slash command).');
    }

    if (!(await checkPermission(context, 'warning'))) return;

    const sub = context.options.getSubcommand();
    const guild = context.guild;
    const client = context.client;
    const moderatorTag = context.user.tag;
    const moderatorId = context.user.id;
    const data = loadWarnings();

    // ===== LIST =====
    if (sub === 'list') {
      const user = context.options.getUser('user');
      const warnings = data.warnings[user.id] || [];

      if (warnings.length === 0) {
        return context.reply(`${emojis.info} **${user.tag}** has no warnings.`);
      }

      const lines = warnings.map(w => 
        `**#${w.id}** — ${w.reason}\n└ by ${w.moderator} • <t:${Math.floor(new Date(w.date).getTime() / 1000)}:R>`
      );

      const text = `${emojis.warn} **${user.tag}** has **${warnings.length}** warning(s):\n\n${lines.join('\n\n')}`;

      if (text.length > 2000) {
        return context.reply({
          content: `${emojis.warning} Too many warnings to display. Use \`/warnlogs user @${user.username}\` for full list.`,
          ephemeral: true,
        });
      }

      return context.reply(text);
    }

    // ===== REMOVE =====
    if (sub === 'remove') {
      const user = context.options.getUser('user');
      const id = context.options.getInteger('id');
      const all = context.options.getBoolean('all');
      const count = context.options.getInteger('count');
      const range = context.options.getString('range');

      const warnings = data.warnings[user.id] || [];
      if (warnings.length === 0) {
        return context.reply({ content: `${emojis.error} **${user.tag}** has no warnings.`, ephemeral: true });
      }

      let removed = [];
      let removedIds = [];

      if (all === true) {
        removed = [...warnings];
        removedIds = warnings.map(w => `#${w.id}`);
        data.warnings[user.id] = [];
      } else if (id !== null && id !== undefined) {
        const idx = warnings.findIndex(w => w.id === id);
        if (idx === -1) {
          return context.reply({ content: `${emojis.error} Warning #${id} not found.`, ephemeral: true });
        }
        removed = [warnings[idx]];
        removedIds = [`#${id}`];
        warnings.splice(idx, 1);
        data.warnings[user.id] = warnings;
      } else if (count !== null && count !== undefined && count > 0) {
        if (count > warnings.length) {
          return context.reply({ content: `${emojis.error} Only ${warnings.length} warnings exist.`, ephemeral: true });
        }
        removed = warnings.slice(-count);
        removedIds = removed.map(w => `#${w.id}`);
        warnings.splice(-count, count);
        data.warnings[user.id] = warnings;
      } else if (range) {
        const match = range.match(/^(\d+)-(\d+)$/);
        if (!match) {
          return context.reply({ content: `${emojis.error} Invalid range. Use format: 1-5`, ephemeral: true });
        }
        const start = parseInt(match[1]);
        const end = parseInt(match[2]);
        if (start < 1 || end < start) {
          return context.reply({ content: `${emojis.error} Invalid range.`, ephemeral: true });
        }
        const toRemove = warnings.slice(start - 1, end);
        if (toRemove.length === 0) {
          return context.reply({ content: `${emojis.error} No warnings in that range.`, ephemeral: true });
        }
        removed = toRemove;
        removedIds = toRemove.map(w => `#${w.id}`);
        data.warnings[user.id] = warnings.filter(w => !toRemove.includes(w));
      } else {
        return context.reply({
          content: `${emojis.error} Provide one of: \`id\`, \`all\`, \`count\`, or \`range\`.`,
          ephemeral: true,
        });
      }

      saveWarnings(data);

      const replyText = removedIds.length === 1
        ? `${emojis.success} Removed warning **${removedIds[0]}** from **${user.tag}**.`
        : `${emojis.success} Removed **${removed.length}** warnings (${removedIds.join(', ')}) from **${user.tag}**.`;

      await context.reply({ content: replyText, ephemeral: true });

      // Log
      await sendLog(client, 'moderation', {
        emoji: emojis.purge,
        title: 'Warnings Removed',
        subtitle: 'Warnings were removed from a user',
        fields: [
          { name: '👤 User', value: `${user.tag} (${user.id})` },
          { name: '🛡️ Moderator', value: `${moderatorTag} (${moderatorId})` },
          { name: '🗑️ Removed', value: `${removed.length}` },
          { name: '🆔 IDs', value: removedIds.join(', ').slice(0, 1000) },
        ],
      });

      return;
    }

    // ===== HISTORY =====
    if (sub === 'history') {
      const user = context.options.getUser('user');
      const warnings = data.warnings[user.id] || [];

      if (warnings.length === 0) {
        return context.reply(`${emojis.info} **${user.tag}** has no warning history.`);
      }

      const lines = warnings.map(w => 
        `**#${w.id}** — ${w.reason}\n└ by ${w.moderator} • <t:${Math.floor(new Date(w.date).getTime() / 1000)}:R>`
      );

      const text = `${emojis.history} **${user.tag}** — Warning History\n\n${lines.join('\n\n')}`;

      if (text.length > 2000) {
        return context.reply({
          content: `${emojis.warning} Too many entries. Use \`/warnlogs user @${user.username}\`.`,
          ephemeral: true,
        });
      }

      return context.reply(text);
    }

    // ===== STATS =====
    if (sub === 'stats') {
      let totalWarnings = 0;
      let usersWithWarnings = 0;
      let mostWarned = null;
      let mostWarnedCount = 0;
      const moderatorCounts = {};

      for (const [userId, warnings] of Object.entries(data.warnings)) {
        if (warnings.length > 0) {
          totalWarnings += warnings.length;
          usersWithWarnings++;

          if (warnings.length > mostWarnedCount) {
            mostWarnedCount = warnings.length;
            mostWarned = userId;
          }

          for (const w of warnings) {
            moderatorCounts[w.moderator] = (moderatorCounts[w.moderator] || 0) + 1;
          }
        }
      }

      const topMods = Object.entries(moderatorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([mod, count]) => `• ${mod} — \`${count}\``)
        .join('\n') || '*None*';

      let mostWarnedText = '*None*';
      if (mostWarned) {
        try {
          const u = await client.users.fetch(mostWarned);
          mostWarnedText = `${u.tag} — \`${mostWarnedCount}\``;
        } catch {
          mostWarnedText = `Unknown — \`${mostWarnedCount}\``;
        }
      }

      return context.reply(
        `${emojis.stats} **Warning Stats**\n\n` +
        `${emojis.arrowRight} **Total Warnings:** \`${totalWarnings}\`\n` +
        `${emojis.arrowRight} **Users Warned:** \`${usersWithWarnings}\`\n` +
        `${emojis.arrowRight} **Most Warned:** ${mostWarnedText}\n\n` +
        `**Top Moderators:**\n${topMods}`
      );
    }
  },
};
