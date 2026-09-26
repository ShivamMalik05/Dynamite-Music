const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const { sendLog } = require('../../utils/logger');
const { checkPermission } = require('../../utils/permissions');

module.exports = {
  name: 'unlock',
  description: 'Unlock a channel',
  category: 'Moderation',
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a channel')
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for unlocking').setRequired(false))
    .addChannelOption(option =>
      option.setName('channel').setDescription('Channel to unlock (defaults to current)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(context, args) {
    if (!(await checkPermission(context, 'unlock'))) return;

    const isSlash = context.isChatInputCommand && context.isChatInputCommand();
    let reason, moderatorTag, moderatorId, client, guild, channel;

    if (isSlash) {
      reason = context.options.getString('reason') || 'No reason provided';
      channel = context.options.getChannel('channel') || context.channel;
      moderatorTag = context.user.tag;
      moderatorId = context.user.id;
      client = context.client;
      guild = context.guild;
    } else {
      // Delete user's command message (after 500ms)
      setTimeout(() => context.delete().catch(() => {}), 500);

      if (!context.member.permissions.has('ManageChannels')) {
        const msg = await context.reply(`${emojis.error} You do not have permission!`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
        return;
      }
      reason = args.join(' ') || 'No reason provided';
      channel = context.channel;
      moderatorTag = context.author.tag;
      moderatorId = context.author.id;
      client = context.client;
      guild = context.guild;
    }

    if (!channel) {
      const msg = await context.reply(`${emojis.error} Channel not found.`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    try {
      await channel.permissionOverwrites.edit(guild.roles.everyone, {
        SendMessages: null,
      });
    } catch (err) {
      const msg = await context.reply(`${emojis.error} Failed to unlock: ${err.message}`);
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
      .setTitle(`${emojis.unlock} Channel Unlocked`)
      .setDescription(
        `> ${channel} has been unlocked.\n\n` +
        `**${emojis.reason} Reason:** ${reason}`
      )
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
      emoji: emojis.unlock,
      title: 'Channel Unlocked',
      subtitle: 'A channel was unlocked',
      fields: [
        { name: '📢 Channel', value: `<#${channel.id}>` },
        { name: '🛡️ Moderator', value: `${moderatorTag} (${moderatorId})` },
        { name: '📝 Reason', value: reason },
      ],
    });
  },
};
