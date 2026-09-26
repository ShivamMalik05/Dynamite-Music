const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const { sendLog } = require('../../utils/logger');
const { checkPermission } = require('../../utils/permissions');

module.exports = {
  name: 'purge',
  description: 'Delete messages in bulk',
  category: 'Moderation',
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete messages in bulk')
    .addIntegerOption(option =>
      option.setName('amount').setDescription('Number of messages (1-100)').setRequired(true))
    .addUserOption(option =>
      option.setName('user').setDescription('Filter by user (optional)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(context, args) {
    if (!(await checkPermission(context, 'purge'))) return;

    const isSlash = context.isChatInputCommand && context.isChatInputCommand();
    let amount, targetUser, moderatorTag, moderatorId, client, channel;

    if (isSlash) {
      amount = context.options.getInteger('amount');
      targetUser = context.options.getUser('user');
      moderatorTag = context.user.tag;
      moderatorId = context.user.id;
      client = context.client;
      channel = context.channel;
    } else {
      // Delete user's command message (after 500ms)
      setTimeout(() => context.delete().catch(() => {}), 500);

      if (!context.member.permissions.has('ManageMessages')) {
        const msg = await context.reply(`${emojis.error} You do not have permission!`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
        return;
      }

      amount = parseInt(args[0]);
      targetUser = context.mentions.users.first() || null;
      moderatorTag = context.author.tag;
      moderatorId = context.author.id;
      client = context.client;
      channel = context.channel;
    }

    if (!amount || amount < 1 || amount > 100) {
      const msg = await context.reply(`${emojis.error} Provide a number between 1 and 100.`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    // Delete messages
    try {
      let deleted;

      if (targetUser) {
        // Filter by user
        const messages = await channel.messages.fetch({ limit: 100 });
        const filtered = messages.filter(m => m.author.id === targetUser.id).first(amount);
        deleted = await channel.bulkDelete(filtered, true);
      } else {
        deleted = await channel.bulkDelete(amount, true);
      }

      // Public embed
      const publicEmbed = new EmbedBuilder()
        .setColor(0xED4245)
        .setAuthor({
          name: 'Moderation Action',
          iconURL: client.user.displayAvatarURL({ dynamic: true, size: 128 })
        })
        .setTitle(`${emojis.purge} Messages Purged`)
        .setDescription(
          `> **${deleted.size}** messages deleted.\n\n` +
          (targetUser ? `**Filter:** ${targetUser.tag}\n` : '') +
          `**Channel:** ${channel}`
        )
        .setFooter({
          text: 'Powered by Dynamite Music',
          iconURL: client.user.displayAvatarURL({ dynamic: true, size: 64 })
        })
        .setTimestamp();

      let sentMsg;
      if (isSlash) {
        sentMsg = await context.reply({ embeds: [publicEmbed], ephemeral: true });
      } else {
        sentMsg = await context.reply({ embeds: [publicEmbed] });
        setTimeout(() => sentMsg.delete().catch(() => {}), 3000);
      }

      // Log
      await sendLog(client, 'moderation', {
        emoji: emojis.purge,
        title: 'Messages Purged',
        subtitle: 'Messages were bulk deleted',
        fields: [
          { name: '📢 Channel', value: `<#${channel.id}>` },
          { name: '🛡️ Moderator', value: `${moderatorTag} (${moderatorId})` },
          { name: '🗑️ Deleted', value: `${deleted.size}` },
          ...(targetUser ? [{ name: '👤 Filter', value: `${targetUser.tag} (${targetUser.id})` }] : []),
        ],
      });
    } catch (err) {
      const msg = await context.reply(`${emojis.error} Failed to delete: ${err.message}. Messages may be older than 14 days.`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
    }
  },
};
