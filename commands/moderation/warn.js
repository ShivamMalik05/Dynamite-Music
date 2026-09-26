const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const { sendLog } = require('../../utils/logger');
const core = require('../../core');

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
      option.setName('reason').setDescription('Reason for warning').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(context, args) {
    // Permission check
    if (!(await core.permissions.checkPermission(context, 'warn'))) return;

    const isSlash = context.isChatInputCommand && context.isChatInputCommand();
    let targetUser, targetId, moderatorTag, moderatorId, reason, client, guild;

    // Parse input
    if (isSlash) {
      targetUser = context.options.getUser('user');
      targetId = targetUser.id;
      moderatorTag = context.user.tag;
      moderatorId = context.user.id;
      reason = context.options.getString('reason') || 'No reason provided';
      client = context.client;
      guild = context.guild;
    } else {
      setTimeout(() => context.delete().catch(() => {}), 5000);

      if (!context.member.permissions.has('ModerateMembers')) {
        const msg = await context.reply(`${emojis.error} You do not have permission!`);
        setTimeout(() => msg.delete().catch(() => {}), 5000);
        return;
      }
      const member = context.mentions.members.first();
      if (!member) {
        const msg = await context.reply(`${emojis.error} Mention a user to warn!`);
        setTimeout(() => msg.delete().catch(() => {}), 5000);
        return;
      }
      if (member.id === context.author.id) {
        const msg = await context.reply(`${emojis.error} You cannot warn yourself!`);
        setTimeout(() => msg.delete().catch(() => {}), 5000);
        return;
      }
      targetUser = member.user;
      targetId = member.id;
      moderatorTag = context.author.tag;
      moderatorId = context.author.id;
      reason = args.slice(1).join(' ') || 'No reason provided';
      client = context.client;
      guild = context.guild;
    }

    // ===== ADD WARNING (using core) =====
    const result = core.warnings.addWarning(targetId, reason, moderatorTag, moderatorId);
    const warningId = result.id;
    const totalWarnings = result.total;

    // ===== LOAD CONFIG =====
    const cfg = core.config.loadWarnings();

    // ===== BUILD EMBED (using core) =====
    const embed = core.embeds.warnEmbed({
      targetUser,
      reason,
      totalWarnings,
      warningId,
      client,
    });

    // ===== DM TO TARGET =====
    try {
      const dmEmbed = core.embeds.warnDMEmbed({
        guild,
        reason,
        totalWarnings,
        warningId,
        customMessage: cfg.customDM?.warn,
        client,
      });
      await targetUser.send({ embeds: [dmEmbed] });
    } catch (err) {}

    // ===== REPLY =====
    if (cfg.silentMode) {
      // Silent mode — ephemeral (slash only)
      if (isSlash) {
        await context.reply({ embeds: [embed], ephemeral: true });
      } else {
        // Prefix — DM moderator
        try {
          await context.author.send({
            content: `${emojis.info} Silent warning issued to **${targetUser.tag}**`,
            embeds: [embed],
          });
        } catch {}
      }
    } else {
      // Normal mode
      if (isSlash) {
        await context.reply({ content: `${targetUser}`, embeds: [embed] });
        setTimeout(() => context.deleteReply().catch(() => {}), 5000);
      } else {
        const sentMsg = await context.reply({ content: `${targetUser}`, embeds: [embed] });
        setTimeout(() => sentMsg.delete().catch(() => {}), 5000);
      }
    }

    // ===== LOG =====
    await sendLog(client, 'warn', {
      emoji: emojis.warn,
      title: 'User Warned',
      subtitle: 'A user was warned',
      fields: [
        { name: '👤 User', value: `${targetUser.tag} (${targetId})` },
        { name: '🛡️ Moderator', value: `${moderatorTag} (${moderatorId})` },
        { name: '📝 Reason', value: reason },
        { name: '🆔 ID', value: `#${warningId}` },
        { name: '📊 Total', value: `${totalWarnings}` },
      ],
    });

// ===== AUTO-ACTION =====
try {
  console.log(`[warn] Checking auto-action for ${totalWarnings} warnings...`);

  const rule = core.autoAction.getTriggeredRule(totalWarnings);
  if (!rule) {
    console.log('[warn] No rule triggered');
    return;
  }

  const member = await guild.members.fetch(targetId).catch(() => null);
  if (!member) {
    console.log('[warn] Member not found');
    return;
  }

  const actionResult = await core.autoAction.applyAction(member, rule, totalWarnings);

  if (!actionResult.success) {
    console.log('[warn] Auto-action failed:', actionResult.error);
    return;
  }

  // Log auto-action
  await sendLog(client, 'autoaction', {
    emoji: actionResult.action === 'ban' ? emojis.ban : actionResult.action === 'kick' ? emojis.kick : emojis.mute,
    title: `Auto-${actionResult.action.charAt(0).toUpperCase() + actionResult.action.slice(1)} Triggered`,
    subtitle: `User reached ${totalWarnings} warnings`,
    fields: [
      { name: '👤 User', value: `${targetUser.tag} (${targetId})` },
      { name: '📊 Warnings', value: `${totalWarnings}` },
      { name: '🎯 Action', value: actionResult.action },
      ...(actionResult.duration ? [{ name: '⏱️ Duration', value: `${actionResult.duration} minutes` }] : []),
    ],
  });
  console.log('[warn] ✅ Auto-action logged');
} catch (err) {
  console.error('[warn] Auto-action error:', err.message);
  console.error(err.stack);
}
