const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const { sendLog } = require('../../utils/logger');
const { checkPermission } = require('../../utils/permissions');

module.exports = {
  name: 'unmute',
  description: 'Unmute a user (remove timeout)',
  category: 'Moderation',
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute a user (remove timeout)')
    .addUserOption(option =>
      option.setName('user').setDescription('User to unmute').setRequired(true))
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for unmute').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(context, args) {
    if (!(await checkPermission(context, 'unmute'))) return;

    const isSlash = context.isChatInputCommand && context.isChatInputCommand();
    let member, reason, moderatorTag, moderatorId, client, guild;

    if (isSlash) {
      const user = context.options.getUser('user');
      member = await context.guild.members.fetch(user.id).catch(() => null);
      reason = context.options.getString('reason') || 'No reason provided';
      moderatorTag = context.user.tag;
      moderatorId = context.user.id;
      client = context.client;
      guild = context.guild;
    } else {
      // Delete user's command message (after 500ms)
      setTimeout(() => context.delete().catch(() => {}), 500);

      if (!context.member.permissions.has('ModerateMembers')) {
        const msg = await context.reply(`${emojis.error} You do not have permission!`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
        return;
      }
      member = context.mentions.members.first();
      if (!member) {
        const msg = await context.reply(`${emojis.error} Mention a user to unmute!`);
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

    if (!member.isCommunicationDisabled()) {
      const msg = await context.reply(`${emojis.error} This user is not muted.`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    const user = member.user;

    // DM to target before unmute
    try {
      const dmEmbed = new EmbedBuilder()
        .setColor(0x57F287)
        .setAuthor({
          name: `Unmuted in ${guild.name}`,
          iconURL: guild.iconURL({ dynamic: true, size: 128 }) || client.user.displayAvatarURL({ dynamic: true, size: 128 })
        })
        .setTitle(`${emojis.unmute} You Have Been Unmuted`)
        .setDescription(`You have been unmuted in **${guild.name}**.`)
        .addFields(
          { name: `${emojis.reason} Reason`, value: `\`\`\`${reason}\`\`\``, inline: false }
        )
        .setFooter({ text: 'Powered by Dynamite Music' })
        .setTimestamp();

      await user.send({ embeds: [dmEmbed] });
    } catch (err) {}

    // Unmute
    try {
      await member.timeout(null, reason);
    } catch (err) {
      const msg = await context.reply(`${emojis.error} Failed to unmute: ${err.message}`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    // Public embed
    const publicEmbed = new EmbedBuilder()
      .setColor(0x57F287)
      .setAuthor({
        name: 'Moderation Action',
        iconURL: client.user.displayAvatarURL({ dynamic: true, size: 128 })
      })
      .setTitle(`${emojis.unmute} User Unmuted`)
      .setDescription(
        `> **${user.tag}** has been unmuted.\n\n` +
        `**${emojis.reason} Reason:** ${reason}`
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setFooter({
        text: 'Powered by Dynamite Music',
        iconURL: client.user.displayAvatarURL({ dynamic: true, size: 64 })
      })
      .setTimestamp();

    if (isSlash) {
      await context.reply({ embeds: [publicEmbed] });
      setTimeout(() => context.deleteReply().catch(() => {}), 3000);
    } else {
      const sentMsg = await context.reply({ embeds: [publicEmbed] });
      setTimeout(() => sentMsg.delete().catch(() => {}), 3000);
    }

    // Log
    await sendLog(client, 'moderation', {
      emoji: emojis.unmute,
      title: 'User Unmuted',
      subtitle: 'A user was unmuted',
      fields: [
        { name: '👤 User', value: `${user.tag} (${user.id})` },
        { name: '🛡️ Moderator', value: `${moderatorTag} (${moderatorId})` },
        { name: '📝 Reason', value: reason },
      ],
    });
  },
};
