const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const { sendLog } = require('../../utils/logger');
const { checkPermission } = require('../../utils/permissions');
const fs = require('fs');
const path = require('path');

const warningsPath = path.join(__dirname, '..', '..', 'data', 'warnings.json');
const configPath = path.join(__dirname, '..', '..', 'config', 'warnings.js');

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

function loadConfig() {
  try {
    delete require.cache[require.resolve(configPath)];
    return require(configPath);
  } catch {
    return { autoAction: { enabled: false }, notifyOnWarn: true };
  }
}

module.exports = {
  name: 'warn',
  description: 'Warn a user',
  category: 'Moderation',
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(context, args) {
    if (!(await checkPermission(context, 'warn'))) return;

    let targetUser, targetId, moderatorTag, moderatorId, reason, client, guild;

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      targetUser = context.options.getUser('user');
      targetId = targetUser.id;
      moderatorTag = context.user.tag;
      moderatorId = context.user.id;
      reason = context.options.getString('reason') || 'No reason provided';
      client = context.client;
      guild = context.guild;
    } else {
      if (!context.member.permissions.has('ModerateMembers')) {
        return context.reply(`${emojis.error} You do not have permission!`);
      }
      const member = context.mentions.members.first();
      if (!member) return context.reply(`${emojis.error} Mention a user to warn!`);
      if (member.id === context.author.id) return context.reply(`${emojis.error} You cannot warn yourself!`);
      targetUser = member.user;
      targetId = member.id;
      moderatorTag = context.author.tag;
      moderatorId = context.author.id;
      reason = args.slice(1).join(' ') || 'No reason provided';
      client = context.client;
      guild = context.guild;
    }

    // Load warnings data
    const data = loadWarnings();
    const warningId = data.nextId;
    data.nextId += 1;

    if (!data.warnings[targetId]) data.warnings[targetId] = [];

    const warning = {
      id: warningId,
      reason,
      moderator: moderatorTag,
      moderatorId,
      date: new Date().toISOString(),
    };

    data.warnings[targetId].push(warning);
    saveWarnings(data);

    const totalWarnings = data.warnings[targetId].length;
    const cfg = loadConfig();

    // ===== PUBLIC REPLY EMBED (CHHOTA) =====
    const publicEmbed = new EmbedBuilder()
      .setColor(0xFEE75C)
      .setAuthor({
        name: 'Moderation Action',
        iconURL: client.user.displayAvatarURL({ dynamic: true, size: 128 })
      })
      .setTitle(`${emojis.warn} Warning Issued`)
      .setDescription(
        `> ${targetUser} has been warned.\n\n` +
        `**Reason:** ${reason}\n` +
        `**Total Warnings:** \`${totalWarnings}\``
      )
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
      .setFooter({
        text: `Warning ID: #${warningId} • Powered by Dynamite Music`,
        iconURL: client.user.displayAvatarURL({ dynamic: true, size: 64 })
      })
      .setTimestamp();

    const replyPayload = {
      content: `${targetUser}`,
      embeds: [publicEmbed]
    };

    if (context.isChatInputCommand && context.isChatInputCommand()) {
      await context.reply(replyPayload);
    } else {
      context.reply(replyPayload);
    }

    // ===== DM TO TARGET (MODERATOR HIDDEN) =====
    if (cfg.notifyOnWarn !== false) {
      const dmEmbed = new EmbedBuilder()
        .setColor(0xFEE75C)
        .setAuthor({
          name: `Warning from ${guild.name}`,
          iconURL: guild.iconURL({ dynamic: true, size: 128 }) || client.user.displayAvatarURL({ dynamic: true, size: 128 })
        })
        .setTitle(`${emojis.warn} You Have Been Warned`)
        .setDescription(
          `You have received a warning in **${guild.name}**.\n\n` +
          `Please review the server rules.`
        )
        .addFields(
          { name: '📝 Reason', value: `\`\`\`${reason}\`\`\``, inline: false },
          { name: '📊 Total Warnings', value: `\`${totalWarnings}\``, inline: true },
          { name: '🆔 Warning ID', value: `\`#${warningId}\``, inline: true }
        )
        .setFooter({ text: 'Powered by Dynamite Music' })
        .setTimestamp();

      try {
        await targetUser.send({ embeds: [dmEmbed] });
      } catch (err) {}
    }

    // ===== LOG (FULL DETAILS WITH MODERATOR) =====
    await sendLog(client, 'moderation', {
      emoji: emojis.warn,
      title: 'User Warned',
      subtitle: 'A user was warned',
      fields: [
        { name: '👤 User', value: `${targetUser.tag} (${targetId})` },
        { name: '🛡️ Moderator', value: `${moderatorTag} (${moderatorId})` },
        { name: '📝 Reason', value: reason },
        { name: '🆔 Warning ID', value: `#${warningId}` },
        { name: '📊 Total Warnings', value: `${totalWarnings}` },
      ],
    });

    // ===== AUTO ACTION =====
    if (cfg.autoAction?.enabled) {
      const member = await guild.members.fetch(targetId).catch(() => null);
      if (member) {
        try {
          if (cfg.autoAction.banAt && totalWarnings >= cfg.autoAction.banAt) {
            await member.ban({ reason: `Auto-ban: ${totalWarnings} warnings` });
            await sendLog(client, 'moderation', {
              emoji: '🔨',
              title: 'Auto-Ban Triggered',
              subtitle: 'User reached warning threshold',
              fields: [
                { name: 'User', value: `${targetUser.tag} (${targetId})` },
                { name: 'Warnings', value: `${totalWarnings}` },
              ],
            });
          } else if (cfg.autoAction.kickAt && totalWarnings >= cfg.autoAction.kickAt) {
            await member.kick(`Auto-kick: ${totalWarnings} warnings`);
            await sendLog(client, 'moderation', {
              emoji: '👢',
              title: 'Auto-Kick Triggered',
              subtitle: 'User reached warning threshold',
              fields: [
                { name: 'User', value: `${targetUser.tag} (${targetId})` },
                { name: 'Warnings', value: `${totalWarnings}` },
              ],
            });
          } else if (cfg.autoAction.muteAt && totalWarnings >= cfg.autoAction.muteAt) {
            const duration = (cfg.autoAction.muteDuration || 60) * 60 * 1000;
            await member.timeout(duration, `Auto-mute: ${totalWarnings} warnings`);
            await sendLog(client, 'moderation', {
              emoji: '🔇',
              title: 'Auto-Mute Triggered',
              subtitle: 'User reached warning threshold',
              fields: [
                { name: 'User', value: `${targetUser.tag} (${targetId})` },
                { name: 'Warnings', value: `${totalWarnings}` },
                { name: 'Duration', value: `${cfg.autoAction.muteDuration || 60} minutes` },
              ],
            });
          }
        } catch (err) {
          console.error('Auto-action error:', err.message);
        }
      }
    }
  },
};
