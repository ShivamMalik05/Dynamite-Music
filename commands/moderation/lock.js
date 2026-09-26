const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const emojis = require('../../emojis/emojis');
const { sendLog } = require('../../utils/logger');
const { checkPermission } = require('../../utils/permissions');

module.exports = {
  name: 'lock',
  description: 'Lock a channel',
  category: 'Moderation',
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel')
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for locking').setRequired(false))
    .addChannelOption(option =>
      option.setName('channel').setDescription('Channel to lock (defaults to current)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(context, args) {
    if (!(await checkPermission(context, 'lock'))) return;

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
        SendMessages: false,
      });
    } catch (err) {
      const msg = await context.reply(`${emojis.error} Failed to lock: ${err.message}`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
      return;
    }

    // Public embed
    const publicEmbed = new EmbedBuilder()
      .setColor(0xED4245)
      .setAuthor({
        name: 'Moderation Action',
        iconURL: client.user.displayAvatarURL({ dynamic: true, size: 128 })
      })
      .setTitle(`${emojis.lock} Channel Locked`)
      .setDescription(
        `> ${channel} has been locked.\n\n` +
        `**${emojis.reason} Reason:** ${reason}`
      )
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
      emoji: emojis.lock,
      title: 'Channel Locked',
      subtitle: 'A channel was locked',
      fields: [
        { name: '📢 Channel', value: `<#${channel.id}>` },
        { name: '🛡️ Moderator', value: `${moderatorTag} (${moderatorId})` },
        { name: '📝 Reason', value: reason },
      ],
    });
  },
};
