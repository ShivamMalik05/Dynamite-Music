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
    return { rules: [] };
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
      option.setName('reason').setDescription('Reason for warning').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(context, args) {
    if (!(await checkPermission(context, 'warn'))) return;

    const isSlash = context.isChatInputCommand && context.isChatInputCommand();
    let targetUser, targetId, moderatorTag, moderatorId, reason, client, guild;

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

    const data = loadWarnings();
    const warningId = data.nextId;
    data.nextId += 1;

    if (!data.warnings[targetId]) data.warnings[targetId] = [];

    data.warnings[targetId].push({
      id: warningId,
      reason,
      moderator: moderatorTag,
      moderatorId,
      date: new Date().toISOString(),
    });
    saveWarnings(data);

    const totalWarnings = data.warnings[targetId].length;
    const cfg = loadConfig();

    // ===== DM =====
    if (!cfg.silentMode) {
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor(0xFEE75C)
          .setAuthor({
            name: `Warning from ${guild.name}`,
            iconURL: guild.iconURL({ dynamic: true, size: 128 }) || client.user.displayAvatarURL({ dynamic: true, size: 128 })
          })
          .setTitle(`${emojis.warn} You Have Been Warned`)
          .setDescription(
            (cfg.customDM?.warn || 'You have received a warning in {guild}. Reason: {reason}')
              .replace('{guild}', guild.name)
              .replace('{reason}', reason)
          )
          .addFields(
            { name: `${emojis.warnings} Total`, value: `\`${totalWarnings}\``, inline: true },
            { name: `${emojis.info} ID`, value: `\`#${warningId}\``, inline: true }
          )
          .setFooter({ text: 'Powered by Dynamite Music' })
          .setTimestamp();

        await targetUser.send({ embeds: [dmEmbed] });
      } catch (err) {}
    }

    // ===== PUBLIC EMBED =====
    if (!cfg.silentMode) {
      const publicEmbed = new EmbedBuilder()
        .setColor(0xFEE75C)
        .setAuthor({
          name: 'Moderation Action',
          iconURL: client.user.displayAvatarURL({ dynamic: true, size: 128 })
        })
        .setTitle(`${emojis.warn} Warning Issued`)
        .setDescription(
          `> ${targetUser} has been warned.\n\n` +
          `**${emojis.reason} Reason:** ${reason}\n` +
          `**${emojis.warnings} Total:** \`${totalWarnings}\``
        )
        .setTh
