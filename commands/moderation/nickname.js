const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const { sendLog } = require('../../utils/logger');
const { checkPermission } = require('../../utils/permissions');

module.exports = {
  name: 'nickname',
  description: 'Change a user nickname',
  category: 'Moderation',
  data: new SlashCommandBuilder()
    .setName('nickname')
    .setDescription('Change a user nickname')
    .addUserOption(option =>
      option.setName('user').setDescription('User').setRequired(true))
    .addStringOption(option =>
      option.setName('nickname').setDescription('New nickname (or "reset" to remove)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

  async execute(context, args) {
    if (!(await checkPermission(context, 'nickname'))) return;

    const isSlash = context.isChatInputCommand && context.isChatInputCommand();
    let member, nickname, moderatorTag, moderatorId, client, guild;

    if (isSlash) {
      const user = context.options.getUser('user');
      member = await context.guild.members.fetch(user.id).catch(() => null);
      nickname = context.options.getString('nickname');
      moderatorTag = context.user.tag;
      moderatorId = context.user.id;
      client = context.client;
      guild = context.guild;
    } else {
      // Delete user's command message (after 500ms)
      setTimeout(() => context.delete().catch(() => {}), 500);

      if (!context.member.permissions.has('ManageNicknames')) {
        const msg = await context.reply(`${emojis.error} You do not have permission!`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
        return;
      }
      member = context.mentions.members.first();
      if (!member) {
        const msg = await context.reply(`${emojis.error} Mention a user!`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
        return;
      }
      nickname = args.slice(1).join(' ');
      if (!nickname) {
        const msg = await context.reply(`${emojis.error} Provide a nickname!`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
        return;
      }
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

    const oldNickname = member.nickname || member.user.username;
    const isReset = nickname.toLowerCase() === 'reset';
    const newNickname = isReset ? null : nickname;

    // DM to target
    try {
      const dmEmbed = new EmbedBuilder()
        .setColor(0x9B59B6)
        .setAuthor({
          name: `Nickname changed in ${guild.name}`,
          iconURL: guild.iconURL({ dynamic: true, size: 128 }) || client.user.displayAvatarURL({ dynamic: true, size: 128 })
        })
        .setTitle(`${emojis.nickname} Nickname Changed`)
        .setDescription(`Your nickname has been changed in **${guild.name}**.`)
        .addFields(
          { name: '📝 Old', value: `\`${oldNickname}\``, inline: true },
          { name: '🆕 New', value: isReset ? '`Reset to default`' : `\`${nickname}\``, inline: true }
        )
        .setFooter({ text: 'Powered by Dynamite Music' })
        .setTimestamp();

      await member.user.send({ embeds: [dmEmbed] });
    } catch (err) {}

    // Change nickname
    try {
      await member.setNickname(newNickname);
    } catch (err) {
      const msg = await context.reply(`${emojis.error} Failed to change nickname: ${err.message}`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    // Public embed
    const publicEmbed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setAuthor({
        name: 'Moderation Action',
        iconURL: client.user.displayAvatarURL({ dynamic: true, size: 128 })
      })
      .setTitle(`${emojis.nickname} Nickname Changed`)
      .setDescription(
        `> **${member.user.tag}** nickname updated.\n\n` +
        `**Old:** \`${oldNickname}\`\n` +
        `**New:** ${isReset ? '`Reset to default`' : `\`${nickname}\``}`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
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
      emoji: emojis.nickname,
      title: 'Nickname Changed',
      subtitle: 'A user nickname was changed',
      fields: [
        { name: '👤 User', value: `${member.user.tag} (${member.id})` },
        { name: '🛡️ Moderator', value: `${moderatorTag} (${moderatorId})` },
        { name: '📝 Old Nickname', value: oldNickname },
        { name: '🆕 New Nickname', value: isReset ? 'Reset to default' : nickname },
      ],
    });
  },
};
