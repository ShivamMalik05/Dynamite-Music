const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const { sendLog } = require('../../utils/logger');
const { checkPermission } = require('../../utils/permissions');

module.exports = {
  name: 'kick',
  description: 'Kick a user',
  category: 'Moderation',
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user')
    .addUserOption(option =>
      option.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for kick').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(context, args) {
    if (!(await checkPermission(context, 'kick'))) return;

    const isSlash = context.isChatInputCommand && context.isChatInputCommand();
    let member, reason, moderatorTag, moderatorId, client, guild;

    if (isSlash) {
      const user = context.options.getUser('user');
      reason = context.options.getString('reason') || 'No reason provided';
      member = await context.guild.members.fetch(user.id).catch(() => null);
      moderatorTag = context.user.tag;
      moderatorId = context.user.id;
      client = context.client;
      guild = context.guild;
    } else {
      if (!context.member.permissions.has('KickMembers')) {
        const msg = await context.reply(`${emojis.error} You do not have permission!`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
        return;
      }
      member = context.mentions.members.first();
      if (!member) {
        const msg = await context.reply(`${emojis.error} Mention a user to kick!`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
        return;
      }
      reason = args.slice(1).join(' ') || 'No reason provided';
      moderatorTag = context.author.tag;
      moderatorId = context.author.id;
      client = context.client;
      guild = context.guild;
    }

    if (!member) {
      const msg = await context.reply(`${emojis.error} User not found in this server.`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    if (!member.kickable) {
      const msg = await context.reply(`${emojis.error} Cannot kick this user!`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    if (member.id === moderatorId) {
      const msg = await context.reply(`${emojis.error} You cannot kick yourself!`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    const user = member.user;

    // DM to target before kick
    try {
      const dmEmbed = new EmbedBuilder()
        .setColor(0xE67E22)
        .setAuthor({
          name: `Kicked from ${guild.name}`,
          iconURL: guild.iconURL({ dynamic: true, size: 128 }) || client.user.displayAvatarURL({ dynamic: true, size: 128 })
        })
        .setTitle(`${emojis.kick} You Have Been Kicked`)
        .setDescription(`You have been kicked from **${guild.name}**.`)
        .addFields(
          { name: '📝 Reason', value: `\`\`\`${reason}\`\`\``, inline: false }
        )
        .setFooter({ text: 'Powered by Dynamite Music' })
        .setTimestamp();

      await user.send({ embeds: [dmEmbed] });
    } catch (err) {}

    // Kick
    try {
      await member.kick(reason);
    } catch (err) {
      const msg = await context.reply(`${emojis.error} Failed to kick: ${err.message}`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    // Public embed
    const publicEmbed = new EmbedBuilder()
      .setColor(0xE67E22)
      .setAuthor({
        name: 'Moderation Action',
        iconURL: client.user.displayAvatarURL({ dynamic: true, size: 128 })
      })
      .setTitle(`${emojis.kick} User Kicked`)
      .setDescription(
        `> **${user.tag}** has been kicked.\n\n` +
        `**Reason:** ${reason}`
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setFooter({
        text: 'Powered by Dynamite Music',
        iconURL: client.user.displayAvatarURL({ dynamic: true, size: 64 })
      })
      .setTimestamp();

    let sentMsg;
    if (isSlash) {
      sentMsg = await context.reply({ embeds: [publicEmbed] });
      setTimeout(() => context.deleteReply().catch(() => {}), 3000);
    } else {
      sentMsg = await context.reply({ embeds: [publicEmbed] });
      setTimeout(() => sentMsg.delete().catch(() => {}), 3000);
    }

    // Log
    await sendLog(client, 'moderation', {
      emoji: emojis.kick,
      title: 'User Kicked',
      subtitle: 'A user was kicked',
      fields: [
        { name: '👤 User', value: `${user.tag} (${user.id})` },
        { name: '🛡️ Moderator', value: `${moderatorTag} (${moderatorId})` },
        { name: '📝 Reason', value: reason },
      ],
    });
  },
};
